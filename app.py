import os
import requests
import json
import re
from datetime import datetime
from flask import Flask, render_template, request, jsonify, Response, session
import google.generativeai as genai
# from google import genai
import alpaca_trade_api as tradeapi
import yfinance as yf
import plotly.graph_objs as go
import plotly.io as pio
import base64
from io import BytesIO
import secrets
from dotenv import load_dotenv

# --- Initialize Flask App ---
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))
news_api_key = os.getenv('NEWS_API_KEY')
gem_api_key = os.getenv('GEM_API_KEY')

def fetch_news_by_query(query):
    """Fetches news from NewsAPI."""
    base_url = "https://newsapi.org/v2/everything"
    headers = {'X-Api-Key': news_api_key}
    params = {
        'q': query,
        'language': 'en',
        'sortBy': 'publishedAt',
        'pageSize': 20,
    }
    try:
        response = requests.get(base_url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        if data.get('status') != 'ok':
            raise Exception(f"NewsAPI Error: {data.get('message')}")
        return data.get('articles', [])
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching news: {e}")

# --- 2. AI ANALYSIS LOGIC (from your notebook) ---
def get_ai_recommendations(articles):
    """Analyzes articles using Gemini and returns structured JSON."""
    genai.configure(api_key=gem_api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt_template = f"""
    You are an expert financial analyst AI. Your task is to analyze the provided list of news articles to generate investment recommendations.

    Follow these steps precisely:
    1. Read through the entire JSON array of articles provided below.
    2. For each article, identify the primary companies mentioned and the sentiment of the news (Positive, Negative, or Neutral) regarding each company's business prospects.
    3. Synthesize the findings for each company across all articles they appear in.
    4. Based on the overall sentiment and potential business impact, select up to 5 promising stocks to invest in. For each, provide a stock ticker if it's a well-known public company.
    5. Provide a concise 'reasoning' for each recommendation, directly referencing the news content.
    6. Identify at least two 'stocksToAvoid' based on negative news and provide the reasoning.
    7. Your final output must be a single, valid JSON object and nothing else. Do not include any text, explanations, or markdown fences like ```json before or after the JSON block.
    8. If any of the stocks are a crypto currency, Please add "/USD" to the ticker. e.g. "BTC/USD" for Bitcoin.
    Here is the required JSON output structure:
    {{
      "investmentAnalysis": {{
        "stocksToInvest": [
          {{"companyName": "Example Company A", "stockTicker": "EXA", "reasoning": "A brief reason."}}
        ],
        "stocksToAvoid": [
          {{"companyName": "Example Company B", "stockTicker": "EXB", "reasoning": "A brief reason."}}
        ]
      }}
    }}

    ---
    Here are the news articles:
    {json.dumps(articles, indent=2)}
    """
    try:
        response = model.generate_content(prompt_template)
        # Clean the response to ensure it's valid JSON
        # The model sometimes wraps the response in ```json ... ```
        clean_response_text = re.sub(r'```json\s*|\s*```', '', response.text.strip())
        return json.loads(clean_response_text)
    except Exception as e:
        raise Exception(f"Error getting AI analysis: {e}. Raw response: {response.text}")


# --- 3. TRADING LOGIC (from your notebook) ---
def execute_trades(stocks_to_buy, stocks_to_avoid, investment_amount, api_key, api_secret):
    """Executes trades via Alpaca paper trading account."""
    base_url = 'https://paper-api.alpaca.markets'
    api = tradeapi.REST(api_key, api_secret, base_url, api_version='v2')
    
    trade_log = []
    
    # Sell all shares of companies to avoid
    try:
        positions = {pos.symbol: int(float(pos.qty)) for pos in api.list_positions()}
        for stock in stocks_to_avoid:
            symbol = stock.get("stockTicker")
            if symbol.endswith('/USD'):
                symbol = symbol.replace('/', '')
            if symbol and symbol in positions and positions[symbol] > 0:
                api.submit_order(symbol=symbol, qty=positions[symbol], side='sell', type='market', time_in_force='gtc')
                trade_log.append(f"✅ SOLD all {positions[symbol]} shares of {symbol}.")
    except Exception as e:
        trade_log.append(f"⚠️ WARNING: Could not process selling of stocks to avoid. Error: {e}")

    # Distribute funds and buy recommended stocks
    if not stocks_to_buy:
        trade_log.append("No stocks recommended for purchase.")
        return trade_log
        
    n = len(stocks_to_buy)
    weights = [n - i for i in range(n)] # Weighted allocation
    weight_sum = sum(weights)
    allocations = [investment_amount * (w / weight_sum) for w in weights]

    for stock, amount in zip(stocks_to_buy, allocations):
        symbol = stock.get("stockTicker")
        if not symbol:
            trade_log.append(f"ℹ️ SKIPPED: No stock ticker provided for {stock.get('companyName')}.")
            continue
        
        try:
            if symbol.endswith('/USD'):
                # For crypto, use the crypto endpoint
                barset = api.get_crypto_bars(symbol, '5T').df.iloc[-1]
                qty = amount/barset.close
            else: 
                trade = api.get_latest_trade(symbol)
                price = trade.p
                qty = int(amount // price)
            if qty > 0:
                api.submit_order(symbol=symbol, qty=qty, side='buy', type='market', time_in_force='gtc')
                trade_log.append(f"✅ BOUGHT {qty} shares of {symbol} at ~${price:.2f} each.")
            else:
                trade_log.append(f"ℹ️ SKIPPED: Not enough funds (${amount:.2f}) to buy any shares of {symbol} at ${price:.2f}.")
        except Exception as e:
            trade_log.append(f"❌ FAILED to buy {symbol}. Error: {e}")
            
    return trade_log

# Mapping for user-friendly period selection
period_options = {
    '1d':  ('1d', '5m', 'Past Day'),
    '1y':  ('1y', '1d', 'Past Year'),
}

def get_stock_history(symbol, period='1d', interval='5m'):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period, interval=interval)
    return hist

def plot_stock_history_interactive(hist, symbol, period_label):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=hist.index, y=hist['Close'],
        mode='lines', name='Close Price'
    ))
    fig.update_layout(
        title=f"{symbol} Stock Price - {period_label}",
        xaxis_title="Date",
        yaxis_title="Price (USD)",
        hovermode="x unified"
    )
    return pio.to_html(fig, full_html=False)


# --- FLASK ROUTES ---
@app.route('/')
def index():
    """Render the main HTML page."""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """The main endpoint to run the entire workflow."""
    data = request.get_json()
    
    # Extract data from frontend
    query = data.get('query')
    investment_amount = float(data.get('investment_amount', 1000))
    alpaca_api_key = data.get('alpaca_api_key')
    alpaca_secret_key = data.get('alpaca_secret_key')

    if not query:
        return jsonify({"error": "Missing required field. Please provide a search query."}), 400

    try:
        # Step 1: Fetch News
        articles = fetch_news_by_query(query)
        if not articles:
            return jsonify({"error": f"Could not find any articles for the query: '{query}'"}), 404

        # Step 2: Get AI Recommendations
        ai_result = get_ai_recommendations(articles)
        analysis = ai_result.get("investmentAnalysis", {})
        stocks_to_invest = analysis.get("stocksToInvest", [])
        stocks_to_avoid = analysis.get("stocksToAvoid", [])
        
        # Step 3: Execute Trades
        if not alpaca_api_key or not alpaca_secret_key:
            return jsonify({"error": "Missing Alpaca API credentials. Can't buy/sell."}), 400
        trade_log = execute_trades(stocks_to_invest, stocks_to_avoid, investment_amount, alpaca_api_key, alpaca_secret_key)

        return jsonify({
            "analysis": analysis,
            "trade_log": trade_log
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ex http://127.0.0.1:5000/stock-history-interactive?symbol=AAPL&period=1d
@app.route('/stock-history', methods=['GET'])
def stock_history_interactive():
    symbol = request.args.get('symbol', '').upper()
    period_key = request.args.get('period', '1d')
    if not symbol or period_key not in period_options:
        return Response("Missing or invalid parameters.", status=400)
    period, interval, label = period_options[period_key]
    hist = get_stock_history(symbol, period=period, interval=interval)
    if hist.empty:
        return Response(f"No data found for {symbol} - {label}.", status=404)
    html = plot_stock_history_interactive(hist, symbol, label)
    return Response(html, mimetype='text/html')

@app.route('/cash', methods=['GET'])
def get_cash_balance():
    """Fetches the cash balance from Alpaca."""
    api_key = session['alpaca_api_key']
    api_secret = session['alpaca_api_secret']
    if not api_key or not api_secret:
        return jsonify({"error": "Missing Alpaca API credentials."}), 400
    base_url = 'https://paper-api.alpaca.markets'
    try:
        api = tradeapi.REST(api_key, api_secret, base_url, api_version='v2')
        cash = api.get_account().cash
        return jsonify({"cash": cash})
    except Exception as e:
        return jsonify({"error": str(e)}), 401
    
@app.route('/buypower', methods=['GET'])
def get_buy_power():
    """Fetches the cash balance from Alpaca."""
    api_key = session['alpaca_api_key']
    api_secret = session['alpaca_api_secret']
    if not api_key or not api_secret:
        return jsonify({"error": "Missing Alpaca API credentials."}), 400
    base_url = 'https://paper-api.alpaca.markets'
    try:
        api = tradeapi.REST(api_key, api_secret, base_url, api_version='v2')
        buying_power = api.get_account().buying_power
        return jsonify({"buying_power": buying_power})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    api_key = data.get('api_key')
    api_secret = data.get('api_secret')
    base_url = 'https://paper-api.alpaca.markets'

    if not api_key or not api_secret:
        return jsonify({'error': 'Missing API key or secret'}), 400

    # Try to authenticate with Alpaca
    try:
        api = tradeapi.REST(api_key, api_secret, base_url, api_version='v2')
        account = api.get_account()
        # If successful, store credentials in session (not recommended for production)
        session['alpaca_api_key'] = api_key
        session['alpaca_api_secret'] = api_secret
        session['alpaca_base_url'] = base_url
        session['alpaca_user_id'] = account.id
        return jsonify({'message': 'Login successful', 'account_id': account.id})
    except Exception as e:
        return jsonify({'error': 'Invalid Alpaca credentials', 'details': str(e)}), 401

@app.route('/whoami', methods=['GET'])
def whoami():
    if 'alpaca_user_id' in session:
        return jsonify({
            'alpaca_user_id': session['alpaca_user_id'],
            'alpaca_api_key': session['alpaca_api_key'],
            'alpaca_base_url': session['alpaca_base_url']
        })
    else:
        return jsonify({'error': 'Not logged in'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

if __name__ == '__main__':
    load_dotenv()
    app.run(debug=True)
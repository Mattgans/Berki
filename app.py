import os
import requests
import json
import re
from datetime import datetime
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import alpaca_trade_api as tradeapi

# --- Initialize Flask App ---
app = Flask(__name__)

# --- 1. NEWS FETCHING LOGIC (from your notebook) ---
def fetch_news_by_query(query, api_key):
    """Fetches news from NewsAPI."""
    base_url = "https://newsapi.org/v2/everything"
    headers = {'X-Api-Key': api_key}
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
def get_ai_recommendations(articles, api_key):
    """Analyzes articles using Gemini and returns structured JSON."""
    genai.configure(api_key=api_key)
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
    news_api_key = data.get('news_api_key')
    gemini_api_key = data.get('gemini_api_key')
    alpaca_api_key = data.get('alpaca_api_key')
    alpaca_secret_key = data.get('alpaca_secret_key')

    if not all([query, news_api_key, gemini_api_key, alpaca_api_key, alpaca_secret_key]):
        return jsonify({"error": "Missing required fields. Please provide all API keys, a query, and an investment amount."}), 400

    try:
        # Step 1: Fetch News
        articles = fetch_news_by_query(query, news_api_key)
        if not articles:
            return jsonify({"error": f"Could not find any articles for the query: '{query}'"}), 404

        # Step 2: Get AI Recommendations
        ai_result = get_ai_recommendations(articles, gemini_api_key)
        analysis = ai_result.get("investmentAnalysis", {})
        stocks_to_invest = analysis.get("stocksToInvest", [])
        stocks_to_avoid = analysis.get("stocksToAvoid", [])
        
        # Step 3: Execute Trades
        trade_log = execute_trades(stocks_to_invest, stocks_to_avoid, investment_amount, alpaca_api_key, alpaca_secret_key)

        return jsonify({
            "analysis": analysis,
            "trade_log": trade_log
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
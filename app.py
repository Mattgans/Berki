from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import alpaca_trade_api as tradeapi
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# Add your actual API keys here
NEWS_API_KEY = "68f0b4a61fe644c7b90bcc655c84f826"
GEMINI_API_KEY = "AIzaSyDCLQSiHQfXwtbpQ8Uf6AH6DZe6Zz6nOAs"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def fetch_news_by_query(query, api_key):
    """Fetch news articles based on a query."""
    url = f"https://newsapi.org/v2/everything"
    params = {
        'q': query,
        'apiKey': api_key,
        'language': 'en',
        'sortBy': 'publishedAt',
        'pageSize': 10
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data.get('articles', [])
    return []

def get_ai_recommendations(articles, api_key):
    """Get AI investment recommendations based on news articles."""
    # Prepare articles text
    articles_text = ""
    for article in articles[:5]:  # Limit to first 5 articles
        articles_text += f"Title: {article.get('title', '')}\n"
        articles_text += f"Description: {article.get('description', '')}\n\n"
    
    prompt = f"""
    Based on the following news articles, provide investment recommendations in JSON format:

    {articles_text}

    Please respond with a JSON object in this exact format:
    {{
        "investmentAnalysis": {{
            "stocksToInvest": [
                {{
                    "companyName": "Company Name",
                    "stockTicker": "TICKER",
                    "reasoning": "Why to invest"
                }}
            ],
            "stocksToAvoid": [
                {{
                    "companyName": "Company Name", 
                    "stockTicker": "TICKER",
                    "reasoning": "Why to avoid"
                }}
            ]
        }}
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Parse JSON from response
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
            
        return json.loads(response_text)
    except Exception as e:
        print(f"AI recommendation error: {e}")
        return {"investmentAnalysis": {"stocksToInvest": [], "stocksToAvoid": []}}

def execute_trades(stocks_to_invest, stocks_to_avoid, investment_amount, api_key, secret_key):
    """Execute trades via Alpaca API."""
    trade_log = []
    
    try:
        base_url = 'https://paper-api.alpaca.markets'
        api = tradeapi.REST(api_key, secret_key, base_url, api_version='v2')
        
        # Get account info
        account = api.get_account()
        trade_log.append(f"✅ Connected to Alpaca account: {account.id}")
        
        if stocks_to_invest:
            amount_per_stock = investment_amount / len(stocks_to_invest)
            
            for stock in stocks_to_invest:
                try:
                    ticker = stock['stockTicker']
                    # Get current price
                    barset = api.get_bars(ticker, tradeapi.TimeFrame.Day, limit=1)
                    if barset:
                        current_price = float(barset[0].c)
                        qty = int(amount_per_stock / current_price)
                        
                        if qty > 0:
                            # Place buy order
                            order = api.submit_order(
                                symbol=ticker,
                                qty=qty,
                                side='buy',
                                type='market',
                                time_in_force='gtc'
                            )
                            trade_log.append(f"✅ BUY {qty} shares of {ticker} at ${current_price}")
                        else:
                            trade_log.append(f"⚠️ Insufficient funds to buy {ticker}")
                except Exception as e:
                    trade_log.append(f"❌ Failed to buy {ticker}: {str(e)}")
        else:
            trade_log.append("ℹ️ No buy recommendations to execute")
            
    except Exception as e:
        trade_log.append(f"❌ Trading error: {str(e)}")
    
    return trade_log

@app.route('/validate-alpaca', methods=['POST'])
def validate_alpaca():
    """Validate Alpaca credentials."""
    data = request.get_json()
    alpaca_api_key = data.get('alpaca_api_key')
    alpaca_secret_key = data.get('alpaca_secret_key')
    
    if not alpaca_api_key or not alpaca_secret_key:
        return jsonify({"error": "Missing Alpaca credentials"}), 400
    
    try:
        base_url = 'https://paper-api.alpaca.markets'
        api = tradeapi.REST(alpaca_api_key, alpaca_secret_key, base_url, api_version='v2')
        account = api.get_account()
        
        return jsonify({
            "valid": True, 
            "account_id": account.id,
            "buying_power": str(account.buying_power)
        })
    except Exception as e:
        return jsonify({"error": f"Invalid Alpaca credentials: {str(e)}"}), 401

@app.route('/analyze', methods=['POST'])
def analyze():
    """The main endpoint to run the entire workflow."""
    data = request.get_json()
    
    query = data.get('query')
    investment_amount = data.get('investment_amount')
    alpaca_api_key = data.get('alpaca_api_key')
    alpaca_secret_key = data.get('alpaca_secret_key')

    if not query:
        return jsonify({"error": "Missing query field"}), 400
    if not investment_amount:
        return jsonify({"error": "Missing investment_amount field"}), 400
    if not alpaca_api_key:
        return jsonify({"error": "Missing alpaca_api_key field"}), 400
    if not alpaca_secret_key:
        return jsonify({"error": "Missing alpaca_secret_key field"}), 400

    try:
        investment_amount = float(investment_amount)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid investment amount"}), 400

    try:
        # Step 1: Fetch News
        articles = fetch_news_by_query(query, NEWS_API_KEY)
        if not articles:
            return jsonify({"error": f"Could not find any articles for the query: '{query}'"}), 404

        # Step 2: Get AI Recommendations
        ai_result = get_ai_recommendations(articles, GEMINI_API_KEY)
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
    app.run(debug=True, port=5000)
# AI Financial News Analyst & Trader

This is a full-stack web application that automates financial analysis and trading based on real-time news.

**Workflow:**
1.  **Fetches News:** You provide a search query (e.g., "AI stocks", "lithium mining"), and the app fetches the latest relevant news articles using the NewsAPI.
2.  **AI Analysis:** The articles are sent to Google's Gemini AI, which acts as a financial analyst. It identifies key companies, assesses sentiment, and generates investment recommendations (stocks to buy and stocks to avoid).
3.  **Simulated Trading:** Based on the AI's recommendations and a specified investment amount, the app connects to an Alpaca paper trading account to execute trades. It sells stocks on the "avoid" list and buys stocks on the "invest" list.
4.  **Displays Results:** All recommendations and trade actions are displayed clearly on the web interface.

## Setup & Running the Application

### **Step 1: Prerequisites**
Install `uv` for python package management. [Link to docs](https://docs.astral.sh/uv/getting-started/installation/).

Install `npm` to run the ui. [Link to docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### **Step 2: Get API Keys**
You will need API keys from three services. The app has fields to enter these, so you don't need to hardcode them.
- **NewsAPI:** For fetching news articles. [Get a key here](https://newsapi.org/).
- **Google AI (Gemini):** For content generation and analysis. [Get a key here](https://aistudio.google.com/app/apikey).
- **Alpaca:** For paper trading. You need an **API Key** and a **Secret Key**. [Get them here](https://alpaca.markets/).

In in the `api/` directory, create a `.env` file with the following format:
```
NEWS_API_KEY=<my_news_key>
GEMINI_API_KEY=<my_gemini_key>
```

The app will prompt for the Alpaca key upon login.

### **Step 3: Run backend and frontend**

Backend:
1. `cd` into `api`
2. `uv run app.py`

Frontend
1. `cd` into `ui`
2. Install dependencies `npm install`
3. `npm run dev`

### **Step 4: Access the app**
- Open your web browser and go to `localhost:3000`.
- Enter your Alpaca API key, a search query, and the amount you wish to invest (for simulation).
- Click "Analyze & Trade" and watch the results appear.
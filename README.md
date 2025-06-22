# AI Financial News Analyst & Trader

This is a full-stack web application that automates financial analysis and trading based on real-time news.

**Workflow:**
1.  **Fetches News:** You provide a search query (e.g., "AI stocks", "lithium mining"), and the app fetches the latest relevant news articles using the NewsAPI.
2.  **AI Analysis:** The articles are sent to Google's Gemini AI, which acts as a financial analyst. It identifies key companies, assesses sentiment, and generates investment recommendations (stocks to buy and stocks to avoid).
3.  **Simulated Trading:** Based on the AI's recommendations and a specified investment amount, the app connects to an Alpaca paper trading account to execute trades. It sells stocks on the "avoid" list and buys stocks on the "invest" list.
4.  **Displays Results:** All recommendations and trade actions are displayed clearly on the web interface.

## Setup & Running the Application

### **Step 1: Prerequisites**
- Python 3.7+ installed.
- A virtual environment is highly recommended.

### **Step 2: Get API Keys**
You will need API keys from three services. The app has fields to enter these, so you don't need to hardcode them.
- **NewsAPI:** For fetching news articles. [Get a key here](https://newsapi.org/).
- **Google AI (Gemini):** For content generation and analysis. [Get a key here](https://aistudio.google.com/app/apikey).
- **Alpaca:** For paper trading. You need an **API Key** and a **Secret Key**. [Get them here](https://alpaca.markets/).

### **Step 3: Install Dependencies**
Create a file named `requirements.txt` with the contents provided below and run this command in your terminal:
```bash
pip install -r requirements.txt
```

### **Step 4: Run the Flask Server**
After saving all the provided files (`app.py`, `requirements.txt`, and the `templates` and `static` folders), run the following command in your terminal:
```bash
flask run
```

### **Step 5: Use the App**
- Open your web browser and go to `http://127.0.0.1:5000`.
- Enter your API keys, a search query, and the amount you wish to invest (for simulation).
- Click "Analyze & Trade" and watch the results appear.
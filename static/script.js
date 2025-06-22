document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analysis-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('status-text');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');

    // Load API keys from localStorage if they exist
    document.getElementById('news-api-key').value = localStorage.getItem('newsApiKey') || '';
    document.getElementById('gemini-api-key').value = localStorage.getItem('geminiApiKey') || '';
    document.getElementById('alpaca-api-key').value = localStorage.getItem('alpacaApiKey') || '';
    document.getElementById('alpaca-secret-key').value = localStorage.getItem('alpacaSecretKey') || '';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous results and errors
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loader.classList.remove('hidden');
        submitBtn.disabled = true;

        // Get form data
        const payload = {
            query: document.getElementById('search-query').value,
            investment_amount: document.getElementById('investment-amount').value,
            news_api_key: document.getElementById('news-api-key').value,
            gemini_api_key: document.getElementById('gemini-api-key').value,
            alpaca_api_key: document.getElementById('alpaca-api-key').value,
            alpaca_secret_key: document.getElementById('alpaca-secret-key').value,
        };

        // Save API keys to localStorage
        localStorage.setItem('newsApiKey', payload.news_api_key);
        localStorage.setItem('geminiApiKey', payload.gemini_api_key);
        localStorage.setItem('alpacaApiKey', payload.alpaca_api_key);
        localStorage.setItem('alpacaSecretKey', payload.alpaca_secret_key);

        try {
            statusText.textContent = "Fetching news articles...";
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            statusText.textContent = "Analyzing with AI...";
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unknown error occurred.');
            }
            
            statusText.textContent = "Executing trades...";
            displayResults(data);

        } catch (error) {
            displayError(error.message);
        } finally {
            loader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function displayResults(data) {
        const { analysis, trade_log } = data;

        const investContainer = document.getElementById('stocks-to-invest');
        const avoidContainer = document.getElementById('stocks-to-avoid');
        const logContainer = document.getElementById('trade-log');

        investContainer.innerHTML = '';
        avoidContainer.innerHTML = '';

        analysis.stocksToInvest.forEach(stock => {
            investContainer.innerHTML += createStockItem(stock);
        });

        analysis.stocksToAvoid.forEach(stock => {
            avoidContainer.innerHTML += createStockItem(stock);
        });

        logContainer.textContent = trade_log.join('\n');

        resultsDiv.classList.remove('hidden');
    }

    function createStockItem(stock) {
        return `
            <div class="stock-item">
                <strong>${stock.companyName}</strong>
                <span class="ticker">${stock.stockTicker || 'N/A'}</span>
                <p>${stock.reasoning}</p>
            </div>
        `;
    }

    function displayError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.classList.remove('hidden');
    }
});
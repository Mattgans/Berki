"use client"

import { useState } from "react"

interface AnalysisResult {
  query: string
  sentiment: "bullish" | "bearish" | "neutral"
  summary: string
  keyCompanies: string[]
  recommendations: {
    buy: Array<{
      symbol: string
      company: string
      reason: string
      confidence: number
      targetPrice?: string
    }>
    avoid: Array<{
      symbol: string
      company: string
      reason: string
      risk: string
    }>
  }
  investmentAmount: number
  timestamp: string
}

interface StockRecommendationsProps {
  analysisResult: AnalysisResult
  credentials: { apiKey: string; secretKey: string } | null
}

export default function StockRecommendations({ analysisResult, credentials }: StockRecommendationsProps) {
  const [isTrading, setIsTrading] = useState(false)
  const [tradeResults, setTradeResults] = useState<any>(null)

  const handleExecuteTrades = async () => {
    setIsTrading(true)

    try {
      // Simulate API call to execute trades via Alpaca
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock trade results
      const mockTradeResults = {
        executed: true,
        buyOrders: analysisResult.recommendations.buy.map((stock) => ({
          symbol: stock.symbol,
          quantity: Math.floor(analysisResult.investmentAmount / analysisResult.recommendations.buy.length / 300),
          price: "$" + (Math.random() * 500 + 100).toFixed(2),
          status: "filled",
        })),
        sellOrders: analysisResult.recommendations.avoid.map((stock) => ({
          symbol: stock.symbol,
          quantity: Math.floor(Math.random() * 50 + 10),
          price: "$" + (Math.random() * 200 + 50).toFixed(2),
          status: "filled",
        })),
        totalInvested: analysisResult.investmentAmount,
        timestamp: new Date().toISOString(),
      }

      setTradeResults(mockTradeResults)
    } catch (error) {
      console.error("Trade execution failed:", error)
    } finally {
      setIsTrading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "positive"
      case "bearish":
        return "negative"
      default:
        return "neutral"
    }
  }

  return (
    <div className="recommendations-container">
      {/* Analysis Summary */}
      <div className="analysis-summary">
        <div className="summary-header">
          <h3>Analysis Results for "{analysisResult.query}"</h3>
          <div className={`sentiment-badge ${getSentimentColor(analysisResult.sentiment)}`}>
            {analysisResult.sentiment.toUpperCase()}
            {analysisResult.sentiment === "bullish" ? " 📈" : analysisResult.sentiment === "bearish" ? " 📉" : " ➡️"}
          </div>
        </div>
        <p className="summary-text">{analysisResult.summary}</p>

        <div className="key-companies">
          <h4>Key Companies Identified:</h4>
          <div className="companies-list">
            {analysisResult.keyCompanies.map((company, index) => (
              <span key={index} className="company-tag">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {/* Buy Recommendations */}
        <div className="recommendations-section">
          <div className="section-header buy-header">
            <h3>🟢 Recommended Buys ({analysisResult.recommendations.buy.length})</h3>
          </div>
          <div className="recommendations-list">
            {analysisResult.recommendations.buy.map((stock, index) => (
              <div key={index} className="recommendation-card buy-card">
                <div className="stock-header">
                  <div className="stock-symbol">{stock.symbol}</div>
                  <div className="confidence-badge">{stock.confidence}% confidence</div>
                </div>
                <h4 className="company-name">{stock.company}</h4>
                {stock.targetPrice && <div className="target-price">Target: {stock.targetPrice}</div>}
                <p className="recommendation-reason">{stock.reason}</p>
                <button className="btn-buy-stock">Buy {stock.symbol}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Avoid Recommendations */}
        <div className="recommendations-section">
          <div className="section-header avoid-header">
            <h3>🔴 Stocks to Avoid ({analysisResult.recommendations.avoid.length})</h3>
          </div>
          <div className="recommendations-list">
            {analysisResult.recommendations.avoid.map((stock, index) => (
              <div key={index} className="recommendation-card avoid-card">
                <div className="stock-header">
                  <div className="stock-symbol">{stock.symbol}</div>
                  <div className="risk-badge">{stock.risk}</div>
                </div>
                <h4 className="company-name">{stock.company}</h4>
                <p className="recommendation-reason">{stock.reason}</p>
                <button className="btn-sell-stock">Sell {stock.symbol}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execute Trades Section */}
      <div className="trading-section">
        <div className="trading-header">
          <h3>Execute Trades</h3>
          <div className="investment-info">
            Investment Amount: <span className="amount">${analysisResult.investmentAmount.toLocaleString()}</span>
          </div>
        </div>

        {!tradeResults ? (
          <button onClick={handleExecuteTrades} disabled={isTrading} className="btn-execute-trades">
            {isTrading ? (
              <>
                <span className="loading-spinner"></span>
                Executing Trades...
              </>
            ) : (
              <>🚀 Execute All Recommended Trades</>
            )}
          </button>
        ) : (
          <div className="trade-results">
            <div className="results-header">
              <h4>✅ Trades Executed Successfully</h4>
              <div className="execution-time">Executed at {new Date(tradeResults.timestamp).toLocaleTimeString()}</div>
            </div>

            <div className="results-grid">
              <div className="buy-results">
                <h5>Buy Orders ({tradeResults.buyOrders.length})</h5>
                {tradeResults.buyOrders.map((order: any, index: number) => (
                  <div key={index} className="order-result">
                    <span className="order-symbol">{order.symbol}</span>
                    <span className="order-details">
                      {order.quantity} shares @ {order.price}
                    </span>
                    <span className="order-status success">✅ {order.status}</span>
                  </div>
                ))}
              </div>

              <div className="sell-results">
                <h5>Sell Orders ({tradeResults.sellOrders.length})</h5>
                {tradeResults.sellOrders.map((order: any, index: number) => (
                  <div key={index} className="order-result">
                    <span className="order-symbol">{order.symbol}</span>
                    <span className="order-details">
                      {order.quantity} shares @ {order.price}
                    </span>
                    <span className="order-status success">✅ {order.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="total-invested">
              Total Invested: <span className="amount">${tradeResults.totalInvested.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

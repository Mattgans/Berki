"use client"

interface AnalysisResult {
  query: string
  investmentAmount: number
  analysis: {
    stocksToInvest: Array<{
      companyName: string
      stockTicker: string
      reasoning: string
    }>
    stocksToAvoid: Array<{
      companyName: string
      stockTicker: string
      reasoning: string
    }>
  }
  tradeLog: string[]
  timestamp: string
}

interface StockRecommendationsProps {
  analysisResult: AnalysisResult
}

export default function StockRecommendations({ analysisResult }: StockRecommendationsProps) {
  const getLogItemStyle = (logItem: string) => {
    if (logItem.includes("✅")) return "success"
    if (logItem.includes("❌")) return "error"
    if (logItem.includes("⚠️")) return "warning"
    return "info"
  }

  const getLogIcon = (logItem: string) => {
    if (logItem.includes("✅")) return "✅"
    if (logItem.includes("❌")) return "❌"
    if (logItem.includes("⚠️")) return "⚠️"
    if (logItem.includes("ℹ️")) return "ℹ️"
    return "📝"
  }

  return (
    <div className="recommendations-container">
      {/* Analysis Summary */}
      <div className="analysis-summary">
        <div className="summary-header">
          <h3>Analysis Results for "{analysisResult.query}"</h3>
          <div className="timestamp">Completed at {new Date(analysisResult.timestamp).toLocaleTimeString()}</div>
        </div>

        <div className="investment-summary">
          <span className="investment-label">Investment Amount:</span>
          <span className="investment-amount">${analysisResult.investmentAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {/* Buy Recommendations */}
        <div className="recommendations-section">
          <div className="section-header buy-header">
            <h3>🟢 AI Recommended Buys ({analysisResult.analysis.stocksToInvest.length})</h3>
          </div>
          <div className="recommendations-list">
            {analysisResult.analysis.stocksToInvest.length > 0 ? (
              analysisResult.analysis.stocksToInvest.map((stock, index) => (
                <div key={index} className="recommendation-card buy-card">
                  <div className="stock-header">
                    <div className="stock-symbol">{stock.stockTicker}</div>
                    <div className="rank-badge">#{index + 1}</div>
                  </div>
                  <h4 className="company-name">{stock.companyName}</h4>
                  <p className="recommendation-reason">{stock.reasoning}</p>
                </div>
              ))
            ) : (
              <div className="no-recommendations">No buy recommendations generated</div>
            )}
          </div>
        </div>

        {/* Avoid Recommendations */}
        <div className="recommendations-section">
          <div className="section-header avoid-header">
            <h3>🔴 Stocks to Avoid ({analysisResult.analysis.stocksToAvoid.length})</h3>
          </div>
          <div className="recommendations-list">
            {analysisResult.analysis.stocksToAvoid.length > 0 ? (
              analysisResult.analysis.stocksToAvoid.map((stock, index) => (
                <div key={index} className="recommendation-card avoid-card">
                  <div className="stock-header">
                    <div className="stock-symbol">{stock.stockTicker}</div>
                    <div className="risk-badge">Risk</div>
                  </div>
                  <h4 className="company-name">{stock.companyName}</h4>
                  <p className="recommendation-reason">{stock.reasoning}</p>
                </div>
              ))
            ) : (
              <div className="no-recommendations">No avoid recommendations generated</div>
            )}
          </div>
        </div>
      </div>

      {/* Trade Execution Results */}
      <div className="trading-section">
        <div className="trading-header">
          <h3>🚀 Trade Execution Results</h3>
          <div className="execution-info">{analysisResult.tradeLog.length} trade actions executed</div>
        </div>

        <div className="trade-log">
          {analysisResult.tradeLog.map((logItem, index) => (
            <div key={index} className={`log-item ${getLogItemStyle(logItem)}`}>
              <span className="log-icon">{getLogIcon(logItem)}</span>
              <span className="log-text">{logItem.replace(/[✅❌⚠️ℹ️]/g, "").trim()}</span>
            </div>
          ))}
        </div>

        {analysisResult.tradeLog.length === 0 && (
          <div className="no-trades">No trades were executed. Check your API keys and try again.</div>
        )}
      </div>
    </div>
  )
}

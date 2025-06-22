"use client"

import { useState, useEffect } from "react"
import ThemeToggle from "./theme-toggle"
import NewsAnalysis from "./news-analysis"
import StockChart from "./stock-chart"

interface DashboardProps {
  credentials: { apiKey: string; secretKey: string } | null
  onLogout: () => void
}

export default function Dashboard({ credentials, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "stocks" | "crypto" | "news">("analysis")

  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(false)
  const [portfolioError, setPortfolioError] = useState("")

  // Popular stocks to show when no portfolio data is available
  const popularStocks = [
    { symbol: "AAPL", name: "Apple Inc.", logo: "🍎" },
    { symbol: "MSFT", name: "Microsoft Corp.", logo: "🪟" },
    { symbol: "GOOGL", name: "Alphabet Inc.", logo: "🔍" },
    { symbol: "AMZN", name: "Amazon.com Inc.", logo: "📦" },
    { symbol: "TSLA", name: "Tesla Inc.", logo: "🚗" },
    { symbol: "NVDA", name: "NVIDIA Corp.", logo: "🎮" },
    { symbol: "META", name: "Meta Platforms", logo: "📘" },
    { symbol: "NFLX", name: "Netflix Inc.", logo: "🎬" },
  ]

  const fetchPortfolio = async () => {
    if (!credentials) return

    setPortfolioLoading(true)
    setPortfolioError("")

    try {
      const response = await fetch("http://localhost:5000/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alpaca_api_key: credentials.apiKey,
          alpaca_secret_key: credentials.secretKey,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolioData(data)
      } else {
        const errorData = await response.json()
        setPortfolioError(errorData.error || "Failed to fetch portfolio")
      }
    } catch (err: any) {
      console.warn("Portfolio fetch failed, showing popular stocks")
      setPortfolioError("Backend not available - showing popular stocks")
    } finally {
      setPortfolioLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "stocks" && credentials) {
      fetchPortfolio()
    }
  }, [activeTab, credentials])

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="brand">TradeSim Pro</h1>
          </div>

          <div className="nav-tabs">
            <ThemeToggle />
            <button
              className={`nav-tab ${activeTab === "analysis" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("analysis")}
            >
              🤖 AI Analysis
            </button>
            <button
              className={`nav-tab ${activeTab === "stocks" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("stocks")}
            >
              📈 Stocks
            </button>
            <button
              className={`nav-tab ${activeTab === "crypto" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("crypto")}
            >
              💰 Crypto
            </button>
            <button
              className={`nav-tab ${activeTab === "news" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("news")}
            >
              📰 News
            </button>
            <button className="btn-logout" onClick={onLogout}>
              <span>↗️</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "analysis" && <NewsAnalysis credentials={credentials} />}

        {activeTab === "stocks" && (
          <div className="content-grid">
            {/* Portfolio Overview */}
            <div className="stocks-section">
              <div className="portfolio-overview">
                <h2>Stock Market Dashboard</h2>
                {portfolioLoading && <div className="loading">Loading portfolio...</div>}
                {portfolioError && <div className="error-message">⚠️ {portfolioError}</div>}

                {portfolioData && (
                  <div className="portfolio-summary">
                    <div className="summary-cards">
                      <div className="summary-card">
                        <h3>Total Portfolio Value</h3>
                        <p className="value">${portfolioData.account.portfolio_value.toLocaleString()}</p>
                        <div className={`change ${portfolioData.account.daychange >= 0 ? "positive" : "negative"}`}>
                          <span>{portfolioData.account.daychange >= 0 ? "📈" : "📉"}</span>
                          <span>
                            ${Math.abs(portfolioData.account.daychange).toFixed(2)} (
                            {portfolioData.account.daychange_percent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>

                      <div className="summary-card">
                        <h3>Cash Balance</h3>
                        <p className="value">${portfolioData.account.cash.toLocaleString()}</p>
                      </div>

                      <div className="summary-card">
                        <h3>Buying Power</h3>
                        <p className="value">${portfolioData.account.buying_power.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Holdings or Popular Stocks */}
              <div className="holdings-section">
                <h3>{portfolioData?.holdings?.length > 0 ? "Current Holdings" : "Popular Stocks"}</h3>

                {portfolioData?.holdings?.length > 0 ? (
                  <div className="holdings-with-charts">
                    {portfolioData.holdings.map((holding: any, index: number) => (
                      <div key={index} className="holding-card-with-chart">
                        <div className="holding-info">
                          <div className="holding-header">
                            <div className="stock-symbol">{holding.symbol}</div>
                            <div className={`holding-change ${holding.unrealized_pl >= 0 ? "positive" : "negative"}`}>
                              <span>{holding.unrealized_pl >= 0 ? "📈" : "📉"}</span>
                              <span>{holding.unrealized_plpc.toFixed(2)}%</span>
                            </div>
                          </div>

                          <div className="holding-details">
                            <p>
                              <strong>Quantity:</strong> {holding.qty}
                            </p>
                            <p>
                              <strong>Current Price:</strong> ${holding.current_price.toFixed(2)}
                            </p>
                            <p>
                              <strong>Market Value:</strong> ${holding.market_value.toLocaleString()}
                            </p>
                            <p>
                              <strong>Unrealized P&L:</strong>
                              <span className={holding.unrealized_pl >= 0 ? "positive" : "negative"}>
                                ${holding.unrealized_pl.toFixed(2)}
                              </span>
                            </p>
                          </div>

                          <div className="holding-actions">
                            <button className="btn-sell">Sell</button>
                            <button className="btn-buy">Buy More</button>
                          </div>
                        </div>

                        <div className="holding-chart">
                          <StockChart symbol={holding.symbol} currentPrice={holding.current_price} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="popular-stocks-grid">
                    {popularStocks.map((stock, index) => (
                      <div key={index} className="popular-stock-card">
                        <div className="stock-header">
                          <div className="stock-logo">
                            <span>{stock.logo}</span>
                          </div>
                          <div className="stock-info">
                            <h4>{stock.symbol}</h4>
                            <p>{stock.name}</p>
                          </div>
                        </div>

                        <div className="stock-chart-wrapper">
                          <StockChart symbol={stock.symbol} companyName={stock.name} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              {portfolioData?.recent_orders?.length > 0 && (
                <div className="recent-orders">
                  <h3>Recent Orders</h3>
                  <div className="orders-list">
                    {portfolioData.recent_orders.map((order: any, index: number) => (
                      <div key={index} className="order-item">
                        <div className="order-symbol">{order.symbol}</div>
                        <div className="order-details">
                          <span className={`order-side ${order.side}`}>{order.side.toUpperCase()}</span>
                          <span>{order.qty} shares</span>
                          <span className={`order-status ${order.status}`}>{order.status}</span>
                          {order.filled_avg_price && <span>@ ${order.filled_avg_price.toFixed(2)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Sidebar */}
            <div className="portfolio-section">
              <div className="portfolio-card">
                <div className="portfolio-header">
                  <div className="portfolio-icon">
                    <span>⚡</span>
                  </div>
                  <h3 className="portfolio-title">Quick Actions</h3>
                </div>

                <div className="quick-actions">
                  <button className="action-btn" onClick={fetchPortfolio}>
                    🔄 Refresh Portfolio
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab("analysis")}>
                    🤖 Get AI Analysis
                  </button>
                  <button className="action-btn">📊 View Market Overview</button>
                  <button className="action-btn">🔍 Search Stocks</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "crypto" && (
          <div className="coming-soon">
            <h2>Crypto Trading</h2>
            <p>Coming soon...</p>
          </div>
        )}

        {activeTab === "news" && (
          <div className="coming-soon">
            <h2>Latest News</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">TradeSim Pro - AI-Powered Trading Simulation</p>
        </div>
      </footer>
    </div>
  )
}

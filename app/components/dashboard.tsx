"use client"

import { useState } from "react"
import ThemeToggle from "./theme-toggle"
import NewsAnalysis from "./news-analysis"

interface DashboardProps {
  credentials: { apiKey: string; secretKey: string } | null
  onLogout: () => void
}

export default function Dashboard({ credentials, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "stocks" | "crypto" | "news">("analysis")

  const stocks = [
    {
      name: "Apple Inc. (AAPL)",
      type: "Stock",
      price: "$145.79",
      change: "-1.56 (-1.07%)",
      isPositive: false,
      logo: "🍎",
    },
    {
      name: "Microsoft Corp. (MSFT)",
      type: "Stock",
      price: "$304.38",
      change: "+1.57 (+0.52%)",
      isPositive: true,
      logo: "🪟",
    },
    {
      name: "Alphabet Inc. (GOOGL)",
      type: "Stock",
      price: "$2555.13",
      change: "-32.89 (-1.29%)",
      isPositive: false,
      logo: "🔍",
    },
    {
      name: "Amazon.com Inc. (AMZN)",
      type: "Stock",
      price: "$2918.87",
      change: "+17.08 (+0.59%)",
      isPositive: true,
      logo: "📦",
    },
    {
      name: "Tesla Inc. (TSLA)",
      type: "Stock",
      price: "$1023.03",
      change: "-12.70 (-1.24%)",
      isPositive: false,
      logo: "🚗",
    },
  ]

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
            {/* Stock Market Section */}
            <div className="stocks-section">
              <h2>Stock Market</h2>
              <div className="stocks-grid">
                {stocks.map((stock, index) => (
                  <div key={index} className="stock-card">
                    <div className="stock-header">
                      <div className="stock-logo">
                        <span>{stock.logo}</span>
                      </div>
                      <div className="stock-info">
                        <h3>{stock.name}</h3>
                        <p>{stock.type}</p>
                      </div>
                    </div>

                    <div className="stock-price">
                      <p className="price">{stock.price}</p>
                      <div className={`stock-change ${stock.isPositive ? "positive" : "negative"}`}>
                        <span className="change-icon">{stock.isPositive ? "📈" : "📉"}</span>
                        <span>{stock.change}</span>
                      </div>
                    </div>

                    <div className="stock-actions">
                      <button className="btn-buy">Buy</button>
                      <button className="btn-sell">Sell</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Sidebar */}
            <div className="portfolio-section">
              <div className="portfolio-card">
                <div className="portfolio-header">
                  <div className="portfolio-icon">
                    <span>📊</span>
                  </div>
                  <h3 className="portfolio-title">My Portfolio</h3>
                </div>

                <div className="portfolio-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total Account Value:</span>
                    <span className="stat-value">$100000.00</span>
                  </div>

                  <div className="stat-row">
                    <span className="stat-label">Cash Balance:</span>
                    <span className="stat-value positive">$100000.00</span>
                  </div>

                  <div className="stat-row">
                    <span className="stat-label">Holdings Value:</span>
                    <span className="stat-value">$0.00</span>
                  </div>

                  <div className="portfolio-divider">
                    <p className="no-assets">No assets in portfolio.</p>
                  </div>
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

"use client"

import { useState } from "react"
import StockRecommendations from "./stock-recommendations"

interface NewsAnalysisProps {
  credentials: { apiKey: string; secretKey: string } | null
}

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

export default function NewsAnalysis({ credentials }: NewsAnalysisProps) {
  const [query, setQuery] = useState("")
  const [investmentAmount, setInvestmentAmount] = useState(10000)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("Please enter a search topic")
      return
    }

    if (!credentials?.apiKey || !credentials?.secretKey) {
      setError("Missing Alpaca credentials")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      // Call your Flask backend with Alpaca credentials from login
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          investment_amount: investmentAmount,
          alpaca_api_key: credentials.apiKey,
          alpaca_secret_key: credentials.secretKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()

      const result: AnalysisResult = {
        query,
        investmentAmount,
        analysis: data.analysis,
        tradeLog: data.trade_log,
        timestamp: new Date().toISOString(),
      }

      setAnalysisResult(result)
    } catch (err: any) {
      if (err.message.includes("fetch")) {
        setError("Cannot connect to backend server. Make sure your Flask app is running on http://localhost:5000")
      } else {
        setError(err.message || "Failed to analyze news. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>AI News Analysis & Trading</h2>
        <p className="analysis-description">
          Enter a topic to analyze latest news and execute AI-powered trades using your Alpaca account
        </p>
      </div>

      <div className="analysis-form">
        <div className="analysis-params">
          <h3>Analysis Parameters</h3>
          <div className="form-row">
            <div className="form-group flex-grow">
              <label htmlFor="query" className="form-label">
                Search Topic
              </label>
              <input
                id="query"
                type="text"
                placeholder="e.g., AI stocks, lithium mining, renewable energy"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input"
                disabled={isAnalyzing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="investment" className="form-label">
                Investment Amount ($)
              </label>
              <input
                id="investment"
                type="number"
                placeholder="10000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="form-input investment-input"
                disabled={isAnalyzing}
              />
            </div>

            <div className="form-group">
              <button onClick={handleAnalyze} disabled={isAnalyzing || !query.trim()} className="btn-analyze">
                {isAnalyzing ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>🤖 Analyze & Trade</>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}
      </div>

      {isAnalyzing && (
        <div className="analysis-loading">
          <div className="loading-steps">
            <div className="loading-step">
              <span className="step-icon">📰</span>
              <span>Fetching latest news articles...</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">🤖</span>
              <span>AI analyzing market sentiment...</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">📊</span>
              <span>Generating investment recommendations...</span>
            </div>
            <div className="loading-step">
              <span className="step-icon">🚀</span>
              <span>Executing trades via Alpaca...</span>
            </div>
          </div>
        </div>
      )}

      {analysisResult && <StockRecommendations analysisResult={analysisResult} />}
    </div>
  )
}

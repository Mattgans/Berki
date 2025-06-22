"use client"

import { useState } from "react"
import StockRecommendations from "./stock-recommendations"

interface NewsAnalysisProps {
  credentials: { apiKey: string; secretKey: string } | null
}

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

    setIsAnalyzing(true)
    setError("")

    try {
      // Simulate API call to your backend
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock analysis result - replace with actual API call
      const mockResult: AnalysisResult = {
        query,
        sentiment: "bullish",
        summary: `Analysis of "${query}" shows positive market sentiment with several growth opportunities. Key trends include increased adoption, regulatory clarity, and strong financial performance across major players.`,
        keyCompanies: ["NVIDIA Corp", "Microsoft Corp", "Alphabet Inc", "Tesla Inc", "Advanced Micro Devices"],
        recommendations: {
          buy: [
            {
              symbol: "NVDA",
              company: "NVIDIA Corp",
              reason: "Leading AI chip manufacturer with strong growth prospects",
              confidence: 85,
              targetPrice: "$850",
            },
            {
              symbol: "MSFT",
              company: "Microsoft Corp",
              reason: "Strong AI integration across products and cloud services",
              confidence: 78,
              targetPrice: "$420",
            },
            {
              symbol: "GOOGL",
              company: "Alphabet Inc",
              reason: "Significant AI investments and market position",
              confidence: 72,
              targetPrice: "$2800",
            },
          ],
          avoid: [
            {
              symbol: "INTC",
              company: "Intel Corp",
              reason: "Lagging behind in AI chip development",
              risk: "High competition risk",
            },
            {
              symbol: "IBM",
              company: "IBM Corp",
              reason: "Slow adaptation to AI trends",
              risk: "Market share decline",
            },
          ],
        },
        investmentAmount,
        timestamp: new Date().toISOString(),
      }

      setAnalysisResult(mockResult)
    } catch (err) {
      setError("Failed to analyze news. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>AI News Analysis & Trading</h2>
        <p className="analysis-description">
          Enter a topic to analyze latest news and get AI-powered investment recommendations
        </p>
      </div>

      <div className="analysis-form">
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
              Investment Amount
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
                <>🤖 Analyze</>
              )}
            </button>
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
          </div>
        </div>
      )}

      {analysisResult && <StockRecommendations analysisResult={analysisResult} credentials={credentials} />}
    </div>
  )
}

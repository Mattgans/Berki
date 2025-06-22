"use client"

import type React from "react"
import { useState } from "react"

interface LoginScreenProps {
  onLogin: (alpacaApiKey: string, alpacaSecretKey: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [alpacaApiKey, setAlpacaApiKey] = useState("")
  const [alpacaSecretKey, setAlpacaSecretKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!alpacaApiKey.trim() || !alpacaSecretKey.trim()) {
      setError("Both Alpaca API key and secret key are required")
      return
    }

    setIsLoading(true)

    try {
      // Validate Alpaca credentials by making a test API call
      const response = await fetch("http://localhost:5000/validate-alpaca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alpaca_api_key: alpacaApiKey,
          alpaca_secret_key: alpacaSecretKey,
        }),
      })

      if (response.ok) {
        onLogin(alpacaApiKey, alpacaSecretKey)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Invalid Alpaca credentials")
      }
    } catch (err) {
      // If backend is not running, allow login for demo purposes
      console.warn("Backend not available, allowing demo login")
      if (alpacaApiKey.length >= 8 && alpacaSecretKey.length >= 8) {
        onLogin(alpacaApiKey, alpacaSecretKey)
      } else {
        setError("Alpaca credentials must be at least 8 characters long")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span>📈</span>
          </div>
          <h1 className="login-title">TradeSim Pro Login</h1>
          <p className="login-description">Enter your Alpaca trading credentials to access the platform</p>
        </div>
        <div className="login-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="alpacaApiKey" className="form-label">
                Alpaca API Key
              </label>
              <div className="input-container">
                <span className="input-icon">🔑</span>
                <input
                  id="alpacaApiKey"
                  type="text"
                  placeholder="Enter your Alpaca API key"
                  value={alpacaApiKey}
                  onChange={(e) => setAlpacaApiKey(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="alpacaSecretKey" className="form-label">
                Alpaca Secret Key
              </label>
              <div className="input-container">
                <span className="input-icon">🛡️</span>
                <input
                  id="alpacaSecretKey"
                  type="password"
                  placeholder="Enter your Alpaca secret key"
                  value={alpacaSecretKey}
                  onChange={(e) => setAlpacaSecretKey(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Validating..." : "Sign In"}
            </button>
          </form>

          <div className="demo-credentials">
            <p>Demo credentials for testing:</p>
            <p className="demo-key">API Key: demo-alpaca-key-12345</p>
            <p className="demo-key">Secret: demo-alpaca-secret-67890</p>
          </div>
        </div>
      </div>
    </div>
  )
}

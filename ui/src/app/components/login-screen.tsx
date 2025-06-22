"use client"

import type React from "react"
import { useState } from "react"

interface LoginScreenProps {
  onLogin: (apiKey: string, secretKey: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey.trim() || !secretKey.trim()) {
      setError("Both API key and secret key are required")
      return
    }

    setIsLoading(true)

    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo purposes, accept any non-empty keys
    if (apiKey.length >= 8 && secretKey.length >= 8) {
      onLogin(apiKey, secretKey)
    } else {
      setError("Invalid credentials. Keys must be at least 8 characters long.")
    }

    setIsLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span>🛡️</span>
          </div>
          <h1 className="login-title">API Authentication</h1>
          <p className="login-description">Enter your API credentials to access the dashboard</p>
        </div>
        <div className="login-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="apiKey" className="form-label">
                API Key
              </label>
              <div className="input-container">
                <span className="input-icon">🔑</span>
                <input
                  id="apiKey"
                  type="text"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="secretKey" className="form-label">
                Secret Key
              </label>
              <div className="input-container">
                <span className="input-icon">🛡️</span>
                <input
                  id="secretKey"
                  type="password"
                  placeholder="Enter your secret key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="demo-credentials">
            <p>Demo credentials:</p>
            <p className="demo-key">API Key: demo-api-key-12345</p>
            <p className="demo-key">Secret: demo-secret-key-67890</p>
          </div>
        </div>
      </div>
    </div>
  )
}

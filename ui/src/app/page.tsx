"use client"

import { useState, useEffect } from "react"
import LoginScreen from "./components/login-screen"
import Dashboard from "./components/dashboard"
import { ThemeProvider } from "./components/theme-provider"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [alpacaCredentials, setAlpacaCredentials] = useState<{ apiKey: string; secretKey: string } | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const savedCredentials = localStorage.getItem("alpacaCredentials")
    if (savedCredentials) {
      const parsed = JSON.parse(savedCredentials)
      setAlpacaCredentials(parsed)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (alpacaApiKey: string, alpacaSecretKey: string) => {
    const creds = { apiKey: alpacaApiKey, secretKey: alpacaSecretKey }
    setAlpacaCredentials(creds)
    setIsAuthenticated(true)
    localStorage.setItem("alpacaCredentials", JSON.stringify(creds))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAlpacaCredentials(null)
    localStorage.removeItem("alpacaCredentials")
  }

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard credentials={alpacaCredentials} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  )
}

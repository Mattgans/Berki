"use client"

import { useState, useEffect } from "react"
import LoginScreen from "./components/login-screen"
import Dashboard from "./components/dashboard"
import { ThemeProvider } from "./components/theme-provider"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState<{ apiKey: string; secretKey: string } | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const savedCredentials = localStorage.getItem("apiCredentials")
    if (savedCredentials) {
      const parsed = JSON.parse(savedCredentials)
      setCredentials(parsed)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (apiKey: string, secretKey: string) => {
    const creds = { apiKey, secretKey }
    setCredentials(creds)
    setIsAuthenticated(true)
    localStorage.setItem("apiCredentials", JSON.stringify(creds))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCredentials(null)
    localStorage.removeItem("apiCredentials")
  }

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard credentials={credentials} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  )
}

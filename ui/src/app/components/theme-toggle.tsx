"use client"

import { useTheme } from "./theme-provider"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <label className="theme-toggle">
      <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
      <span className="theme-slider">
        <span className="theme-icons sun-icon">☀️</span>
        <span className="theme-icons moon-icon">🌙</span>
      </span>
    </label>
  )
}

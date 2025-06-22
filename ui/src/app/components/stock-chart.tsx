"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface StockChartProps {
  symbol: string
  currentPrice?: number
  companyName?: string
}

interface ChartData {
  timestamp: string
  date: string
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockQuote {
  symbol: string
  company_name: string
  current_price: number
  previous_close: number
  change: number
  change_percent: number
  volume: number
  market_cap: number
  pe_ratio: number
  day_high: number
  day_low: number
  fifty_two_week_high: number
  fifty_two_week_low: number
}

export default function StockChart({ symbol, currentPrice, companyName }: StockChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState("1Day")
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const fetchStockHistory = async (tf: string) => {
    if (!symbol) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/stock-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol,
          timeframe: tf,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setChartData(data.data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch chart data")
      }
    } catch (err: any) {
      // Generate mock data if backend is unavailable
      const mockData = generateMockData(symbol, tf)
      setChartData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockQuote = async () => {
    if (!symbol) return

    try {
      const response = await fetch("http://localhost:5000/stock-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStockQuote(data)
      }
    } catch (err: any) {
      console.warn("Failed to fetch stock quote:", err)
    }
  }

  const generateMockData = (symbol: string, timeframe: string): ChartData[] => {
    const basePrice = currentPrice || Math.random() * 200 + 50
    const dataPoints = timeframe === "1Day" ? 30 : timeframe === "1Hour" ? 24 : 100
    const data: ChartData[] = []

    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date()
      if (timeframe === "1Day") {
        date.setDate(date.getDate() - i)
      } else if (timeframe === "1Hour") {
        date.setHours(date.getHours() - i)
      } else {
        date.setMinutes(date.getMinutes() - i * 5)
      }

      const variation = (Math.random() - 0.5) * 0.1
      const price = basePrice * (1 + variation * (i / dataPoints))
      const open = price * (1 + (Math.random() - 0.5) * 0.02)
      const close = price * (1 + (Math.random() - 0.5) * 0.02)
      const high = Math.max(open, close) * (1 + Math.random() * 0.02)
      const low = Math.min(open, close) * (1 - Math.random() * 0.02)

      data.push({
        timestamp: date.toISOString(),
        date: date.toISOString().split("T")[0],
        time: date.toTimeString().split(" ")[0].substring(0, 5),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
      })
    }

    return data
  }

  useEffect(() => {
    fetchStockHistory(timeframe)
    fetchStockQuote()
  }, [symbol, timeframe])

  const formatTooltipValue = (value: any, name: string) => {
    if (name === "close") return [`$${Number(value).toFixed(2)}`, "Price"]
    if (name === "volume") return [Number(value).toLocaleString(), "Volume"]
    return [value, name]
  }

  const formatXAxisLabel = (tickItem: string, index: number) => {
    if (!chartData[index]) return ""
    return timeframe === "1Day" ? chartData[index].date.split("-")[2] : chartData[index].time
  }

  const getStockColor = () => {
    if (stockQuote) {
      return stockQuote.change >= 0 ? "#10b981" : "#ef4444"
    }
    if (chartData.length < 2) return "#14b8a6"
    const firstPrice = chartData[0].close
    const lastPrice = chartData[chartData.length - 1].close
    return lastPrice >= firstPrice ? "#10b981" : "#ef4444"
  }

  const displayPrice = stockQuote?.current_price || currentPrice || 0
  const displayName = stockQuote?.company_name || companyName || symbol

  return (
    <div className="stock-chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <h4>{symbol}</h4>
          <span className="company-name">{displayName}</span>
          {displayPrice > 0 && <span className="current-price">${displayPrice.toFixed(2)}</span>}
          {stockQuote && (
            <div className={`price-change ${stockQuote.change >= 0 ? "positive" : "negative"}`}>
              <span>{stockQuote.change >= 0 ? "📈" : "📉"}</span>
              <span>
                ${Math.abs(stockQuote.change).toFixed(2)} ({stockQuote.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="chart-controls">
          <div className="timeframe-selector">
            {["5Min", "1Hour", "1Day", "1Week"].map((tf) => (
              <button
                key={tf}
                className={`timeframe-btn ${timeframe === tf ? "active" : ""}`}
                onClick={() => setTimeframe(tf)}
                disabled={loading}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="chart-type-selector">
            <button
              className={`chart-type-btn ${chartType === "line" ? "active" : ""}`}
              onClick={() => setChartType("line")}
              title="Line Chart"
            >
              📈
            </button>
            <button
              className={`chart-type-btn ${chartType === "area" ? "active" : ""}`}
              onClick={() => setChartType("area")}
              title="Area Chart"
            >
              📊
            </button>
          </div>
        </div>
      </div>

      <div className="chart-content">
        {loading && <div className="chart-loading">Loading chart data...</div>}
        {error && <div className="chart-error">⚠️ {error}</div>}

        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getStockColor()} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getStockColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" tickFormatter={formatXAxisLabel} stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="var(--text-muted)"
                  fontSize={12}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload
                      return `${data.date} ${data.time}`
                    }
                    return label
                  }}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    color: "var(--text-primary)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={getStockColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#colorPrice-${symbol})`}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" tickFormatter={formatXAxisLabel} stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="var(--text-muted)"
                  fontSize={12}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload
                      return `${data.date} ${data.time}`
                    }
                    return label
                  }}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    color: "var(--text-primary)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={getStockColor()}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: getStockColor() }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div className="no-chart-data">No chart data available for {symbol}</div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">High:</span>
            <span className="stat-value">${Math.max(...chartData.map((d) => d.high)).toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Low:</span>
            <span className="stat-value">${Math.min(...chartData.map((d) => d.low)).toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Volume:</span>
            <span className="stat-value">{chartData[chartData.length - 1]?.volume.toLocaleString()}</span>
          </div>
        </div>
      )}

      {stockQuote && (
        <div className="stock-details">
          <div className="detail-row">
            <span className="detail-label">Market Cap:</span>
            <span className="detail-value">
              {stockQuote.market_cap > 0 ? `$${(stockQuote.market_cap / 1e9).toFixed(2)}B` : "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">P/E Ratio:</span>
            <span className="detail-value">{stockQuote.pe_ratio > 0 ? stockQuote.pe_ratio.toFixed(2) : "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">52W High:</span>
            <span className="detail-value">
              {stockQuote.fifty_two_week_high > 0 ? `$${stockQuote.fifty_two_week_high.toFixed(2)}` : "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">52W Low:</span>
            <span className="detail-value">
              {stockQuote.fifty_two_week_low > 0 ? `$${stockQuote.fifty_two_week_low.toFixed(2)}` : "N/A"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

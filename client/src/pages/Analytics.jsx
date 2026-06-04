import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import '../styles/Analytics.css'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.analytics()
      .then(setAnalytics)
      .catch((err) => setError(err.detail || err.message))
  }, [])

  if (error) {
    return <div className="card empty-state">{error}</div>
  }

  if (!analytics) {
    return <div className="card empty-state">Loading analytics...</div>
  }

  const { kpis, trend, shotProfile, zones, readout } = analytics

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Performance Analytics</h1>
          <p className="page-subtitle">Trend analysis, shot quality, and consistency indicators.</p>
        </div>
        <div className="analytics-actions">
          <button className="date-filter" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            Last 6 Weeks
          </button>
          <button className="btn btn-primary" type="button">Export Report</button>
        </div>
      </div>

      <div className="analytics-kpis">
        <div className="analytics-kpi card">
          <span className="stat-label">CONSISTENCY INDEX</span>
          <strong>{kpis.consistencyIndex}</strong>
          <span>{kpis.consistencyDelta}</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">SHOT QUALITY</span>
          <strong>{kpis.shotQuality}%</strong>
          <span>{kpis.shotQualityLabel}</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">TRAINING LOAD</span>
          <strong>{kpis.trainingLoad}</strong>
          <span>{kpis.trainingLoadLabel}</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">EFFICIENCY DELTA</span>
          <strong>{kpis.efficiencyDelta}</strong>
          <span>{kpis.efficiencyDeltaLabel}</span>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="card analytics-chart-card">
          <div className="analytics-card-title">
            <h2>Shooting Efficiency Trend</h2>
            <span>ACCURACY BY WEEK</span>
          </div>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#30363d" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} domain={[50, 95]} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                  labelStyle={{ color: '#8b949e' }}
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#f97316" strokeWidth={3} fill="url(#accuracyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card analytics-breakdown-card">
          <div className="analytics-card-title">
            <h2>Shot Distribution</h2>
            <span>ZONE FG%</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={shotProfile} layout="vertical" margin={{ top: 8, right: 12, left: 22, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="zone" axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                formatter={(value) => [`${value}%`, 'FG']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {shotProfile.map((entry) => (
                  <Cell key={entry.zone} fill={entry.value >= 75 ? '#f97316' : '#1c2128'} stroke="#30363d" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="analytics-bottom-grid">
        <section className="card analytics-zone-card">
          <div className="analytics-card-title">
            <h2>Efficiency Zones</h2>
            <span>SCOUTING FLAGS</span>
          </div>
          <div className="zone-list">
            {zones.map((zone) => (
              <div className={`zone-row ${zone.tone}`} key={zone.area}>
                <span>{zone.label}</span>
                <strong>{zone.area}</strong>
                <em>{zone.value}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="card analytics-report-card">
          <span className="stat-label">COACHING READOUT</span>
          <p>
            {readout.text}
          </p>
          <div className="readout-metrics">
            <div>
              <span>PEAK WEEK</span>
              <strong>{readout.peakWeek}</strong>
            </div>
            <div>
              <span>VOLATILITY</span>
              <strong>{readout.volatility}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

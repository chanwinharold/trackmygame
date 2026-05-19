import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../lib/api.js'
import '../styles/Dashboard.css'

function StatCard({ value, label, change, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {change && (
          <span className={`stat-change positive`}>{change}</span>
        )}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function ShootingChart({ data }) {
  return (
    <div className="card chart-card">
      <div className="card-title-row">
        <h3 className="card-title">Shooting % Trend</h3>
        <span>LAST 7 SESSIONS</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              labelStyle={{ color: '#8b949e' }}
              formatter={(value) => [`${value}%`, 'Accuracy']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4, fill: '#f97316', stroke: '#161b22', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TrainingLogCard({ log }) {
  return (
    <div className="log-card">
      <div className="log-card-left">
          <span className="log-date">{log.date}</span>
          <span className="log-title">{log.title}</span>
      </div>
      <div className="log-card-right">
        <div className="log-stat">
          <span className="log-stat-label">DURATION</span>
          <span className="log-stat-value">{log.duration} MIN</span>
        </div>
        <div className="log-stat">
          <span className="log-stat-label">ACCURACY</span>
          <span className="log-stat-value">{log.accuracy}%</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.get()
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <div className="card empty-state">{error}</div>
  }

  if (!stats) {
    return <div className="card empty-state">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Performance Dashboard</h1>
          <p className="page-subtitle">Real-time scouting analytics for current training cycle.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/workouts/new')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          START NEW SESSION
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          value={stats.totalSessions}
          label="TOTAL SESSIONS"
          change={stats.sessionsChange}
        />
        <div className="stat-card">
          <div className="stat-card-body">
            <span className="stat-label">AVG SHOOTING %</span>
            <span className="stat-value">{stats.avgShootingPct}%</span>
          </div>
          <div className="stat-sub">
            <span className="badge badge-orange">Peak: {stats.peakShooting}%</span>
          </div>
        </div>
        <StatCard
          value={stats.minutesTrained.toLocaleString()}
          label="MINUTES TRAINED"
          sub={`Elite Tier: ${stats.eliteTier}`}
        />
      </div>

      <div className="dashboard-grid">
        <ShootingChart data={stats.shootingTrend} />

        <div className="card logs-card">
          <h3 className="card-title">Recent Training Logs</h3>
          <div className="logs-list">
            {stats.recentLogs.map((log, i) => (
              <TrainingLogCard key={i} log={log} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

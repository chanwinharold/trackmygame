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
import '../styles/Analytics.css'

const trendData = [
  { label: 'W1', accuracy: 61, volume: 420 },
  { label: 'W2', accuracy: 64, volume: 460 },
  { label: 'W3', accuracy: 67, volume: 510 },
  { label: 'W4', accuracy: 63, volume: 480 },
  { label: 'W5', accuracy: 71, volume: 560 },
  { label: 'W6', accuracy: 68, volume: 520 },
]

const shotProfile = [
  { zone: 'Corner 3', value: 78 },
  { zone: 'Wing', value: 66 },
  { zone: 'Elbow', value: 72 },
  { zone: 'Paint', value: 84 },
  { zone: 'FT', value: 91 },
]

const zoneCards = [
  { label: 'HOT ZONE', area: 'Right Corner', value: '78.2%', tone: 'hot' },
  { label: 'STABLE', area: 'Free Throw Line', value: '91.0%', tone: 'stable' },
  { label: 'FOCUS', area: 'Left Wing', value: '58.4%', tone: 'focus' },
]

export default function Analytics() {
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
          <strong>87</strong>
          <span>+9 pts over baseline</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">SHOT QUALITY</span>
          <strong>74.8%</strong>
          <span>Best in close-range sets</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">TRAINING LOAD</span>
          <strong>520</strong>
          <span>Attempts this week</span>
        </div>
        <div className="analytics-kpi card">
          <span className="stat-label">EFFICIENCY DELTA</span>
          <strong>+6.4%</strong>
          <span>Compared to prior cycle</span>
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
              <AreaChart data={trendData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
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
            {zoneCards.map((zone) => (
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
            Accuracy is trending upward when weekly volume stays above 500 attempts. Right-corner
            efficiency is the strongest repeatable advantage; left-wing attempts remain the next
            technical focus.
          </p>
          <div className="readout-metrics">
            <div>
              <span>PEAK WEEK</span>
              <strong>W5</strong>
            </div>
            <div>
              <span>VOLATILITY</span>
              <strong>LOW</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

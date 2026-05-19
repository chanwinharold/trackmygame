import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { workoutsApi } from '../lib/api.js'
import '../styles/Workouts.css'

export default function Workouts() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const perPage = 5
  const displayed = payload?.items || []
  const workoutSummaries = payload?.summary || {
    totalSessions: 0,
    avgAccuracy: 0,
    totalMinutes: 0,
    topStreak: '0 Days',
  }

  useEffect(() => {
    workoutsApi.list({ page: currentPage, limit: perPage })
      .then(setPayload)
      .catch((err) => setError(err.message))
  }, [currentPage])

  if (error) {
    return <div className="card empty-state">{error}</div>
  }

  return (
    <div className="workouts">
      <div className="page-header">
        <div>
          <h1>Training Sessions</h1>
          <p className="page-subtitle">Review shooting volume, efficiency, and notes by session.</p>
        </div>
        <div className="workout-actions">
          <button className="date-filter" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            Last 30 Days
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/workouts/new')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            ADD SESSION
          </button>
        </div>
      </div>

      <div className="workout-stats">
        <div className="mini-stat">
          <span className="mini-stat-value">{workoutSummaries.totalSessions}</span>
          <span className="mini-stat-label">TOTAL SESSIONS</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{workoutSummaries.avgAccuracy}%</span>
          <span className="mini-stat-label">AVG. ACCURACY</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{workoutSummaries.totalMinutes.toLocaleString()}</span>
          <span className="mini-stat-label">TOTAL MINUTES</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{workoutSummaries.topStreak}</span>
          <span className="mini-stat-label">TOP STREAK</span>
        </div>
      </div>

      <div className="card sessions-table-wrapper">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DURATION</th>
              <th>ATTEMPTED</th>
              <th>MADE</th>
              <th>FG %</th>
              <th>NOTES PREVIEW</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {displayed.map((session) => (
              <tr key={session.id} onClick={() => navigate(`/workouts/${session.id}`)}>
                <td>
                  <div className="session-date-cell">
                    <span className="session-date">{session.displayDate}</span>
                    <span className="session-day">{session.dayLabel}</span>
                  </div>
                </td>
                <td>{session.durationMinutes} min</td>
                <td>{session.shotsAttempted}</td>
                <td>{session.shotsMade}</td>
                <td>
                  <span className={`fg-pct ${session.fgPct >= 70 ? 'high' : 'low'}`}>
                    {session.fgPct}%
                  </span>
                </td>
                <td className="notes-cell">{session.notesPreview}</td>
                <td className="row-actions">
                  <button type="button" aria-label="Session actions">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="table-info">
            Showing {displayed.length} of {payload?.pagination.total || 0} sessions
          </span>
          <div className="table-pagination">
            <button
              className="pager-link"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="pager-link"
              disabled={!payload || currentPage * perPage >= payload.pagination.total}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { sessions, workoutSummaries } from '../data/data.js'
import { useState } from 'react'
import '../styles/Workouts.css'

export default function Workouts() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5
  const displayed = sessions.slice(0, currentPage * perPage)

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
                    <span className="session-date">{session.date}</span>
                    <span className="session-day">{session.day}</span>
                  </div>
                </td>
                <td>{session.duration} min</td>
                <td>{session.attempted}</td>
                <td>{session.made}</td>
                <td>
                  <span className={`fg-pct ${session.fgPct >= 70 ? 'high' : 'low'}`}>
                    {session.fgPct}%
                  </span>
                </td>
                <td className="notes-cell">{session.notes}</td>
                <td className="row-actions">
                  <button type="button" aria-label="Session actions">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="table-info">
            Showing {displayed.length} of {sessions.length} sessions
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
              disabled={displayed.length >= sessions.length}
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

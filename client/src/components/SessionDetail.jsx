import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import '../styles/SessionDetail.css'

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getWorkout(id)
      .then(setSession)
      .catch((err) => setError(err.detail || err.message))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this session permanently?')) {
      return
    }
    try {
      await api.deleteWorkout(id)
      navigate('/workouts')
    } catch (err) {
      setError(err.detail || err.message)
    }
  }

  if (error) {
    return <div className="card empty-state">{error}</div>
  }

  if (!session) {
    return <div className="card empty-state">Loading session...</div>
  }

  return (
    <div className="session-detail">
      <div className="detail-toolbar">
        <button className="back-link" onClick={() => navigate('/workouts')}>
          ← Back to Workouts
        </button>
        <div className="detail-actions">
          <button className="btn btn-outline" onClick={() => navigate(`/workouts/${id}/edit`)}>
            EDIT SESSION
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>DELETE</button>
        </div>
      </div>

      <div className="detail-summary">
        <div className="card accuracy-card">
          <span className="card-label">OVERALL ACCURACY</span>
          <span className="big-stat">{session.overallAccuracy}%</span>
          <div className="accuracy-splits">
            <div>
              <span>MADE</span>
              <strong>{session.shotsMade}</strong>
            </div>
            <div>
              <span>ATTEMPTED</span>
              <strong>{session.shotsAttempted}</strong>
            </div>
          </div>
        </div>

        <div className="detail-side">
          <div className="card metric-card">
            <span className="card-label">SESSION DATE</span>
            <strong>{session.displayDate}</strong>
          </div>
          <div className="card metric-card">
            <span className="card-label">DURATION</span>
            <strong>{session.durationLabel}</strong>
          </div>
        </div>
      </div>

      <div className="detail-panels">
        <div className="card shot-map-card">
          <h3>SESSION SHOT MAP</h3>
          <div className="court">
            <div className="court-line half-court" />
            <div className="court-line paint" />
            <div className="court-line free-throw" />
            <div className="court-line arc" />
            <span className="hot-zone hot-zone-left" />
            <span className="hot-zone hot-zone-right" />
            <span className="hot-zone hot-zone-key" />
            <div className="hot-zone-label">
              <span />
              HOT ZONE
            </div>
          </div>
        </div>

        <div className="card detail-notes-card">
          <h3>TRAINING NOTES</h3>
          <p>{session.trainingNotes}</p>
          <div className="trend-note">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m4 16 5-5 4 4 7-8" />
              <path d="M15 7h5v5" />
            </svg>
            {session.hotZoneImprovement}
          </div>
        </div>
      </div>
    </div>
  )
}

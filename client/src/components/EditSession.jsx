import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import '../styles/EditSession.css'

export default function EditSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === undefined
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    attempted: 150,
    made: 112,
    duration: 60,
    notes: 'Focus on high release point and consistent follow-through. Legs felt slightly tired in the second half of the session.',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) {
      return
    }
    api.getWorkout(id)
      .then((session) => {
        setForm({
          date: session.date,
          attempted: session.shotsAttempted,
          made: session.shotsMade,
          duration: session.durationMinutes,
          notes: session.trainingNotes,
        })
      })
      .catch((err) => setError(err.detail || err.message))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const accuracy = form.attempted > 0 ? Math.round((form.made / form.attempted) * 100) : 0

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      date: form.date,
      durationMinutes: form.duration,
      shotsAttempted: form.attempted,
      shotsMade: form.made,
      notes: form.notes,
    }
    try {
      const session = isNew ? await api.createWorkout(payload) : await api.updateWorkout(id, payload)
      navigate(`/workouts/${session.id}`)
    } catch (err) {
      setError(err.detail || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card empty-state">Loading session...</div>
  }

  return (
    <div className="edit-session">
      <div className="page-header">
        <div>
          <h1>{isNew ? 'New Session' : 'Edit Session'}</h1>
          <p className="page-subtitle">
            Update your training performance metrics and review detailed shooting stats.
          </p>
        </div>
      </div>

      <div className="edit-grid">
        <form className="edit-form card" onSubmit={handleSubmit}>
          {error && <div className="auth-note error-note">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>SESSION DATE</label>
              <input type="date" value={form.date} onChange={handleChange('date')} />
            </div>
            <div className="form-group">
              <label>DURATION (MINUTES)</label>
              <input type="number" value={form.duration} onChange={handleChange('duration')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>SHOTS ATTEMPTED</label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c3 3 4.5 6 4.5 9S15 18 12 21M12 3c-3 3-4.5 6-4.5 9S9 18 12 21" />
                </svg>
                <input type="number" value={form.attempted} onChange={handleChange('attempted')} />
              </div>
            </div>
            <div className="form-group">
              <label>SHOTS MADE</label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
                <input type="number" value={form.made} onChange={handleChange('made')} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>TRAINING NOTES</label>
            <textarea rows={5} value={form.notes} onChange={handleChange('notes')} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {saving ? 'SAVING...' : 'SAVE SESSION'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(isNew ? '/workouts' : `/workouts/${id}`)}>
              CANCEL
            </button>
          </div>
        </form>

        <div className="edit-sidebar">
          <div className="card live-stats-card">
            <h3>LIVE ACCURACY</h3>
            <div className="accuracy-ring" style={{ '--accuracy': `${accuracy}%` }}>
              <span>{accuracy}%</span>
            </div>
            <div className="conversion-details">
              <div>
                <span className="conversion-label">CONVERSION</span>
                <span className="conversion-value">{form.made}/{form.attempted}</span>
              </div>
              <div>
                <span className="conversion-label">SESSION</span>
                <span className="conversion-value">{form.duration}m</span>
              </div>
            </div>
          </div>

          <div className="card coach-insight">
            <h3>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.9.8-1.2 1.7-1.2 3H9.2c0-1.3-.3-2.2-1.2-3Z" />
              </svg>
              Coach's Insight
            </h3>
            <p>
              Your shooting percentage is 4% higher than your career average. The extra 15 minutes
              of warm-up seems to be paying off.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

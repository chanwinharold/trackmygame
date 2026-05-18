import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [accept, setAccept] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-shape login-diamond" />
      <div className="login-shape login-circle" />

      <form className="login-card register-card" onSubmit={handleSubmit}>
        <div className="login-tabs" role="tablist" aria-label="Authentication">
          <Link className="login-tab" to="/login">Login</Link>
          <button className="login-tab active" type="button">Register</button>
        </div>

        <div className="login-brand">
          <span className="login-brand-name">TRACKMYGAME</span>
          <span className="login-brand-tag">PERFORMANCE SYSTEMS</span>
        </div>

        <div className="login-hero">
          <h1>CREATE ATHLETE PROFILE</h1>
          <p>Start tracking your training sessions and shooting performance.</p>
        </div>

        <div className="auth-note">
          <strong>Elite profile setup.</strong> Use an email you can access for performance reports.
        </div>

        <div className="register-grid">
          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <div className="input-shell">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
              <input
                id="username"
                type="text"
                placeholder="J. Carter"
                value={form.username}
                onChange={handleChange('username')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">EMAIL</label>
            <div className="input-shell">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input
                id="register-email"
                type="email"
                placeholder="coach@performance.pro"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>
          </div>
        </div>

        <div className="register-grid">
          <div className="form-group">
            <label htmlFor="register-password">PASSWORD</label>
            <div className="input-shell">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="register-password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange('password')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">CONFIRM</label>
            <div className="input-shell">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange('confirm')}
              />
            </div>
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
          />
          <span>I agree to the performance system terms</span>
        </label>

        <button type="submit" className="btn btn-primary login-btn">CREATE ACCOUNT</button>
      </form>

      <footer className="login-footer">
        © 2024 TRACKMYGAME PERFORMANCE SYSTEMS <Link to="/login">LOGIN</Link> <a href="/privacy" onClick={(e) => e.preventDefault()}>PRIVACY</a> <a href="/terms" onClick={(e) => e.preventDefault()}>TERMS</a>
      </footer>
    </div>
  )
}

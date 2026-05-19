import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi, setToken } from '../lib/api.js'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await authApi.login({ email, password, rememberDevice: remember })
      setToken(response.accessToken)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shape login-diamond" />
      <div className="login-shape login-circle" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-tabs" role="tablist" aria-label="Authentication">
          <button className="login-tab active" type="button">Login</button>
          <Link className="login-tab" to="/register">Register</Link>
        </div>

        <div className="login-brand">
          <span className="login-brand-name">TRACKMYGAME</span>
          <span className="login-brand-tag">PERFORMANCE SYSTEMS</span>
        </div>

        <div className="login-hero">
          <h1>WELCOME BACK ATHLETE</h1>
          <p>Enter your credentials to access your performance dashboard.</p>
        </div>
        {error && <div className="auth-note error-note">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">USERNAME</label>
          <div className="input-shell">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              id="email"
              type="email"
              placeholder="coach@performance.pro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="password-header">
            <label htmlFor="password">PASSWORD</label>
            <button type="button" className="forgot-link">FORGOT?</button>
          </div>
          <div className="input-shell">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((value) => !value)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Remember device for 30 days</span>
        </label>

        <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
          {submitting ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>

      <footer className="login-footer">
        © 2024 TRACKMYGAME PERFORMANCE SYSTEMS <Link to="/register">REGISTER</Link> <a href="/privacy" onClick={(e) => e.preventDefault()}>PRIVACY</a> <a href="/terms" onClick={(e) => e.preventDefault()}>TERMS</a>
      </footer>
    </div>
  )
}

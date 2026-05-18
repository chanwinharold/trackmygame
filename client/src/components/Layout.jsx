import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { player } from '../data/data.js'
import '../styles/Layout.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { path: '/workouts', label: 'Workouts', icon: 'dumbbell' },
  { path: '/analytics', label: 'Analytics', icon: 'chart' },
]

function Icon({ name }) {
  const icons = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    dumbbell: <path d="M5 8v8M8 7v10M16 7v10M19 8v8M8 12h8" />,
    chart: <path d="M5 19V9M12 19V5M19 19v-7" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>
}

export default function Layout() {
  const { pathname } = useLocation()
  const topbarOnly = pathname.includes('/edit') || pathname === '/profile'

  return (
    <div className={`layout ${topbarOnly ? 'layout-topbar-only' : ''}`}>
      {!topbarOnly && <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#f97316" />
              <path d="M8 21V10l8 8 8-8v11" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="brand-name">TRACKMYGAME</span>
            <span className="brand-tag">PERFORMANCE SYSTEMS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon name="profile" />
            Profile
          </NavLink>
        </div>
      </aside>}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left" />
          <div className="topbar-right">
            <div className="player-chip">
              <span>PLAYER:</span>
              <strong>{player.name}</strong>
            </div>
            <div className="avatar">
              {player.name.charAt(0)}
            </div>
            <button className="logout-btn" type="button" aria-label="Logout">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2M15 12H3M7 8l-4 4 4 4" />
              </svg>
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

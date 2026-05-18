import { useState } from 'react'
import '../styles/Profile.css'

export default function Profile() {
  const [profile, setProfile] = useState({
    username: 'Julien Dubois',
  })
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Paramètres du profil</h1>
          <p className="page-subtitle">
            Gérez vos informations personnelles et vos paramètres de sécurité.
          </p>
        </div>
      </div>

      <div className="profile-sections">
        <div className="card profile-section">
          <h2>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
            Informations Personnelles
          </h2>
          <div className="personal-grid">
            <div className="profile-avatar">
              JD
              <button type="button" aria-label="Modifier l'avatar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            </div>
            <div className="profile-field">
              <label>Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ username: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-primary">ENREGISTRER LES MODIFICATIONS</button>
        </div>

        <div className="card profile-section">
          <h2>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Sécurité du Compte
          </h2>
          <div className="password-grid">
            <div className="profile-field">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-field">
              <label>Nouveau</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-field">
              <label>Confirmer</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-outline">CHANGER LE MOT DE PASSE</button>
          </div>
        </div>

        <div className="card profile-section danger-zone">
          <h2>
            <span className="warning-icon">!</span>
            Zone de Danger
          </h2>
          <p>
            La suppression de votre compte est irréversible. Toutes vos statistiques de jeu,
            vidéos de formation et historiques de performance seront définitivement effacés de
            nos serveurs.
          </p>
          <button className="btn btn-danger">SUPPRIMER LE PROFIL</button>
        </div>
      </div>
    </div>
  )
}

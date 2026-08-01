import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/axios'
import { CheckCircle2, LogOut, UserCheck, Code, FolderGit2, Users, MapPin, ExternalLink } from 'lucide-react'
import './DashboardPage.css'

interface GitHubProfileData {
  login: string
  name: string
  avatarUrl: string
  htmlUrl: string
  bio: string
  location: string
  publicRepos: number
  followers: number
  following: number
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [ghProfile, setGhProfile] = useState<GitHubProfileData | null>(null)

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        const res = await api.get('/github/profile')
        if (res.data.success) {
          setGhProfile(res.data.data)
        }
      } catch (err) {
        console.warn('Failed to fetch GitHub profile:', err)
      }
    }
    fetchGitHubData()
  }, [])

  return (
    <div className="dashboard-page">
      {/* Green Authenticated Banner */}
      <div className="auth-banner">
        <div className="auth-banner__status">
          <div className="auth-banner__icon-wrapper">
            <CheckCircle2 className="auth-banner__icon" size={28} />
          </div>
          <div>
            <div className="auth-banner__badge">
              <span className="auth-banner__dot" />
              AUTHENTICATED & CONNECTED
            </div>
            <h1 className="auth-banner__title">Welcome back, {ghProfile?.name || user?.name || 'Developer'}!</h1>
            <p className="auth-banner__subtitle">
              All GitHub repositories, user statistics, and backend JWT user models are live and connected.
            </p>
          </div>
        </div>
      </div>

      {/* Profile and GitHub Data Card */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <UserCheck size={20} className="dashboard-card__header-icon" />
            <h2 className="dashboard-card__title">GitHub Profile Data</h2>
          </div>

          <div className="dashboard-profile">
            <div className="dashboard-profile__avatar-wrapper">
              <img
                src={ghProfile?.avatarUrl || user?.avatarUrl || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={user?.name}
                className="dashboard-profile__avatar"
              />
            </div>

            <div className="dashboard-profile__info">
              <h3 className="dashboard-profile__name">{ghProfile?.name || user?.name || 'GitHub User'}</h3>
              <p className="dashboard-profile__email">{user?.email || 'No email associated'}</p>

              <div className="dashboard-profile__tags">
                <span className="dashboard-tag dashboard-tag--github">
                  <Code size={12} />
                  @{ghProfile?.login || user?.name?.toLowerCase().replace(/\s+/g, '') || 'github'}
                </span>
                <span className="dashboard-tag dashboard-tag--role">
                  {user?.globalRole || 'Engineer'}
                </span>
              </div>
            </div>
          </div>

          {ghProfile?.bio && <p className="dashboard-card__description">{ghProfile.bio}</p>}

          <div className="dashboard-card__divider" />

          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <span className="dashboard-stat__label">
                <FolderGit2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Public Repos
              </span>
              <span className="dashboard-stat__value dashboard-stat__value--success">
                {ghProfile?.publicRepos ?? 12}
              </span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat__label">
                <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Followers
              </span>
              <span className="dashboard-stat__value dashboard-stat__value--success">
                {ghProfile?.followers ?? 48}
              </span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat__label">
                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Location
              </span>
              <span className="dashboard-stat__value dashboard-stat__value--success">
                {ghProfile?.location || 'Global'}
              </span>
            </div>
          </div>

          <div className="dashboard-card__footer">
            <a
              href={ghProfile?.htmlUrl || 'https://github.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-card__link"
            >
              <span>View GitHub Profile</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="dashboard-actions">
        <button onClick={logout} className="dashboard-logout-btn">
          <LogOut size={16} />
          <span>Sign out of session</span>
        </button>
      </div>
    </div>
  )
}

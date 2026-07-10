import { useState, useEffect } from 'react'
import { useOrganisation } from '@/context/OrganisationContext'
import api from '@/utils/axios'
import { Button } from '@/components/ui/Button'
import { Users, Search, Plus, ArrowRight, Layers, Info, AlertCircle } from 'lucide-react'
import './TeamsPage.css'

interface Team {
  id: string
  name: string
  slug: string
  memberCount: number
  description?: string
  projectCount?: number
}

const MOCK_TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'Frontend Platform',
    slug: 'frontend',
    memberCount: 12,
    description:
      'Maintains client architecture, design system development, and portal performance.',
    projectCount: 3,
  },
  {
    id: 'team_2',
    name: 'Core API Services',
    slug: 'core-api',
    memberCount: 8,
    description:
      'Manages high-throughput Node.js microservices, database schemas, and REST endpoints.',
    projectCount: 4,
  },
  {
    id: 'team_3',
    name: 'Security & Auth',
    slug: 'security-auth',
    memberCount: 5,
    description: 'Maintains OAuth integrations, Role-Based Access Control, and audit logs.',
    projectCount: 2,
  },
  {
    id: 'team_4',
    name: 'Product Design UI',
    slug: 'product-design',
    memberCount: 4,
    description:
      'User experience wireframes, Figma UI component libraries, and accessibility audits.',
    projectCount: 1,
  },
]

export function TeamsPage() {
  const { activeOrganisation } = useOrganisation()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTeams() {
      if (!activeOrganisation) {
        // If no workspace is selected, fall back to Demo Mode for visual presentation
        if (isMounted) {
          setTeams(MOCK_TEAMS)
          setIsDemoMode(true)
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setIsDemoMode(false)
      }

      try {
        const response = await api.get(`/organisations/${activeOrganisation.id}/teams`)
        if (isMounted) {
          // If response is successful, use the response data
          setTeams(response.data || [])
          setIsDemoMode(false)
        }
      } catch (err: any) {
        console.warn('API error fetching teams, falling back to mock data:', err)
        if (isMounted) {
          // Graceful fallback to demo mode
          setTeams(MOCK_TEAMS)
          setIsDemoMode(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTeams()

    return () => {
      isMounted = false
    }
  }, [activeOrganisation])

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      team.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTeamClick = () => {
    setNotification('The "Create New Team" action will be implemented in the next step.')
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Get initials for team avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="teams-page">
      {/* Notifications / Toast */}
      {notification && (
        <div className="teams-page__toast" role="alert">
          <Info size={16} className="teams-page__toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="teams-page__header">
        <div className="teams-page__header-text">
          <h1 className="teams-page__title">Teams</h1>
          <p className="teams-page__subtitle">
            Manage your organisation's teams, projects, and work assignments.
          </p>
        </div>
        <Button variant="primary" iconLeft={<Plus size={16} />} onClick={handleCreateTeamClick}>
          Create Team
        </Button>
      </header>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="teams-page__notice">
          <AlertCircle size={16} className="teams-page__notice-icon" />
          <div className="teams-page__notice-content">
            <span className="teams-page__notice-title">Running in Offline Demo Mode</span>
            <span className="teams-page__notice-desc">
              {!activeOrganisation
                ? 'Select or create a workspace to view local data. Showing mockup teams for Acme Corp.'
                : 'Could not connect to backend server. Showing mockup organisation teams.'}
            </span>
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="teams-page__toolbar">
        <div className="teams-page__search-wrapper">
          <Search size={16} className="teams-page__search-icon" />
          <input
            type="text"
            placeholder="Search teams by name, description, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="teams-page__search-input"
            aria-label="Search teams"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="teams-page__grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="team-card-skeleton" aria-hidden="true">
              <div className="team-card-skeleton__header">
                <div className="team-card-skeleton__avatar" />
                <div className="team-card-skeleton__meta">
                  <div className="team-card-skeleton__title" />
                  <div className="team-card-skeleton__subtitle" />
                </div>
              </div>
              <div className="team-card-skeleton__body" />
              <div className="team-card-skeleton__footer" />
            </div>
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="teams-page__grid">
          {filteredTeams.map((team) => (
            <article key={team.id} className="team-card">
              <div className="team-card__header">
                <div className="team-card__avatar-container">
                  <div className="team-card__avatar">{getInitials(team.name)}</div>
                </div>
                <div className="team-card__meta">
                  <h3 className="team-card__name">{team.name}</h3>
                  <span className="team-card__slug">t/{team.slug}</span>
                </div>
              </div>

              {team.description && <p className="team-card__description">{team.description}</p>}

              <div className="team-card__stats">
                <div className="team-card__stat">
                  <Users size={14} className="team-card__stat-icon" />
                  <span>
                    {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <div className="team-card__stat">
                  <Layers size={14} className="team-card__stat-icon" />
                  <span>
                    {team.projectCount || 0} {team.projectCount === 1 ? 'project' : 'projects'}
                  </span>
                </div>
              </div>

              <div className="team-card__footer">
                <NavLinkButton to={`/dashboard/teams/${team.id}`} className="team-card__action">
                  <span>View Details</span>
                  <ArrowRight size={14} className="team-card__action-arrow" />
                </NavLinkButton>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="teams-page__empty">
          <div className="teams-page__empty-icon-wrapper">
            <Users size={32} className="teams-page__empty-icon" />
          </div>
          <h2 className="teams-page__empty-title">No teams found</h2>
          <p className="teams-page__empty-desc">
            {searchQuery
              ? `No teams match the search term "${searchQuery}". Try editing your query.`
              : 'Add teams to organise your developers, projects, and permissions.'}
          </p>
          {!searchQuery && (
            <Button
              variant="secondary"
              iconLeft={<Plus size={16} />}
              onClick={handleCreateTeamClick}
              className="teams-page__empty-cta"
            >
              Create your first team
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Simple internal helper to render NavLink-like buttons/anchors styled as buttons
import { NavLink } from 'react-router-dom'
function NavLinkButton({
  to,
  children,
  className,
}: {
  to: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <NavLink to={to} className={className}>
      {children}
    </NavLink>
  )
}

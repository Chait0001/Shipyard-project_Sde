import { useState, useEffect, useMemo } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { useOrganisation } from '@/context/OrganisationContext'
import api from '@/utils/axios'
import { Button } from '@/components/ui/Button'
import { TeamMembersTable } from '@/components/TeamMembersTable'
import type { TeamMember } from '@/components/TeamMembersTable'
import { InviteMemberModal } from '@/components/InviteMemberModal'
import type { InvitedMember } from '@/components/InviteMemberModal'
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Settings,
} from 'lucide-react'
import './TeamDetailPage.css'

interface TeamDetail {
  id: string
  name: string
  slug: string
  description?: string
  memberCount: number
  projectCount?: number
}

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 'usr_101',
    name: 'Jane Doe',
    email: 'jane@acme.dev',
    avatarUrl: undefined,
    role: 'owner',
    joinedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'usr_102',
    name: 'Alex Rivera',
    email: 'alex.r@acme.dev',
    avatarUrl: undefined,
    role: 'admin',
    joinedAt: '2025-02-20T14:30:00Z',
  },
  {
    id: 'usr_103',
    name: 'Sam Chen',
    email: 'sam.chen@acme.dev',
    avatarUrl: undefined,
    role: 'manager',
    joinedAt: '2025-03-08T09:15:00Z',
  },
  {
    id: 'usr_104',
    name: 'Priya Sharma',
    email: 'priya.s@acme.dev',
    avatarUrl: undefined,
    role: 'engineer',
    joinedAt: '2025-04-12T11:45:00Z',
  },
  {
    id: 'usr_105',
    name: 'Marcus Johnson',
    email: 'marcus.j@acme.dev',
    avatarUrl: undefined,
    role: 'engineer',
    joinedAt: '2025-05-01T16:00:00Z',
  },
  {
    id: 'usr_106',
    name: 'Lena Kowalski',
    email: 'lena.k@acme.dev',
    avatarUrl: undefined,
    role: 'viewer',
    joinedAt: '2025-06-18T08:20:00Z',
  },
  {
    id: 'usr_107',
    name: 'Tomás García',
    email: 'tomas.g@acme.dev',
    avatarUrl: undefined,
    role: 'engineer',
    joinedAt: '2025-07-02T13:10:00Z',
  },
  {
    id: 'usr_108',
    name: 'Aisha Patel',
    email: 'aisha.p@acme.dev',
    avatarUrl: undefined,
    role: 'engineer',
    joinedAt: '2025-08-25T10:30:00Z',
  },
]

const MOCK_TEAM: TeamDetail = {
  id: 'team_1',
  name: 'Frontend Platform',
  slug: 'frontend',
  description:
    'Maintains client architecture, design system development, and portal performance.',
  memberCount: 8,
  projectCount: 3,
}

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { activeOrganisation } = useOrganisation()
  const navigate = useNavigate()

  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTeamDetail() {
      if (!activeOrganisation || !teamId) {
        if (isMounted) {
          setTeam(MOCK_TEAM)
          setMembers(MOCK_MEMBERS)
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
        const [teamRes, membersRes] = await Promise.all([
          api.get(`/organisations/${activeOrganisation.id}/teams/${teamId}`),
          api.get(`/organisations/${activeOrganisation.id}/teams/${teamId}/members`),
        ])
        if (isMounted) {
          setTeam(teamRes.data)
          setMembers(membersRes.data || [])
          setIsDemoMode(false)
        }
      } catch (err: any) {
        console.warn('API error fetching team detail, falling back to mock data:', err)
        if (isMounted) {
          setTeam(MOCK_TEAM)
          setMembers(MOCK_MEMBERS)
          setIsDemoMode(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTeamDetail()

    return () => {
      isMounted = false
    }
  }, [activeOrganisation, teamId])

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const q = searchQuery.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    )
  }, [members, searchQuery])

  const handleInviteClick = () => {
    setIsInviteModalOpen(true)
  }

  const handleMemberInvited = (invitation: InvitedMember) => {
    // Add the invited member to the table as a pending entry
    const newMember: TeamMember = {
      id: invitation.id,
      name: invitation.email.split('@')[0],
      email: invitation.email,
      avatarUrl: undefined,
      role: invitation.role,
      joinedAt: invitation.invitedAt,
    }
    setMembers((prev) => [...prev, newMember])
    setNotification(`Invitation sent to ${invitation.email}`)
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  return (
    <div className="team-detail-page">
      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={teamId || ''}
        teamName={team?.name || 'this team'}
        onMemberInvited={handleMemberInvited}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="team-detail-page__toast" role="alert">
          <CheckCircle2 size={16} className="team-detail-page__toast-icon" />
          <span>{notification}</span>
        </div>
      )}
      {/* Back navigation */}
      <nav className="team-detail-page__breadcrumb-nav">
        <NavLink to="/dashboard/teams" className="team-detail-page__back-link">
          <ArrowLeft size={16} />
          <span>All Teams</span>
        </NavLink>
      </nav>

      {/* Header */}
      {loading ? (
        <div className="team-detail-page__header-skeleton" aria-hidden="true">
          <div className="team-detail-page__header-skeleton-avatar" />
          <div className="team-detail-page__header-skeleton-meta">
            <div className="team-detail-page__header-skeleton-title" />
            <div className="team-detail-page__header-skeleton-desc" />
          </div>
        </div>
      ) : team ? (
        <header className="team-detail-page__header">
          <div className="team-detail-page__header-info">
            <div className="team-detail-page__avatar">
              {team.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="team-detail-page__header-text">
              <h1 className="team-detail-page__title">{team.name}</h1>
              <span className="team-detail-page__slug">t/{team.slug}</span>
              {team.description && (
                <p className="team-detail-page__description">{team.description}</p>
              )}
            </div>
          </div>
          <div className="team-detail-page__header-actions">
            <Button
              variant="secondary"
              iconLeft={<Settings size={16} />}
              onClick={() => navigate(`/dashboard/teams/${teamId}/settings`)}
            >
              Settings
            </Button>
            <Button
              variant="primary"
              iconLeft={<Plus size={16} />}
              onClick={handleInviteClick}
            >
              Invite Member
            </Button>
          </div>
        </header>
      ) : null}

      {/* Demo notice */}
      {isDemoMode && (
        <div className="team-detail-page__notice">
          <AlertCircle size={16} className="team-detail-page__notice-icon" />
          <div className="team-detail-page__notice-content">
            <span className="team-detail-page__notice-title">
              Running in Offline Demo Mode
            </span>
            <span className="team-detail-page__notice-desc">
              {!activeOrganisation
                ? 'Select or create a workspace to view live data. Showing mockup team members.'
                : 'Could not connect to backend server. Showing mockup team members.'}
            </span>
          </div>
        </div>
      )}

      {/* Members Section */}
      <section className="team-detail-page__members-section">
        <div className="team-detail-page__members-header">
          <div className="team-detail-page__members-title-row">
            <Users size={18} className="team-detail-page__members-icon" />
            <h2 className="team-detail-page__members-title">
              Members
              {!loading && (
                <span className="team-detail-page__members-count">
                  {filteredMembers.length}
                </span>
              )}
            </h2>
          </div>
          <div className="team-detail-page__members-search-wrapper">
            <Search size={16} className="team-detail-page__members-search-icon" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="team-detail-page__members-search-input"
              aria-label="Search team members"
            />
          </div>
        </div>

        <TeamMembersTable members={filteredMembers} loading={loading} />
      </section>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Shield, UserX } from 'lucide-react'
import './TeamMembersTable.css'

export interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
  joinedAt: string
}

type SortField = 'name' | 'role' | 'joinedAt'
type SortDirection = 'asc' | 'desc'

const ROLE_ORDER: Record<string, number> = {
  owner: 4,
  admin: 3,
  manager: 2,
  engineer: 1,
  viewer: 0,
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  engineer: 'Engineer',
  viewer: 'Viewer',
}

const ROLE_VARIANT: Record<string, string> = {
  owner: 'role-badge--owner',
  admin: 'role-badge--admin',
  manager: 'role-badge--manager',
  engineer: 'role-badge--engineer',
  viewer: 'role-badge--viewer',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days < 1) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  if (months < 12) return `${months} months ago`
  const years = Math.floor(months / 12)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

interface TeamMembersTableProps {
  members: TeamMember[]
  loading?: boolean
}

export function TeamMembersTable({ members, loading = false }: TeamMembersTableProps) {
  const [sortField, setSortField] = useState<SortField>('role')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'role' ? 'desc' : 'asc')
    }
  }

  const sortedMembers = useMemo(() => {
    const sorted = [...members]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'role':
          comparison = (ROLE_ORDER[a.role] ?? 0) - (ROLE_ORDER[b.role] ?? 0)
          break
        case 'joinedAt':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [members, sortField, sortDirection])

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="members-table__sort-icon--neutral" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="members-table__sort-icon--active" />
    ) : (
      <ArrowDown size={14} className="members-table__sort-icon--active" />
    )
  }

  if (loading) {
    return (
      <div className="members-table__skeleton-wrapper" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="members-table__skeleton-row">
            <div className="members-table__skeleton-avatar" />
            <div className="members-table__skeleton-meta">
              <div className="members-table__skeleton-name" />
              <div className="members-table__skeleton-email" />
            </div>
            <div className="members-table__skeleton-badge" />
            <div className="members-table__skeleton-date" />
          </div>
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="members-table__empty">
        <div className="members-table__empty-icon-wrapper">
          <UserX size={28} className="members-table__empty-icon" />
        </div>
        <h3 className="members-table__empty-title">No members found</h3>
        <p className="members-table__empty-desc">
          No team members match your search. Try adjusting your query.
        </p>
      </div>
    )
  }

  return (
    <div className="members-table__wrapper">
      <table className="members-table" role="table">
        <thead className="members-table__head">
          <tr>
            <th className="members-table__th members-table__th--member">
              <button
                type="button"
                className="members-table__sort-btn"
                onClick={() => handleSort('name')}
                aria-label="Sort by member name"
              >
                <span>Member</span>
                {renderSortIcon('name')}
              </button>
            </th>
            <th className="members-table__th members-table__th--role">
              <button
                type="button"
                className="members-table__sort-btn"
                onClick={() => handleSort('role')}
                aria-label="Sort by role"
              >
                <span>Role</span>
                {renderSortIcon('role')}
              </button>
            </th>
            <th className="members-table__th members-table__th--joined">
              <button
                type="button"
                className="members-table__sort-btn"
                onClick={() => handleSort('joinedAt')}
                aria-label="Sort by joined date"
              >
                <span>Joined</span>
                {renderSortIcon('joinedAt')}
              </button>
            </th>
            <th className="members-table__th members-table__th--actions">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="members-table__body">
          {sortedMembers.map((member) => (
            <tr key={member.id} className="members-table__row">
              {/* Member Cell */}
              <td className="members-table__td members-table__td--member">
                <div className="members-table__member-info">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={`${member.name} avatar`}
                      className="members-table__avatar"
                    />
                  ) : (
                    <div className="members-table__avatar members-table__avatar--initials">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="members-table__member-text">
                    <span className="members-table__member-name">{member.name}</span>
                    <span className="members-table__member-email">{member.email}</span>
                  </div>
                </div>
              </td>

              {/* Role Cell */}
              <td className="members-table__td members-table__td--role">
                <span
                  className={`role-badge ${ROLE_VARIANT[member.role] || 'role-badge--viewer'}`}
                >
                  <Shield size={12} className="role-badge__icon" />
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </td>

              {/* Joined Date Cell */}
              <td className="members-table__td members-table__td--joined">
                <span
                  className="members-table__date"
                  title={formatDate(member.joinedAt)}
                >
                  {getRelativeTime(member.joinedAt)}
                </span>
              </td>

              {/* Actions Cell */}
              <td className="members-table__td members-table__td--actions">
                <button
                  type="button"
                  className="members-table__actions-btn"
                  aria-label={`Actions for ${member.name}`}
                >
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

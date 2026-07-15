import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  GitFork,
  BarChart2,
  Rocket,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import './Sidebar.css'

interface SidebarProps {
  collapsible?: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsible = true, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { to: '/dashboard/teams', label: 'Teams', icon: Users },
    { to: '/dashboard/repos', label: 'Repositories', icon: GitFork },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/dashboard/releases', label: 'Releases', icon: Rocket },
  ]

  // Render initials for avatar if no avatarUrl is provided
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Main Navigation"
    >
      {/* Brand Header / Workspace Switcher */}
      <div className="sidebar__header">
        <WorkspaceSwitcher isCollapsed={isCollapsed} />

        {collapsible && (
          <button
            onClick={onToggleCollapse}
            className="sidebar__collapse-toggle"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to} className="sidebar__nav-item">
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={16} className="sidebar__nav-icon" />
                  {!isCollapsed && <span className="sidebar__nav-label">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User & Footer Area */}
      {user && (
        <div className="sidebar__footer">
          <div className="sidebar__user-profile">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.name}'s avatar`} className="sidebar__avatar" />
            ) : (
              <div className="sidebar__avatar-fallback" aria-hidden="true">
                {getInitials(user.name)}
              </div>
            )}

            {!isCollapsed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name" title={user.name}>
                  {user.name}
                </span>
                <span className="sidebar__user-role">{user.globalRole || 'engineer'}</span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="sidebar__logout-btn"
            aria-label="Log out"
            title={isCollapsed ? 'Log out' : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="sidebar__logout-label">Log out</span>}
          </button>
        </div>
      )}
    </aside>
  )
}

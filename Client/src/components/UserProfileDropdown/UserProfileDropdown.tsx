import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Settings } from 'lucide-react'
import './UserProfileDropdown.css'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  globalRole?: string
}

interface UserProfileDropdownProps {
  user?: User | null
}

export function UserProfileDropdown({ user: propUser }: UserProfileDropdownProps) {
  const { user: contextUser, logout } = useAuth()
  const user = propUser !== undefined ? propUser : contextUser
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen((prev) => !prev)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!user) return null

  // Render initials if avatar is not provided
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
    <div className="user-dropdown" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="user-dropdown__trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.name}'s avatar`}
            className="user-dropdown__avatar"
          />
        ) : (
          <div className="user-dropdown__avatar-fallback" aria-hidden="true">
            {getInitials(user.name)}
          </div>
        )}
      </button>

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div className="user-dropdown__menu" role="menu">
          {/* User Details Header */}
          <div className="user-dropdown__header" role="presentation">
            <span className="user-dropdown__name" title={user.name}>
              {user.name}
            </span>
            <span className="user-dropdown__email" title={user.email}>
              {user.email}
            </span>
            <span className="user-dropdown__role-badge">{user.globalRole || 'engineer'}</span>
          </div>

          <div className="user-dropdown__divider" role="presentation" />

          {/* Links/Actions */}
          <ul className="user-dropdown__list">
            <li className="user-dropdown__item" role="menuitem">
              <button
                className="user-dropdown__action-btn user-dropdown__action-btn--disabled"
                disabled
                title="Profile settings coming soon"
              >
                <User size={14} />
                <span>Profile</span>
              </button>
            </li>
            <li className="user-dropdown__item" role="menuitem">
              <button
                className="user-dropdown__action-btn user-dropdown__action-btn--disabled"
                disabled
                title="Account settings coming soon"
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>
            </li>
          </ul>

          <div className="user-dropdown__divider" role="presentation" />

          {/* Logout Section */}
          <div className="user-dropdown__footer" role="menuitem">
            <button onClick={logout} className="user-dropdown__logout-btn">
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default UserProfileDropdown

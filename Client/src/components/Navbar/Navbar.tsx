import React, { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { UserProfileDropdown } from '@/components/UserProfileDropdown'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import './Navbar.css'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  globalRole?: string
}

interface NavbarProps {
  breadcrumbs?: React.ReactNode
  user?: User | null
}

export function Navbar({ breadcrumbs, user }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMac, setIsMac] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    const platform = navigator.platform?.toUpperCase() || ''
    const agent = navigator.userAgent?.toUpperCase() || ''
    setIsMac(platform.indexOf('MAC') >= 0 || agent.indexOf('MAC') >= 0)
  }, [])

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key?.toLowerCase() === 'k'
      const isModifier = isMac ? e.metaKey : e.ctrlKey

      if (isK && isModifier) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMac])

  return (
    <header className="navbar" role="banner">
      {/* Breadcrumbs Left Section */}
      <div className="navbar__left">{breadcrumbs ? breadcrumbs : <Breadcrumb />}</div>

      {/* Global Search Middle Section */}
      <div className="navbar__center">
        <form className="navbar__search-form" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="navbar__search-input-wrapper">
            <Search size={16} className="navbar__search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search or jump to..."
              className="navbar__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Global search"
            />
            <kbd className="navbar__search-shortcut">{isMac ? '⌘' : 'Ctrl+'}K</kbd>
          </div>
        </form>
      </div>

      {/* Right Section (Profile, Workspace Switcher, and Theme Toggle) */}
      <div
        className="navbar__right"
        style={{ gap: 'var(--space-3)', display: 'flex', alignItems: 'center' }}
      >
        <ThemeToggle />
        <UserProfileDropdown user={user} />
      </div>
    </header>
  )
}
export default Navbar

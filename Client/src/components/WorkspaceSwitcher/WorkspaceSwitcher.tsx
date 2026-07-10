import { useState, useEffect, useRef } from 'react'
import { useOrganisation } from '@/context/OrganisationContext'
import { ChevronsUpDown, Check, Plus } from 'lucide-react'
import './WorkspaceSwitcher.css'

interface WorkspaceSwitcherProps {
  isCollapsed: boolean
}

export function WorkspaceSwitcher({ isCollapsed }: WorkspaceSwitcherProps) {
  const { organisations, activeOrganisation, isLoading, selectOrganisation } = useOrganisation()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const getInitials = (name?: string) => {
    if (!name) return 'S'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Handle switching organisation
  const handleSelect = (id: string) => {
    selectOrganisation(id)
    setIsOpen(false)
  }

  // Skeleton loading states
  if (isLoading && organisations.length === 0) {
    return (
      <div
        className={`workspace-switcher-skeleton ${isCollapsed ? 'workspace-switcher-skeleton--collapsed' : ''}`}
        aria-label="Loading workspaces"
      >
        <div className="workspace-switcher-skeleton__avatar" />
        {!isCollapsed && <div className="workspace-switcher-skeleton__text" />}
      </div>
    )
  }

  const activeName = activeOrganisation?.name || 'Select Org'
  const initials = getInitials(activeName)

  return (
    <div className="workspace-switcher" ref={dropdownRef}>
      {/* Switcher Trigger */}
      <button
        onClick={toggleDropdown}
        className={`workspace-switcher__trigger ${
          isCollapsed ? 'workspace-switcher__trigger--collapsed' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Switch organisation workspace"
      >
        <div className="workspace-switcher__avatar" aria-hidden="true">
          {initials}
        </div>
        {!isCollapsed && (
          <>
            <span className="workspace-switcher__name" title={activeName}>
              {activeName}
            </span>
            <ChevronsUpDown size={14} className="workspace-switcher__chevron" />
          </>
        )}
      </button>

      {/* Switcher Dropdown */}
      {isOpen && (
        <div className="workspace-switcher__dropdown" role="menu">
          <div className="workspace-switcher__section-title" role="presentation">
            Workspaces
          </div>
          <ul className="workspace-switcher__list" role="listbox">
            {organisations.map((org) => {
              const isSelected = org.id === activeOrganisation?.id
              return (
                <li
                  key={org.id}
                  className="workspace-switcher__item"
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    onClick={() => handleSelect(org.id)}
                    className={`workspace-switcher__option ${
                      isSelected ? 'workspace-switcher__option--selected' : ''
                    }`}
                  >
                    <div className="workspace-switcher__option-avatar">{getInitials(org.name)}</div>
                    <div className="workspace-switcher__option-info">
                      <span className="workspace-switcher__option-name">{org.name}</span>
                      <span className="workspace-switcher__option-role">
                        {org.role || 'member'}
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="workspace-switcher__option-check" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="workspace-switcher__divider" role="presentation" />

          <div className="workspace-switcher__footer" role="menuitem">
            <button
              className="workspace-switcher__add-btn workspace-switcher__add-btn--disabled"
              disabled
              title="Creating organisations coming soon"
            >
              <Plus size={14} />
              <span>Create Organisation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default WorkspaceSwitcher

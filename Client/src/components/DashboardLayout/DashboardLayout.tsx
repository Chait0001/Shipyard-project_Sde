import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { Menu, X } from 'lucide-react'
import './DashboardLayout.css'

export function DashboardLayout() {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev)
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Header */}
      <header className="dashboard-layout__mobile-header" aria-label="Mobile Header">
        <button
          onClick={toggleMobileSidebar}
          className="dashboard-layout__mobile-toggle"
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="dashboard-layout__mobile-title">Shipyard</span>
      </header>

      {/* Sidebar Container */}
      <div
        className={`dashboard-layout__sidebar-wrapper ${
          isMobileOpen ? 'dashboard-layout__sidebar-wrapper--mobile-open' : ''
        }`}
      >
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="dashboard-layout__backdrop"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          isCollapsed={isMobileOpen ? false : isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`dashboard-layout__main ${
          isCollapsed ? 'dashboard-layout__main--collapsed' : ''
        }`}
      >
        <Navbar user={user} />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default DashboardLayout

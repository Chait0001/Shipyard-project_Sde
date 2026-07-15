import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import './Breadcrumb.css'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  teams: 'Teams',
  repos: 'Repositories',
  analytics: 'Analytics',
  releases: 'Releases',
}

function formatFallbackLabel(segment: string): string {
  // Convert ids or slugs like "my-awesome-team" -> "My Awesome Team"
  return segment
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // If we are exactly at the home dashboard, only show "Dashboard"
  if (pathnames.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol className="breadcrumb__list">
          <li className="breadcrumb__item breadcrumb__item--active">
            {ROUTE_LABELS[pathnames[0]] || 'Dashboard'}
          </li>
        </ol>
      </nav>
    )
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb__list">
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const label = ROUTE_LABELS[value] || formatFallbackLabel(value)

          return (
            <li key={to} className="breadcrumb__item">
              {index > 0 && (
                <ChevronRight size={12} className="breadcrumb__separator" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="breadcrumb__item-text breadcrumb__item-text--active"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link to={to} className="breadcrumb__link">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
export default Breadcrumb

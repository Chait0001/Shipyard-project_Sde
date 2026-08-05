import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronDown, CircleDot, GitPullRequest } from 'lucide-react'
import api from '@/utils/axios'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import './DashboardPage.css'

const RECENTLY_CLOSED_RETENTION_DAYS = 7

interface ProjectRef {
  id: string
  title: string
  name?: string
}

interface RepoRef {
  id: string
  fullName: string
  githubUrl: string
}

interface AssignedIssue {
  id: string
  githubIssueNumber: number
  title: string
  state: 'open' | 'closed'
  labels: string[]
  githubUpdatedAt?: string
  githubClosedAt?: string | null
  project?: ProjectRef
  githubRepository?: RepoRef
  linkedPullRequestCount: number
  closingPullRequest?: { number: number; githubUrl: string } | null
}

interface ActivePullRequest {
  id: string
  number: number
  title: string
  author?: string
  githubUrl: string
  githubUpdatedAt?: string
  project?: ProjectRef
  githubRepository?: RepoRef
  linkedIssueCount: number
}

interface DashboardData {
  assignedIssues: AssignedIssue[]
  activePRs: ActivePullRequest[]
  githubConnected: boolean
  hasProjects: boolean
}

const isWithinRetentionWindow = (date?: string | null) => {
  if (!date) return false
  const days = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  return days <= RECENTLY_CLOSED_RETENTION_DAYS
}

const projectLabel = (project?: ProjectRef) => project?.name || project?.title || 'Unknown project'

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState('all')
  const [isRecentlyClosedOpen, setIsRecentlyClosedOpen] = useState(false)

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true)
      try {
        const response = await api.get('/dashboard')
        setData(response.data.data)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const projectOptions = useMemo(() => {
    const projects = new Map<string, string>()
    for (const issue of data?.assignedIssues || []) {
      if (issue.project) projects.set(issue.project.id, projectLabel(issue.project))
    }
    for (const pr of data?.activePRs || []) {
      if (pr.project) projects.set(pr.project.id, projectLabel(pr.project))
    }
    return [...projects.entries()]
  }, [data])

  const filteredIssues = useMemo(() => {
    const issues = data?.assignedIssues || []
    return projectFilter === 'all' ? issues : issues.filter((issue) => issue.project?.id === projectFilter)
  }, [data, projectFilter])

  const filteredPRs = useMemo(() => {
    const prs = data?.activePRs || []
    return projectFilter === 'all' ? prs : prs.filter((pr) => pr.project?.id === projectFilter)
  }, [data, projectFilter])

  const openIssues = filteredIssues.filter((issue) => issue.state === 'open')
  const recentlyClosedIssues = filteredIssues.filter(
    (issue) => issue.state === 'closed' && isWithinRetentionWindow(issue.githubClosedAt),
  )

  if (isLoading) {
    return <div className="dashboard-page__empty">Loading dashboard...</div>
  }

  const hasProjects = data?.hasProjects ?? false

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="projects-page__eyebrow">Personal workspace</p>
          <h1 className="projects-page__title">Dashboard</h1>
          <p className="projects-page__subtitle">
            Issues assigned to you and active pull requests, across every synced project.
          </p>
        </div>

        {projectOptions.length > 1 && (
          <select
            className="dashboard-page__project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            aria-label="Filter by project"
          >
            <option value="all">All projects</option>
            {projectOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        )}
      </header>

      <section className="dashboard-page__section" aria-labelledby="assigned-issues-title">
        <div className="projects-page__section-heading">
          <h2 id="assigned-issues-title">Assigned Issues</h2>
          <span>{openIssues.length} open</span>
        </div>

        {!hasProjects ? (
          <div className="dashboard-page__empty-state">
            <p>No synced projects yet.</p>
            <Link to="/dashboard/projects" className="dashboard-page__empty-link">
              Go to Projects to connect a repository
            </Link>
          </div>
        ) : openIssues.length === 0 ? (
          <div className="dashboard-page__empty-state">
            <p>No issues are currently assigned to you.</p>
          </div>
        ) : (
          <div className="dashboard-page__row-list">
            {openIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {recentlyClosedIssues.length > 0 && (
          <div className="dashboard-page__collapsible">
            <button
              type="button"
              className="dashboard-page__collapsible-toggle"
              onClick={() => setIsRecentlyClosedOpen((prev) => !prev)}
              aria-expanded={isRecentlyClosedOpen}
            >
              <ChevronDown
                size={14}
                className={`dashboard-page__collapsible-chevron ${
                  isRecentlyClosedOpen ? 'dashboard-page__collapsible-chevron--open' : ''
                }`}
              />
              Recently Closed
              <Badge tone="neutral">{recentlyClosedIssues.length}</Badge>
            </button>

            {isRecentlyClosedOpen && (
              <div className="dashboard-page__row-list">
                {recentlyClosedIssues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} muted />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="dashboard-page__section" aria-labelledby="active-prs-title">
        <div className="projects-page__section-heading">
          <h2 id="active-prs-title">Active PRs</h2>
          <span>{filteredPRs.length} open</span>
        </div>

        {!hasProjects ? (
          <div className="dashboard-page__empty-state">
            <p>No synced projects yet.</p>
            <Link to="/dashboard/projects" className="dashboard-page__empty-link">
              Go to Projects to connect a repository
            </Link>
          </div>
        ) : filteredPRs.length === 0 ? (
          <div className="dashboard-page__empty-state">
            <p>No open pull requests right now.</p>
          </div>
        ) : (
          <div className="dashboard-page__row-list">
            {filteredPRs.map((pr) => (
              <a
                key={pr.id}
                href={pr.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="dashboard-page__row"
              >
                <GitPullRequest size={16} />
                <div>
                  <h3>{pr.title}</h3>
                  <p>
                    #{pr.number}
                    {pr.author ? ` by ${pr.author}` : ''} &middot; {projectLabel(pr.project)}
                    {' '}&middot; {formatRelativeTime(pr.githubUpdatedAt)}
                  </p>
                </div>
                <div className="dashboard-page__row-badges">
                  <Badge tone="complete">Open</Badge>
                  <Badge tone={pr.linkedIssueCount > 0 ? 'active' : 'neutral'}>
                    {pr.linkedIssueCount} issues
                  </Badge>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function IssueRow({ issue, muted = false }: { issue: AssignedIssue; muted?: boolean }) {
  const visibleLabels = issue.labels.slice(0, 2)
  const overflowCount = issue.labels.length - visibleLabels.length
  const href = issue.githubRepository
    ? `${issue.githubRepository.githubUrl}/issues/${issue.githubIssueNumber}`
    : '#'

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`dashboard-page__row ${muted ? 'dashboard-page__row--muted' : ''}`}
    >
      <CircleDot size={16} />
      <div>
        <h3>{issue.title}</h3>
        <p>
          #{issue.githubIssueNumber} &middot; {projectLabel(issue.project)}
          {' '}&middot; {formatRelativeTime(issue.githubUpdatedAt)}
          {(visibleLabels.length > 0 || overflowCount > 0) && (
            <span className="dashboard-page__label-chips">
              {visibleLabels.map((label) => (
                <span key={label} className="dashboard-page__label-chip">
                  {label}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="dashboard-page__label-chip">+{overflowCount}</span>
              )}
            </span>
          )}
        </p>
      </div>
      <div className="dashboard-page__row-badges">
        {issue.state === 'closed' ? (
          issue.closingPullRequest ? (
            <Badge tone="closed" icon={<CheckCircle2 size={12} />}>
              Closed via #{issue.closingPullRequest.number}
            </Badge>
          ) : (
            <Badge tone="closed">Closed</Badge>
          )
        ) : (
          <Badge tone="complete">Open</Badge>
        )}
        <Badge tone={issue.linkedPullRequestCount > 0 ? 'active' : 'neutral'}>
          {issue.linkedPullRequestCount} PRs
        </Badge>
      </div>
    </a>
  )
}

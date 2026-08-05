import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleDot, GitBranch, GitPullRequest } from 'lucide-react'
import api from '@/utils/axios'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import './ProjectsPage.css'

interface PullRequest {
  id: string
  number: number
  title: string
  author?: string
  status: string
  githubUrl: string
  githubUpdatedAt?: string
  linkedIssueNumbers?: number[]
}

interface Issue {
  id: string
  githubIssueNumber: number
  title: string
  state: 'open' | 'closed'
  labels: string[]
  githubUpdatedAt?: string
}

interface GithubRepository {
  id: string
  fullName: string
  githubUrl: string
  visibility: string
  defaultBranch?: string
}

interface Project {
  id: string
  title: string
  name?: string
  description?: string
  syncStatus: 'pending' | 'syncing' | 'complete' | 'partial' | 'failed'
  githubRepositories?: GithubRepository[]
  pullRequests?: PullRequest[]
  issues?: Issue[]
  lastSyncedAt?: string
}

// 'partial' is visually treated as 'complete' — it still means usable, synced data.
const syncStatusTone = (syncStatus: Project['syncStatus']): BadgeTone =>
  syncStatus === 'partial' ? 'complete' : syncStatus

const linkedPrCountFor = (issue: Issue, pullRequests: PullRequest[]) =>
  pullRequests.filter((pr) => (pr.linkedIssueNumbers || []).includes(issue.githubIssueNumber))
    .length

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true)
      setError('')
      try {
        const response = await api.get(`/projects/${projectId}`)
        setProject(response.data.data)
      } catch (requestError) {
        console.error('Failed to load project:', requestError)
        setError('Project could not be loaded.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (isLoading) {
    return <div className="project-detail__empty">Loading project...</div>
  }

  if (error || !project) {
    return <div className="project-detail__empty">{error || 'Project not found.'}</div>
  }

  const repository = project.githubRepositories?.[0]
  const pullRequests = project.pullRequests || []
  const issues = project.issues || []

  return (
    <div className="project-detail">
      <Link to="/dashboard/projects" className="project-detail__back">
        <ArrowLeft size={16} />
        Projects
      </Link>

      <header className="project-detail__header">
        <div>
          <p className="projects-page__eyebrow">Synced project</p>
          <h1>{project.name || project.title}</h1>
          <p>{project.description || 'Open pull requests synced from GitHub.'}</p>
        </div>
        <div className="project-detail__header-status">
          <Badge tone={syncStatusTone(project.syncStatus)}>{project.syncStatus}</Badge>
          <span className="projects-page__last-synced">
            Last synced {formatRelativeTime(project.lastSyncedAt)}
          </span>
        </div>
      </header>

      {repository && (
        <a
          href={repository.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="project-detail__repo-bar"
        >
          <GitBranch size={16} />
          <span>{repository.fullName}</span>
          <span>{repository.visibility}</span>
          <span>{repository.defaultBranch || 'default branch'}</span>
        </a>
      )}

      <section className="project-detail__prs" aria-labelledby="pull-requests-title">
        <div className="projects-page__section-heading">
          <h2 id="pull-requests-title">Open Pull Requests</h2>
          <span>{pullRequests.length} synced</span>
        </div>

        {pullRequests.length === 0 ? (
          <div className="projects-page__empty">No open pull requests found.</div>
        ) : (
          <div className="project-detail__pr-list">
            {pullRequests.map((pullRequest) => (
              <a
                key={pullRequest.id}
                href={pullRequest.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="project-detail__pr-row"
              >
                <GitPullRequest size={16} />
                <div>
                  <h3>{pullRequest.title}</h3>
                  <p>
                    #{pullRequest.number}
                    {pullRequest.author ? ` by ${pullRequest.author}` : ''}
                  </p>
                </div>
                <Badge tone={pullRequest.status === 'open' ? 'complete' : 'closed'}>
                  {pullRequest.status}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="project-detail__issues" aria-labelledby="issues-title">
        <div className="projects-page__section-heading">
          <h2 id="issues-title">Issues</h2>
          <span>{issues.length} synced</span>
        </div>

        {issues.length === 0 ? (
          <div className="projects-page__empty">No issues found.</div>
        ) : (
          <div className="project-detail__issue-list">
            {issues.map((issue) => {
              const linkedCount = linkedPrCountFor(issue, pullRequests)
              const visibleLabels = issue.labels.slice(0, 2)
              const overflowCount = issue.labels.length - visibleLabels.length

              return (
                <a
                  key={issue.id}
                  href={`${repository?.githubUrl}/issues/${issue.githubIssueNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="project-detail__issue-row"
                >
                  <CircleDot size={16} />
                  <div>
                    <h3>{issue.title}</h3>
                    <p>
                      #{issue.githubIssueNumber}
                      {visibleLabels.length > 0 && (
                        <span className="project-detail__label-chips">
                          {visibleLabels.map((label) => (
                            <span key={label} className="project-detail__label-chip">
                              {label}
                            </span>
                          ))}
                          {overflowCount > 0 && (
                            <span className="project-detail__label-chip">+{overflowCount}</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="project-detail__issue-badges">
                    <Badge tone={issue.state === 'open' ? 'complete' : 'closed'}>
                      {issue.state}
                    </Badge>
                    <Badge tone={linkedCount > 0 ? 'active' : 'neutral'}>{linkedCount} PRs</Badge>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

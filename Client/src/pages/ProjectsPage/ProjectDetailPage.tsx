import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, GitBranch, GitPullRequest } from 'lucide-react'
import api from '@/utils/axios'
import './ProjectsPage.css'

interface PullRequest {
  id: string
  number: number
  title: string
  author?: string
  status: string
  githubUrl: string
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
  syncStatus: string
  githubRepositories?: GithubRepository[]
  pullRequests?: PullRequest[]
}

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
        <span className={`projects-page__status-pill projects-page__status-pill--${project.syncStatus}`}>
          {project.syncStatus}
        </span>
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
                <span className="projects-page__status-pill projects-page__status-pill--complete">
                  {pullRequest.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

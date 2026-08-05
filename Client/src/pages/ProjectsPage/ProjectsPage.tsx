import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, GitBranch, Loader2, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/axios'
import { redirectToGitHub } from '@/utils/github'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import './ProjectsPage.css'

interface GithubRepository {
  id: string
  fullName: string
  githubUrl: string
  visibility: string
  lastSyncedAt?: string
}

interface Project {
  id: string
  title: string
  name?: string
  description?: string
  status: string
  syncStatus: 'pending' | 'syncing' | 'complete' | 'partial' | 'failed'
  githubRepositories?: GithubRepository[]
  createdAt: string
  lastSyncedAt?: string
}

type SyncState = 'idle' | 'syncing' | 'complete' | 'failed'

// 'partial' is visually treated as 'complete' — it still means usable, synced data.
const syncStatusTone = (syncStatus: Project['syncStatus']): BadgeTone =>
  syncStatus === 'partial' ? 'complete' : syncStatus

const repoPattern =
  /^(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/

const getSyncErrorMessage = (code?: string, status?: number) => {
  if (code === 'INVALID_REPO_URL') {
    return 'Enter a GitHub repository URL like https://github.com/owner/repo or owner/repo.'
  }

  if (code === 'GITHUB_NOT_CONNECTED') {
    return 'Connect GitHub first so Shipyard can verify repository access.'
  }

  if (code === 'REPO_NOT_FOUND' || status === 404) {
    return 'Repository not found. Check the owner and repository name.'
  }

  if (code === 'REPO_ACCESS_DENIED' || status === 403) {
    return 'Access denied. Your connected GitHub account cannot access this repository.'
  }

  if (code === 'GITHUB_RATE_LIMITED' || status === 429) {
    return 'GitHub rate limit reached. Try again after the reset window.'
  }

  return 'Shipyard could not sync this repository. Please try again.'
}

export function ProjectsPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState('')
  const [repoError, setRepoError] = useState('')
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  const githubConnected = Boolean(user?.github?.connected)

  const sortedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
    )
  }, [projects])

  useEffect(() => {
    async function fetchProjects() {
      setIsLoadingProjects(true)
      try {
        const response = await api.get('/projects')
        setProjects(response.data.data || [])
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    refreshUser()
    fetchProjects()
  }, [refreshUser])

  function validateRepoUrl() {
    const value = repoUrl.trim()
    if (!value) {
      setRepoError('Repository URL is required.')
      return false
    }

    if (!repoPattern.test(value)) {
      setRepoError('Use https://github.com/owner/repo or owner/repo.')
      return false
    }

    setRepoError('')
    return true
  }

  async function handleCreateProject(event: FormEvent) {
    event.preventDefault()
    if (!validateRepoUrl()) return

    if (!githubConnected) {
      setSyncState('failed')
      setSyncMessage('Connect GitHub before creating a project from a repository.')
      return
    }

    setSyncState('syncing')
    setSyncMessage('Verifying repository access and syncing open pull requests...')

    try {
      const response = await api.post('/projects/sync', { repoUrl: repoUrl.trim() })
      const project = response.data.data.project as Project
      const sync = response.data.data.sync

      setSyncState('complete')
      setSyncMessage(
        `Synced ${sync.syncedPullRequests} open pull request${
          sync.syncedPullRequests === 1 ? '' : 's'
        }.`,
      )
      navigate(`/dashboard/projects/${project.id}`, { replace: false })
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number; data?: { code?: string; error?: string } }
      }
      setSyncState('failed')
      setSyncMessage(
        axiosError.response?.data?.error ||
          getSyncErrorMessage(axiosError.response?.data?.code, axiosError.response?.status),
      )
    }
  }

  return (
    <div className="projects-page">
      <header className="projects-page__header">
        <div>
          <p className="projects-page__eyebrow">GitHub source of truth</p>
          <h1 className="projects-page__title">Projects</h1>
          <p className="projects-page__subtitle">
            Create a Shipyard project from a repository and start with open pull request sync.
          </p>
        </div>
      </header>

      <section className="projects-page__sync-panel" aria-labelledby="create-project-title">
        <div className="projects-page__sync-header">
          <div>
            <h2 id="create-project-title">Create a new Project</h2>
            <p>Paste a GitHub repository URL. Shipyard verifies access before importing PRs.</p>
          </div>
          <span
            className={`projects-page__github-state ${
              githubConnected ? 'projects-page__github-state--connected' : ''
            }`}
          >
            {githubConnected ? <ShieldCheck size={16} /> : <GitBranch size={16} />}
            {githubConnected ? `Connected as ${user?.github?.login}` : 'GitHub not connected'}
          </span>
        </div>

        {!githubConnected && (
          <div className="projects-page__connect-callout" role="status">
            <AlertCircle size={16} />
            <span>Connect GitHub to verify private repositories and read pull requests.</span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              iconLeft={<GitBranch size={16} />}
              onClick={() => redirectToGitHub('/dashboard/projects')}
            >
              Connect GitHub
            </Button>
          </div>
        )}

        <form className="projects-page__form" onSubmit={handleCreateProject} noValidate>
          <Input
            id="repo-url"
            label="Repository"
            placeholder="https://github.com/acme/api-service"
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value)
              if (repoError) setRepoError('')
            }}
            onBlur={validateRepoUrl}
            error={repoError}
          />
          <Button
            type="submit"
            variant="primary"
            iconLeft={<Plus size={16} />}
            isLoading={syncState === 'syncing'}
            disabled={!githubConnected}
          >
            Create Project
          </Button>
        </form>

        {syncState !== 'idle' && (
          <div className={`projects-page__sync-status projects-page__sync-status--${syncState}`}>
            {syncState === 'syncing' && <Loader2 size={16} className="projects-page__spinner" />}
            {syncState === 'complete' && <CheckCircle2 size={16} />}
            {syncState === 'failed' && <AlertCircle size={16} />}
            <span>{syncMessage}</span>
          </div>
        )}
      </section>

      <section className="projects-page__list" aria-labelledby="project-list-title">
        <div className="projects-page__section-heading">
          <h2 id="project-list-title">Synced Projects</h2>
          <span>{sortedProjects.length} total</span>
        </div>

        {isLoadingProjects ? (
          <div className="projects-page__empty">Loading projects...</div>
        ) : sortedProjects.length === 0 ? (
          <div className="projects-page__empty">No synced projects yet.</div>
        ) : (
          <div className="projects-page__project-grid">
            {sortedProjects.map((project) => {
              const repository = project.githubRepositories?.[0]

              return (
                <Link
                  key={project.id}
                  to={`/dashboard/projects/${project.id}`}
                  className="projects-page__project-card"
                >
                  <div>
                    <h3>{project.name || project.title}</h3>
                    <p>{project.description || 'No repository description provided.'}</p>
                  </div>
                  {repository && (
                    <span className="projects-page__repo-chip">
                      <GitBranch size={14} />
                      {repository.fullName}
                    </span>
                  )}
                  <div className="projects-page__card-footer">
                    <Badge tone={syncStatusTone(project.syncStatus)}>{project.syncStatus}</Badge>
                    <span className="projects-page__last-synced">
                      Last synced {formatRelativeTime(project.lastSyncedAt)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

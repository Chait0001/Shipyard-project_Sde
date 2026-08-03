import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { GitBranch, Star, GitFork, Lock, Globe, Search, ExternalLink, RefreshCw, Layers } from 'lucide-react'
import './ReposPage.css'

export interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string
  language: string
  stargazersCount: number
  forksCount: number
  isPrivate: boolean
  htmlUrl: string
  updatedAt: string
}

export function ReposPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/github/repos')
      setRepos(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
      setError('Could not load GitHub repositories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  // Extract unique programming languages for filter
  const languages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean)),
  )

  // Filter repositories by search query & language
  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLang = selectedLanguage === 'all' || repo.language === selectedLanguage
    return matchesSearch && matchesLang
  })

  return (
    <div className="repos-page">
      {/* Header */}
      <div className="repos-header">
        <div>
          <h1 className="repos-title">GitHub Repositories</h1>
          <p className="repos-subtitle">
            Synchronized repositories, activity feeds, and code intelligence from your GitHub account.
          </p>
        </div>
        <button onClick={fetchRepos} className="repos-refresh-btn" disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>Sync Repos</span>
        </button>
      </div>

      {/* Controls: Search and Filter */}
      <div className="repos-controls">
        <div className="repos-search">
          <Search size={16} className="repos-search-icon" />
          <input
            type="text"
            placeholder="Search repositories by name or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="repos-search-input"
          />
        </div>

        <div className="repos-filter">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="repos-select"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="repos-loading">
          <div className="repos-spinner" />
          <p>Fetching repositories from GitHub…</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="repos-error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Repositories Grid */}
      {!isLoading && !error && (
        <>
          {filteredRepos.length === 0 ? (
            <div className="repos-empty">
              <Layers size={40} className="repos-empty-icon" />
              <h3>No matching repositories found</h3>
              <p>Try refining your search or language filter.</p>
            </div>
          ) : (
            <div className="repos-grid">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="repo-card">
                  <div className="repo-card__header">
                    <div className="repo-card__title-area">
                      <GitBranch size={18} className="repo-card__icon" />
                      <h2 className="repo-card__name">{repo.name}</h2>
                    </div>
                    <span
                      className={`repo-card__badge ${
                        repo.isPrivate ? 'repo-card__badge--private' : 'repo-card__badge--public'
                      }`}
                    >
                      {repo.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>

                  <p className="repo-card__desc">{repo.description}</p>

                  <div className="repo-card__footer">
                    <div className="repo-card__meta">
                      {repo.language && (
                        <span className="repo-card__lang">
                          <span className="repo-card__lang-dot" />
                          {repo.language}
                        </span>
                      )}
                      <span className="repo-card__stat">
                        <Star size={13} />
                        {repo.stargazersCount}
                      </span>
                      <span className="repo-card__stat">
                        <GitFork size={13} />
                        {repo.forksCount}
                      </span>
                    </div>

                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-card__link"
                      title="Open on GitHub"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

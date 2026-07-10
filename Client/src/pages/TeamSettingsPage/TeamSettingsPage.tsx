import { useState, useEffect } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { useOrganisation } from '@/context/OrganisationContext'
import api from '@/utils/axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
  ArrowLeft,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Bell,
  Shield,
} from 'lucide-react'
import './TeamSettingsPage.css'

interface TeamSettings {
  id: string
  name: string
  slug: string
  description: string
}

const MOCK_SETTINGS: TeamSettings = {
  id: 'team_1',
  name: 'Frontend Platform',
  slug: 'frontend',
  description:
    'Maintains client architecture, design system development, and portal performance.',
}

interface FormErrors {
  name?: string
  slug?: string
  description?: string
}


export function TeamSettingsPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { activeOrganisation } = useOrganisation()
  const navigate = useNavigate()

  // General settings state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [originalSettings, setOriginalSettings] = useState<TeamSettings | null>(null)

  // Notification preferences state
  const [notifyOnMemberJoin, setNotifyOnMemberJoin] = useState(true)
  const [notifyOnProjectUpdate, setNotifyOnProjectUpdate] = useState(true)
  const [notifyOnPermissionChange, setNotifyOnPermissionChange] = useState(false)

  // Page state
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notification, setNotification] = useState<string | null>(null)

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchSettings() {
      if (!activeOrganisation || !teamId) {
        if (isMounted) {
          setOriginalSettings(MOCK_SETTINGS)
          setName(MOCK_SETTINGS.name)
          setSlug(MOCK_SETTINGS.slug)
          setDescription(MOCK_SETTINGS.description)
          setIsDemoMode(true)
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setIsDemoMode(false)
      }

      try {
        const response = await api.get(
          `/organisations/${activeOrganisation.id}/teams/${teamId}`,
        )
        if (isMounted) {
          const data = response.data
          setOriginalSettings(data)
          setName(data.name || '')
          setSlug(data.slug || '')
          setDescription(data.description || '')
          setIsDemoMode(false)
        }
      } catch (err: any) {
        console.warn('API error fetching team settings, falling back to mock data:', err)
        if (isMounted) {
          setOriginalSettings(MOCK_SETTINGS)
          setName(MOCK_SETTINGS.name)
          setSlug(MOCK_SETTINGS.slug)
          setDescription(MOCK_SETTINGS.description)
          setIsDemoMode(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSettings()

    return () => {
      isMounted = false
    }
  }, [activeOrganisation, teamId])

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 4000)
  }

  const hasGeneralChanges =
    originalSettings &&
    (name !== originalSettings.name ||
      slug !== originalSettings.slug ||
      description !== originalSettings.description)

  const validateGeneral = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Team name is required.'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters.'
    } else if (name.trim().length > 64) {
      newErrors.name = 'Team name must not exceed 64 characters.'
    }

    if (!slug.trim()) {
      newErrors.slug = 'A team identifier (slug) is required.'
    } else if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug.trim())) {
      newErrors.slug = 'Slug must start and end with a letter or number.'
    }

    if (description.length > 280) {
      newErrors.description = 'Description must not exceed 280 characters.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveGeneral = async () => {
    if (!validateGeneral()) return

    setIsSaving(true)

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
    }

    try {
      if (activeOrganisation && teamId) {
        await api.patch(
          `/organisations/${activeOrganisation.id}/teams/${teamId}`,
          payload,
        )
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400))
      }
      setOriginalSettings((prev) => (prev ? { ...prev, ...payload } : prev))
      showNotification('Team settings saved successfully.')
    } catch (err: any) {
      console.error('Failed to save team settings:', err)
      showNotification('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)

    const payload = {
      notifyOnMemberJoin,
      notifyOnProjectUpdate,
      notifyOnPermissionChange,
    }

    try {
      if (activeOrganisation && teamId) {
        await api.patch(
          `/organisations/${activeOrganisation.id}/teams/${teamId}/notifications`,
          payload,
        )
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400))
      }
      showNotification('Notification preferences updated.')
    } catch (err: any) {
      console.error('Failed to save notification preferences:', err)
      showNotification('Failed to update preferences. Please try again.')
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleDeleteTeam = async () => {
    setIsDeleting(true)

    try {
      if (activeOrganisation && teamId) {
        await api.delete(
          `/organisations/${activeOrganisation.id}/teams/${teamId}`,
        )
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      navigate('/dashboard/teams', { replace: true })
    } catch (err: any) {
      console.error('Failed to delete team:', err)
      showNotification('Failed to delete team. Please try again.')
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  const handleSlugChange = (value: string) => {
    const sanitised = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
    setSlug(sanitised)
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }))
  }

  if (loading) {
    return (
      <div className="team-settings-page">
        <div className="team-settings-page__skeleton" aria-hidden="true">
          <div className="team-settings-page__skeleton-header" />
          <div className="team-settings-page__skeleton-card">
            <div className="team-settings-page__skeleton-line team-settings-page__skeleton-line--wide" />
            <div className="team-settings-page__skeleton-line team-settings-page__skeleton-line--medium" />
            <div className="team-settings-page__skeleton-line team-settings-page__skeleton-line--narrow" />
          </div>
          <div className="team-settings-page__skeleton-card">
            <div className="team-settings-page__skeleton-line team-settings-page__skeleton-line--medium" />
            <div className="team-settings-page__skeleton-line team-settings-page__skeleton-line--wide" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="team-settings-page">
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteConfirmText('')
        }}
        title="Delete Team"
        description="This action is permanent and cannot be undone. All projects, issues, and member associations within this team will be removed."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeleteConfirmText('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              isLoading={isDeleting}
              disabled={deleteConfirmText !== originalSettings?.name}
              iconLeft={!isDeleting ? <Trash2 size={16} /> : undefined}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="team-settings-page__delete-confirm">
          <div className="team-settings-page__delete-warning">
            <AlertTriangle size={20} className="team-settings-page__delete-warning-icon" />
            <p className="team-settings-page__delete-warning-text">
              This will permanently delete <strong>{originalSettings?.name}</strong> and
              all associated data. This action cannot be reversed.
            </p>
          </div>
          <Input
            id="delete-confirm-name"
            label={`Type "${originalSettings?.name}" to confirm`}
            placeholder={originalSettings?.name}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>
      </Modal>

      {/* Toast Notification */}
      {notification && (
        <div className="team-settings-page__toast" role="alert">
          <CheckCircle2 size={16} className="team-settings-page__toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Back navigation */}
      <nav className="team-settings-page__breadcrumb-nav">
        <NavLink
          to={`/dashboard/teams/${teamId}`}
          className="team-settings-page__back-link"
        >
          <ArrowLeft size={16} />
          <span>Back to Team</span>
        </NavLink>
      </nav>

      {/* Header */}
      <header className="team-settings-page__header">
        <div className="team-settings-page__header-text">
          <div className="team-settings-page__header-title-row">
            <Settings size={22} className="team-settings-page__header-icon" />
            <h1 className="team-settings-page__title">Team Settings</h1>
          </div>
          <p className="team-settings-page__subtitle">
            Manage settings, notifications, and configuration for{' '}
            <strong>{originalSettings?.name}</strong>.
          </p>
        </div>
      </header>

      {/* Demo notice */}
      {isDemoMode && (
        <div className="team-settings-page__notice">
          <AlertCircle size={16} className="team-settings-page__notice-icon" />
          <div className="team-settings-page__notice-content">
            <span className="team-settings-page__notice-title">
              Running in Offline Demo Mode
            </span>
            <span className="team-settings-page__notice-desc">
              Changes will be simulated locally and will not persist.
            </span>
          </div>
        </div>
      )}

      {/* ===== GENERAL SETTINGS SECTION ===== */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div className="settings-card__header-info">
            <Shield size={18} className="settings-card__header-icon" />
            <div>
              <h2 className="settings-card__title">General</h2>
              <p className="settings-card__description">
                Core team identity and metadata.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-card__body">
          <Input
            id="settings-team-name"
            label="Team Name"
            placeholder="e.g. Frontend Platform"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            error={errors.name}
            maxLength={64}
          />

          <div className="settings-card__field-with-hint">
            <Input
              id="settings-team-slug"
              label="Identifier (Slug)"
              placeholder="e.g. frontend-platform"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
              maxLength={64}
            />
            <span className="settings-card__hint">
              Used in URLs and API references: <code>t/{slug || '...'}</code>
            </span>
          </div>

          <div className="settings-card__textarea-group">
            <label htmlFor="settings-team-description" className="input-label">
              Description
            </label>
            <textarea
              id="settings-team-description"
              className={`settings-card__textarea ${errors.description ? 'settings-card__textarea--error' : ''}`}
              placeholder="Briefly describe this team's purpose..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }))
              }}
              rows={3}
              maxLength={280}
              aria-invalid={!!errors.description}
            />
            <div className="settings-card__textarea-footer">
              {errors.description ? (
                <p className="input-error" role="alert">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="settings-card__char-count">
                {description.length}/280
              </span>
            </div>
          </div>
        </div>

        <div className="settings-card__footer">
          <Button
            variant="primary"
            onClick={handleSaveGeneral}
            isLoading={isSaving}
            disabled={!hasGeneralChanges}
            iconLeft={!isSaving ? <Save size={16} /> : undefined}
          >
            Save Changes
          </Button>
        </div>
      </section>

      {/* ===== NOTIFICATIONS SECTION ===== */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div className="settings-card__header-info">
            <Bell size={18} className="settings-card__header-icon" />
            <div>
              <h2 className="settings-card__title">Notifications</h2>
              <p className="settings-card__description">
                Configure which events trigger notifications for this team.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-card__body">
          <label className="settings-toggle" htmlFor="notify-member-join">
            <div className="settings-toggle__text">
              <span className="settings-toggle__label">Member Joins</span>
              <span className="settings-toggle__desc">
                Receive a notification when a new member accepts a team invitation.
              </span>
            </div>
            <div className="settings-toggle__switch-wrapper">
              <input
                type="checkbox"
                id="notify-member-join"
                className="settings-toggle__input"
                checked={notifyOnMemberJoin}
                onChange={(e) => setNotifyOnMemberJoin(e.target.checked)}
              />
              <span className="settings-toggle__switch" aria-hidden="true" />
            </div>
          </label>

          <label className="settings-toggle" htmlFor="notify-project-update">
            <div className="settings-toggle__text">
              <span className="settings-toggle__label">Project Updates</span>
              <span className="settings-toggle__desc">
                Get notified when linked projects are updated or milestones are reached.
              </span>
            </div>
            <div className="settings-toggle__switch-wrapper">
              <input
                type="checkbox"
                id="notify-project-update"
                className="settings-toggle__input"
                checked={notifyOnProjectUpdate}
                onChange={(e) => setNotifyOnProjectUpdate(e.target.checked)}
              />
              <span className="settings-toggle__switch" aria-hidden="true" />
            </div>
          </label>

          <label className="settings-toggle" htmlFor="notify-permission-change">
            <div className="settings-toggle__text">
              <span className="settings-toggle__label">Permission Changes</span>
              <span className="settings-toggle__desc">
                Alert when member roles or access permissions are modified.
              </span>
            </div>
            <div className="settings-toggle__switch-wrapper">
              <input
                type="checkbox"
                id="notify-permission-change"
                className="settings-toggle__input"
                checked={notifyOnPermissionChange}
                onChange={(e) => setNotifyOnPermissionChange(e.target.checked)}
              />
              <span className="settings-toggle__switch" aria-hidden="true" />
            </div>
          </label>
        </div>

        <div className="settings-card__footer">
          <Button
            variant="primary"
            onClick={handleSaveNotifications}
            isLoading={isSavingNotifications}
            iconLeft={!isSavingNotifications ? <Save size={16} /> : undefined}
          >
            Save Preferences
          </Button>
        </div>
      </section>

      {/* ===== DANGER ZONE ===== */}
      <section className="settings-card settings-card--danger">
        <div className="settings-card__header settings-card__header--danger">
          <div className="settings-card__header-info">
            <AlertTriangle size={18} className="settings-card__header-icon--danger" />
            <div>
              <h2 className="settings-card__title">Danger Zone</h2>
              <p className="settings-card__description">
                Irreversible and destructive actions for this team.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-card__body">
          <div className="danger-action">
            <div className="danger-action__text">
              <span className="danger-action__label">Delete this team</span>
              <span className="danger-action__desc">
                Permanently remove the team, its projects, and all member associations.
                This cannot be undone.
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              iconLeft={<Trash2 size={14} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

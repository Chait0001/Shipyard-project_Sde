import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useOrganisation } from '@/context/OrganisationContext'
import api from '@/utils/axios'
import { Users } from 'lucide-react'
import './CreateTeamModal.css'

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onTeamCreated: (team: CreatedTeam) => void
}

export interface CreatedTeam {
  id: string
  name: string
  slug: string
  memberCount: number
  description?: string
  projectCount?: number
}

interface FormErrors {
  name?: string
  slug?: string
  description?: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CreateTeamModal({ isOpen, onClose, onTeamCreated }: CreateTeamModalProps) {
  const { activeOrganisation } = useOrganisation()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setIsSlugManuallyEdited(false)
    setIsSubmitting(false)
    setErrors({})
    setApiError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
    // Auto-generate slug from name unless user has manually edited slug
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true)
    // Only allow valid slug characters
    const sanitised = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
    setSlug(sanitised)
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined }))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }))
    }
  }

  const validate = (): boolean => {
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
    } else if (slug.trim().length < 2) {
      newErrors.slug = 'Slug must be at least 2 characters.'
    } else if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug.trim())) {
      newErrors.slug = 'Slug must start and end with a letter or number.'
    }

    if (description.length > 280) {
      newErrors.description = 'Description must not exceed 280 characters.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    setIsSubmitting(true)

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
    }

    try {
      if (activeOrganisation) {
        const response = await api.post(
          `/organisations/${activeOrganisation.id}/teams`,
          payload,
        )
        onTeamCreated(response.data)
      } else {
        // Demo / offline mode — simulate team creation with a generated ID
        const demoTeam: CreatedTeam = {
          id: `team_${Date.now()}`,
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          memberCount: 1,
          projectCount: 0,
        }
        // Slight delay to mimic real API call
        await new Promise((resolve) => setTimeout(resolve, 400))
        onTeamCreated(demoTeam)
      }
      handleClose()
    } catch (err: any) {
      console.error('Failed to create team:', err)
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Team"
      description="Teams let you organise members, manage projects, and control permissions within your workspace."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            iconLeft={!isSubmitting ? <Users size={16} /> : undefined}
          >
            Create Team
          </Button>
        </>
      }
    >
      <form
        className="create-team-form"
        onSubmit={handleSubmit}
        noValidate
        id="create-team-form"
      >
        {/* API Error Banner */}
        {apiError && (
          <div className="create-team-form__error-banner" role="alert">
            <span className="create-team-form__error-banner-text">{apiError}</span>
          </div>
        )}

        {/* Team Name */}
        <Input
          id="create-team-name"
          label="Team Name"
          placeholder="e.g. Frontend Platform"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          autoComplete="off"
          maxLength={64}
          required
        />

        {/* Slug / Identifier */}
        <div className="create-team-form__slug-group">
          <Input
            id="create-team-slug"
            label="Identifier"
            placeholder="e.g. frontend-platform"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            error={errors.slug}
            autoComplete="off"
            maxLength={64}
            required
          />
          <span className="create-team-form__slug-preview">
            t/<span className="create-team-form__slug-value">{slug || '...'}</span>
          </span>
        </div>

        {/* Description */}
        <div className="create-team-form__textarea-group">
          <label htmlFor="create-team-description" className="input-label">
            Description
            <span className="create-team-form__optional">(optional)</span>
          </label>
          <textarea
            id="create-team-description"
            className={`create-team-form__textarea ${errors.description ? 'create-team-form__textarea--error' : ''}`}
            placeholder="Briefly describe this team's purpose and responsibilities..."
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={3}
            maxLength={280}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'create-team-description-error' : undefined}
          />
          <div className="create-team-form__textarea-footer">
            {errors.description ? (
              <p
                id="create-team-description-error"
                className="input-error"
                role="alert"
              >
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="create-team-form__char-count">
              {description.length}/280
            </span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

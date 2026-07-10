import { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Role } from '@/utils/roles'
import { useOrganisation } from '@/context/OrganisationContext'
import api from '@/utils/axios'
import { Mail, ChevronDown, Shield, Check, UserPlus } from 'lucide-react'
import './InviteMemberModal.css'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  teamName: string
  onMemberInvited: (invitation: InvitedMember) => void
}

export interface InvitedMember {
  id: string
  email: string
  role: Role
  status: 'pending' | 'accepted'
  invitedAt: string
}

interface FormErrors {
  email?: string
  role?: string
}

const ASSIGNABLE_ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view projects and issues' },
  { value: 'engineer', label: 'Engineer', description: 'Can create and manage issues' },
  { value: 'manager', label: 'Manager', description: 'Can manage team settings and members' },
  { value: 'admin', label: 'Admin', description: 'Full team administration access' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteMemberModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  onMemberInvited,
}: InviteMemberModalProps) {
  const { activeOrganisation } = useOrganisation()

  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('engineer')
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const roleDropdownRef = useRef<HTMLDivElement>(null)

  const resetForm = () => {
    setEmail('')
    setSelectedRole('engineer')
    setIsRoleDropdownOpen(false)
    setIsSubmitting(false)
    setErrors({})
    setApiError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Close role dropdown on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
      setIsRoleDropdownOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isRoleDropdownOpen, handleClickOutside])

  // Close role dropdown on Escape
  const handleRoleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setIsRoleDropdownOpen(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (apiError) {
      setApiError(null)
    }
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setIsRoleDropdownOpen(false)
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!selectedRole) {
      newErrors.role = 'Please select a role for the invited member.'
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
      email: email.trim().toLowerCase(),
      role: selectedRole,
    }

    try {
      if (activeOrganisation) {
        const response = await api.post(
          `/organisations/${activeOrganisation.id}/teams/${teamId}/invitations`,
          payload,
        )
        onMemberInvited(response.data)
      } else {
        // Demo / offline mode — simulate invitation
        const demoInvitation: InvitedMember = {
          id: `inv_${Date.now()}`,
          email: payload.email,
          role: payload.role,
          status: 'pending',
          invitedAt: new Date().toISOString(),
        }
        await new Promise((resolve) => setTimeout(resolve, 400))
        onMemberInvited(demoInvitation)
      }
      handleClose()
    } catch (err: any) {
      console.error('Failed to invite member:', err)
      const message =
        err.response?.data?.message || 'Failed to send invitation. Please try again.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRoleData = ASSIGNABLE_ROLES.find((r) => r.value === selectedRole)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Member"
      description={`Send an invitation to join the ${teamName} team.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            iconLeft={!isSubmitting ? <UserPlus size={16} /> : undefined}
          >
            Send Invite
          </Button>
        </>
      }
    >
      <form
        className="invite-form"
        onSubmit={handleSubmit}
        noValidate
        id="invite-member-form"
      >
        {/* API Error Banner */}
        {apiError && (
          <div className="invite-form__error-banner" role="alert">
            <span className="invite-form__error-banner-text">{apiError}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="invite-form__email-group">
          <Input
            id="invite-member-email"
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <div className="invite-form__email-hint">
            <Mail size={12} className="invite-form__hint-icon" />
            <span>An invitation email will be sent to this address.</span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="invite-form__role-group">
          <label className="input-label" id="invite-role-label">
            Role
          </label>
          <div
            className="invite-form__role-dropdown"
            ref={roleDropdownRef}
            onKeyDown={handleRoleKeyDown}
          >
            <button
              type="button"
              className={`invite-form__role-trigger ${isRoleDropdownOpen ? 'invite-form__role-trigger--open' : ''}`}
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isRoleDropdownOpen}
              aria-labelledby="invite-role-label"
            >
              <div className="invite-form__role-trigger-content">
                <Shield size={14} className="invite-form__role-trigger-icon" />
                <span className="invite-form__role-trigger-text">
                  {selectedRoleData?.label || 'Select role'}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`invite-form__role-chevron ${isRoleDropdownOpen ? 'invite-form__role-chevron--open' : ''}`}
              />
            </button>

            {isRoleDropdownOpen && (
              <ul
                className="invite-form__role-menu"
                role="listbox"
                aria-labelledby="invite-role-label"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <li
                    key={role.value}
                    className={`invite-form__role-option ${selectedRole === role.value ? 'invite-form__role-option--selected' : ''}`}
                    role="option"
                    aria-selected={selectedRole === role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleRoleSelect(role.value)
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="invite-form__role-option-content">
                      <span className="invite-form__role-option-label">
                        {role.label}
                      </span>
                      <span className="invite-form__role-option-desc">
                        {role.description}
                      </span>
                    </div>
                    {selectedRole === role.value && (
                      <Check size={14} className="invite-form__role-check" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.role && (
            <p className="input-error" role="alert">
              {errors.role}
            </p>
          )}
        </div>
      </form>
    </Modal>
  )
}

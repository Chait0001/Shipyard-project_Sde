/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '@/utils/axios'
import { useAuth } from '@/context/AuthContext'

export interface Organisation {
  id: string
  name: string
  slug: string
  role: string
}

interface OrganisationContextType {
  organisations: Organisation[]
  activeOrganisation: Organisation | null
  isLoading: boolean
  error: string | null
  selectOrganisation: (id: string) => void
  refreshOrganisations: () => Promise<void>
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined)

export function OrganisationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [activeOrganisation, setActiveOrganisation] = useState<Organisation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganisations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/organisations')
      const data: Organisation[] = response.data
      setOrganisations(data)

      if (data.length > 0) {
        // Resolve active organization from local storage or default to first
        const savedId = localStorage.getItem('active-organisation-id')
        const matched = data.find((org) => org.id === savedId)
        const active = matched || data[0]

        setActiveOrganisation(active)
        localStorage.setItem('active-organisation-id', active.id)
      } else {
        setActiveOrganisation(null)
        localStorage.removeItem('active-organisation-id')
      }
    } catch (err: any) {
      console.error('Failed to load organisations:', err)
      setError(err.response?.data?.message || 'Failed to fetch organisations')
      setOrganisations([])
      setActiveOrganisation(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch organisations on mount or authentication change
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganisations()
    } else {
      setOrganisations([])
      setActiveOrganisation(null)
    }
  }, [isAuthenticated, fetchOrganisations])

  const selectOrganisation = useCallback((id: string) => {
    setOrganisations((prevOrgs) => {
      const matched = prevOrgs.find((org) => org.id === id)
      if (matched) {
        setActiveOrganisation(matched)
        localStorage.setItem('active-organisation-id', id)
      }
      return prevOrgs
    })
  }, [])

  return (
    <OrganisationContext.Provider
      value={{
        organisations,
        activeOrganisation,
        isLoading,
        error,
        selectOrganisation,
        refreshOrganisations: fetchOrganisations,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  )
}

export function useOrganisation() {
  const context = useContext(OrganisationContext)
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider')
  }
  return context
}
export default OrganisationContext

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import api from '@/utils/axios'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  globalRole?: string
  githubUsername?: string
  github?: {
    connected: boolean
    login?: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGitHub: (code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

function AuthProviderWithClerk({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const clerk = useClerk()

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    if (clerk && clerk.signOut) {
      clerk.signOut().catch(() => {})
    }
  }

  // Handle Clerk User Synchronization with Backend Database & JWT
  useEffect(() => {
    async function syncClerkUser() {
      if (clerkUser) {
        try {
          const email = clerkUser.primaryEmailAddress?.emailAddress
          const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'GitHub User'
          const avatarUrl = clerkUser.imageUrl

          const githubAccount = clerkUser.externalAccounts?.find(
            (acc) => acc.provider === 'github',
          )
          const githubUsername = githubAccount?.username || clerkUser.username || null

          if (email) {
            const response = await api.post('/auth/github', {
              email,
              name,
              avatarUrl,
              githubUsername,
            })

            const { token, user: userData } = response.data
            localStorage.setItem('token', token)
            setUser({
              id: userData.id || userData._id,
              name: userData.name,
              email: userData.email,
              avatarUrl: userData.avatarUrl,
              globalRole: userData.globalRole || 'engineer',
            })
          }
        } catch (err) {
          console.error('Failed to sync Clerk user with backend:', err)
        } finally {
          setIsLoading(false)
        }
      } else if (clerkLoaded) {
        // Clerk loaded but no user is signed in
        const token = localStorage.getItem('token')
        if (token) {
          api
            .get('/auth/me')
            .then((res) => setUser(res.data))
            .catch(() => logout())
            .finally(() => setIsLoading(false))
        } else {
          setIsLoading(false)
        }
      }
    }

    syncClerkUser()
  }, [clerkLoaded, clerkUser])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async (code: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/github', { code })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, signup, loginWithGitHub, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function AuthProviderStandard({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to authenticate token:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async (code: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/github', { code })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        globalRole: userData.globalRole || 'engineer',
      })
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, signup, loginWithGitHub, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (CLERK_PUBLISHABLE_KEY) {
    return <AuthProviderWithClerk>{children}</AuthProviderWithClerk>
  }
  return <AuthProviderStandard>{children}</AuthProviderStandard>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

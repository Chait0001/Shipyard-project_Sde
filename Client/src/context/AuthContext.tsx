/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '@/utils/axios'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  globalRole?: string
  github?: {
    connected: boolean
    login?: string
    avatarUrl?: string
    scopes?: string
    connectedAt?: string
    lastVerifiedAt?: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  connectGitHub: (code: string) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
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
  }, [logout])

  // Fetch current user details on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data

      // Store token
      localStorage.setItem('token', token)

      // Adapt backend model (id vs _id)
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

      // Store token
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

  const connectGitHub = async (code: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/github', { code })
      const { token, user: userData, github } = response.data

      if (token && userData) {
        localStorage.setItem('token', token)
        setUser(userData)
        return
      }

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              github,
              avatarUrl: currentUser.avatarUrl || github?.avatarUrl,
            }
          : currentUser,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        connectGitHub,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

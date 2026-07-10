import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { OrganisationProvider } from '@/context/OrganisationContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'
import { TeamsPage } from '@/pages/TeamsPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import './index.css'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ padding: 'var(--space-2)' }}>
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ marginBottom: 'var(--space-1)', color: 'var(--color-foreground)' }}
      >
        {title}
      </h1>
      <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
        {description}
      </p>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganisationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/oauth/github/callback" element={<OAuthCallbackPage />} />

              {/* Protected routes — requires authentication */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route
                    path="/dashboard"
                    element={
                      <PlaceholderPage
                        title="Dashboard"
                        description="Personal developer workspace, assigned issues, and active PRs."
                      />
                    }
                  />
                  <Route
                    path="/dashboard/projects"
                    element={
                      <PlaceholderPage
                        title="Projects"
                        description="Project tracking, Kanban board, and issue backlogs."
                      />
                    }
                  />
                  <Route path="/dashboard/teams" element={<TeamsPage />} />
                  <Route
                    path="/dashboard/repos"
                    element={
                      <PlaceholderPage
                        title="Repositories"
                        description="Connect GitHub repositories and configure sync status."
                      />
                    }
                  />
                  <Route
                    path="/dashboard/analytics"
                    element={
                      <PlaceholderPage
                        title="Analytics"
                        description="Engineering velocity, burndown charts, and review time analysis."
                      />
                    }
                  />
                  <Route
                    path="/dashboard/releases"
                    element={
                      <PlaceholderPage
                        title="Releases"
                        description="Release timeline, generation logs, and associated work items."
                      />
                    }
                  />
                </Route>
                {/* Redirect any other authenticated access to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </OrganisationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

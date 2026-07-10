import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="*"
            element={
              <div className="app">
                <main className="app-main">
                  <div className="app-welcome">
                    <h1 className="app-title">Shipyard</h1>
                    <p className="app-subtitle">Engineering Operations &amp; Intelligence Platform</p>
                  </div>
                </main>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

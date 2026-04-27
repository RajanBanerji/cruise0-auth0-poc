import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import EmailVerificationRequired from './pages/EmailVerificationRequired'
import Loading from './components/Loading'

function App() {
  const { isLoading, isAuthenticated, user } = useAuth0()

  if (isLoading) {
    return <Loading />
  }

  // Social login users (Google) always have email_verified: true from the provider.
  // For database connection users, we enforce verification before granting access.
  const emailNotVerified = isAuthenticated && user && !user.email_verified

  return (
    <div className="app">
      <NavBar />
      {emailNotVerified ? (
        <EmailVerificationRequired user={user} />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
          />
        </Routes>
      )}
    </div>
  )
}

export default App

import { useAuth0 } from '@auth0/auth0-react'
import { Link, useNavigate } from 'react-router-dom'

function NavBar() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🚢</span>
          <span className="brand-name">Cruise0</span>
        </Link>
      </div>
      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              My Dashboard
            </button>
            <span className="user-greeting">Hi, {user?.given_name || user?.name?.split(' ')[0] || 'Traveler'}!</span>
            <button
              className="btn btn-outline"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => loginWithRedirect()}>
              Log In
            </button>
            <button
              className="btn btn-primary"
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default NavBar

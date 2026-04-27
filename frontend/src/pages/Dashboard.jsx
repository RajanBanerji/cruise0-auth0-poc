import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

// Namespace must match what is set in the Auth0 Post-Login Action
const CLAIM_NS = 'https://cruise0.com'

function Dashboard() {
  const { user, getAccessTokenSilently } = useAuth0()
  const [trips, setTrips] = useState([])
  const [apiError, setApiError] = useState(null)
  const [loadingTrips, setLoadingTrips] = useState(true)

  const country = user?.[`${CLAIM_NS}/country`]
  const countryCode = user?.[`${CLAIM_NS}/country_code`]

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = await getAccessTokenSilently()
        const res = await fetch('/api/trips', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        setTrips(data.trips)
      } catch (err) {
        setApiError(err.message)
      } finally {
        setLoadingTrips(false)
      }
    }
    fetchTrips()
  }, [getAccessTokenSilently])

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div className="user-profile">
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="avatar" />
          )}
          <div className="user-details">
            <h1>Welcome back, {user?.given_name || user?.name}!</h1>
            <p className="user-email">{user?.email}</p>
            <div className="user-badges">
              <span className="badge badge-success">✓ Email Verified</span>
              {country && (
                <span className="badge badge-info">
                  📍 Logged in from {country} {countryCode && `(${countryCode})`}
                </span>
              )}
              {user?.sub?.startsWith('google-oauth2|') && (
                <span className="badge badge-social">🔵 Google Account</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="trips-section">
        <h2>Available Voyages</h2>
        <p className="section-subtitle">Secure API call using OAuth 2.0 Bearer token</p>

        {loadingTrips && <p className="loading-text">Loading trips from API...</p>}

        {apiError && (
          <div className="error-banner">
            <strong>API Error:</strong> {apiError}
          </div>
        )}

        {!loadingTrips && !apiError && (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-header">
                  <span className="trip-icon">🚢</span>
                  <h3>{trip.destination}</h3>
                </div>
                <div className="trip-details">
                  <p>⏱ {trip.duration}</p>
                  <p className="trip-price">{trip.price}</p>
                </div>
                <button className="btn btn-primary">Reserve Now</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="token-section">
        <details>
          <summary>🔑 View Auth0 User Profile (Debug)</summary>
          <pre className="token-display">{JSON.stringify(user, null, 2)}</pre>
        </details>
      </section>
    </main>
  )
}

export default Dashboard

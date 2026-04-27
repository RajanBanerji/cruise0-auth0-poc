/**
 * Auth0 Action: Add Country from IP (Post-Login trigger)
 *
 * Setup:
 *   Trigger: Login / Post Login
 *   No secrets or npm modules required (uses native fetch available in Node 18+)
 *
 * What it does:
 *   - Looks up the user's IP address against the free ip-api.com service
 *   - Adds country + country_code as user_metadata (persisted to the user profile)
 *   - Adds the same values as namespaced custom claims on the ID token so the
 *     React SPA can read them immediately without a Management API call
 */
exports.onExecutePostLogin = async (event, api) => {
  const CLAIM_NS = 'https://cruise0.com'

  // Skip if we already have a country stored (avoid unnecessary API calls on every login)
  if (event.user.user_metadata?.country) {
    api.idToken.setCustomClaim(`${CLAIM_NS}/country`, event.user.user_metadata.country)
    api.idToken.setCustomClaim(`${CLAIM_NS}/country_code`, event.user.user_metadata.country_code)
    return
  }

  const ip = event.request.ip

  // ip-api.com is a free, no-auth geolocation service (45 req/min on free tier)
  // For production, replace with ipinfo.io, MaxMind, or ip-api.com Pro
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`)
    const data = await response.json()

    if (data.status === 'success') {
      // Persist to user_metadata so it's available on the profile
      api.user.setUserMetadata('country', data.country)
      api.user.setUserMetadata('country_code', data.countryCode)

      // Add as ID token claims so the SPA can read them without an extra API call
      api.idToken.setCustomClaim(`${CLAIM_NS}/country`, data.country)
      api.idToken.setCustomClaim(`${CLAIM_NS}/country_code`, data.countryCode)
    }
  } catch (err) {
    // Geolocation failure is non-fatal — log it but don't block login
    console.error('Country lookup failed:', err.message)
  }
}

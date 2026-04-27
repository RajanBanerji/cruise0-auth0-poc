/**
 * Auth0 Action: Enforce MFA for Non-Social (Database) Users (Post-Login trigger)
 * Extra Credit requirement
 *
 * Setup:
 *   Trigger: Login / Post Login
 *   No npm modules or secrets required
 *   MFA must be enabled in Auth0 Dashboard → Security → Multi-factor Auth
 *   (set Policy to "Never" — this Action takes over the enrollment decision)
 *
 * What it does:
 *   - Detects whether the user authenticated via a social connection (Google, Facebook, etc.)
 *   - Requests MFA ONLY for database (email/password) users
 *   - Skips MFA for social users — they already authenticated with their social provider's 2FA
 *
 * How it works:
 *   event.connection.strategy is 'auth0' for the standard database connection.
 *   Social connections use their provider name (e.g., 'google-oauth2', 'facebook').
 */
exports.onExecutePostLogin = async (event, api) => {
  const isSocialConnection = event.connection.strategy !== 'auth0'

  if (!isSocialConnection) {
    // Prompt the user to enroll in and complete MFA.
    // 'any' means Auth0 will use whatever MFA factor the tenant has enabled
    // (OTP, SMS, push notification, etc.) and allow the user to choose.
    api.multifactor.enable('any', { allowRememberBrowser: true })
  }
}

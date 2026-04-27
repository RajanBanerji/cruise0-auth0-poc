/**
 * Auth0 Action: Block Disposable Email Signups (Pre-User Registration trigger)
 * Extra Credit requirement
 *
 * Setup:
 *   Trigger: Pre User Registration
 *   No npm modules required (uses native fetch)
 *   No secrets required (Disify.com is free and requires no API key)
 *
 * What it does:
 *   - Calls the Disify.com email validation API for every new signup
 *   - Blocks registration if the email domain is identified as disposable/temporary
 *   - Allows registration to proceed for legitimate email addresses
 *
 * Note: Social login users (Google, etc.) bypass Pre-User Registration actions,
 * so this only applies to email/password signups — which is the correct behavior
 * since social providers already validate their email addresses.
 */
exports.onExecutePreUserRegistration = async (event, api) => {
  const email = event.user.email

  // Known disposable domains to block even if Disify API is unavailable
  const BLOCKED_DOMAINS = [
    'yopmail.com',
    'mailinator.com',
    'guerrillamail.com',
    'throwaway.email',
    'example.com',
    'tempmail.com',
    'fakeinbox.com',
    'sharklasers.com',
    'guerrillamailblock.com',
    'grr.la',
    'guerrillamail.info',
    'spam4.me',
    '10minutemail.com',
    'trashmail.com',
  ]

  const emailDomain = email.split('@')[1]?.toLowerCase()

  // Fast local check first (no network call needed)
  if (BLOCKED_DOMAINS.includes(emailDomain)) {
    api.access.deny(
      `Registration is not allowed with disposable email addresses. Please use a permanent email address.`
    )
    return
  }

  // Call Disify.com for a broader disposable email check
  try {
    const response = await fetch(`https://www.disify.com/api/email/${encodeURIComponent(email)}`)
    const data = await response.json()

    // Disify returns { format: true/false, disposable: true/false, ... }
    if (data.disposable === true) {
      api.access.deny(
        `Registration is not allowed with disposable or temporary email addresses. ` +
        `Please sign up with a permanent email address to continue.`
      )
    }
  } catch (err) {
    // If the Disify API is unreachable, log and allow — don't block legitimate users
    // on a third-party service outage. Monitor this in Auth0 logs.
    console.error('Disify API unreachable:', err.message)
  }
}

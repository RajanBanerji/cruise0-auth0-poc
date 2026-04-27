import { useAuth0 } from '@auth0/auth0-react'

function EmailVerificationRequired({ user }) {
  const { logout } = useAuth0()

  return (
    <div className="verification-required">
      <div className="verification-card">
        <div className="verification-icon">✉️</div>
        <h2>Verify Your Email Address</h2>
        <p>
          We've sent a verification link to <strong>{user?.email}</strong>.
          Please check your inbox and click the link to access your account.
        </p>
        <div className="verification-steps">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure <strong>{user?.email}</strong> is correct</li>
            <li>Allow a few minutes for delivery</li>
          </ul>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default EmailVerificationRequired

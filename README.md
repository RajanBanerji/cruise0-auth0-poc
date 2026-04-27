# Cruise0 – Auth0 PoC

A full-stack Proof of Concept demonstrating Auth0 identity features for Travel0's Cruise0 app modernization.

**Stack:** React (Vite) SPA + Express.js API + Auth0

---

## Features Implemented

### Core Requirements
- [x] React SPA with Auth0 React SDK
- [x] Email/password login and signup
- [x] Google social login
- [x] Email verification gate (unverified users see a friendly error, not the dashboard)
- [x] Customized Universal Login (configured in Auth0 Dashboard — see below)
- [x] Auth0 Action: adds country/country_code to user metadata and ID token from IP

### Extra Credit
- [x] Auth0 Action: blocks disposable email signups via Disify.com (Pre-User Registration)
- [x] Auth0 Action: enforces MFA only for non-social (email/password) users (Post-Login)

---

## Project Structure

```
cruise0/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── main.jsx            # Auth0Provider setup
│   │   ├── App.jsx             # Routing + email verification gate
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   └── Loading.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Dashboard.jsx           # Protected; calls /api/trips
│   │       └── EmailVerificationRequired.jsx
│   └── .env.example
├── backend/                    # Express API
│   ├── server.js               # JWT-protected endpoints
│   └── .env.example
└── auth0-actions/              # Paste into Auth0 Dashboard
    ├── 01-add-country-from-ip.js        (Post-Login)
    ├── 02-block-disposable-emails.js    (Pre-User Registration)
    └── 03-enforce-mfa-non-social.js     (Post-Login)
```

---

## Auth0 Tenant Setup

### 1. Create a Free Auth0 Tenant
Sign up at [auth0.com](https://auth0.com) and create a new tenant.

### 2. Create a Single Page Application
- Dashboard → Applications → Create Application → Single Page Application
- Name it `Cruise0`
- Allowed Callback URLs: `http://localhost:5173`
- Allowed Logout URLs: `http://localhost:5173`
- Allowed Web Origins: `http://localhost:5173`
- Copy **Domain** and **Client ID** for `frontend/.env`

### 3. Create an API (Resource Server)
- Dashboard → APIs → Create API
- Name: `Cruise0 API`
- Identifier (Audience): `https://cruise0.api`  ← must match exactly
- Copy the identifier for `backend/.env` and `frontend/.env`

### 4. Enable Google Social Login
- Dashboard → Authentication → Social → Google / Gmail
- Use **Dev Keys** (pre-filled — no Google Cloud Console setup needed for PoC)
- In your SPA application settings → Connections tab → enable Google

### 5. Enable Email Verification
- Dashboard → Authentication → Database → Username-Password-Authentication → Settings
- Enable **"Require Email Verification"**
- Auth0 will send a verification email on signup automatically

### 6. Customize Universal Login
- Dashboard → Branding → Universal Login → Advanced Options
- **Customize Login Page:** On
- Set the following in the **Login** tab:

| Setting | Value |
|---|---|
| Logo URL | `https://images.unsplash.com/photo-1548574505-5e239809ee19?w=200&h=200&fit=crop` |
| Primary Color | `#1a5276` |
| Page Background | (leave default — we set it via custom CSS) |

- Switch to the **Custom CSS** tab and add:

```css
._prompt-box-container {
  background-image: url('https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80');
  background-size: cover;
  background-position: center;
}
```

- Dashboard → Branding → Universal Login → **Login** tab:
  - Change the title to: **Welcome Aboard.**
  - Change the description to: **Log in to book your travel with Cruise0.**

> **Alternative:** Use the Auth0 Management API or `auth0 deploy` CLI to set these programmatically.

### 7. Install Auth0 Actions

#### Action 1 — Add Country from IP (Post-Login)
1. Dashboard → Actions → Library → Build Custom
2. Name: `Add Country from IP`
3. Trigger: **Login / Post Login**
4. Paste contents of `auth0-actions/01-add-country-from-ip.js`
5. Deploy → Add to Login flow

#### Action 2 — Block Disposable Emails (Pre-User Registration) [Extra Credit]
1. Dashboard → Actions → Library → Build Custom
2. Name: `Block Disposable Emails`
3. Trigger: **Pre User Registration**
4. Paste contents of `auth0-actions/02-block-disposable-emails.js`
5. Deploy → Add to Pre-Registration flow

#### Action 3 — MFA for Non-Social Users (Post-Login) [Extra Credit]
1. Dashboard → Actions → Library → Build Custom
2. Name: `Enforce MFA Non-Social`
3. Trigger: **Login / Post Login**
4. Paste contents of `auth0-actions/03-enforce-mfa-non-social.js`
5. Deploy → Add to Login flow (after Action 1)
6. Dashboard → Security → Multi-factor Auth → enable **OTP** (or any factor)
   - Set the policy to **"Never"** — the Action controls when MFA triggers

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: fill in AUTH0_DOMAIN and AUTH0_AUDIENCE
npm run dev
# API runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: fill in VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE
npm run dev
# App runs on http://localhost:5173
```

---

## How to Use the App

1. Open `http://localhost:5173`
2. Click **Sign Up** → create an account with email/password
3. Check your email inbox and click the verification link
4. Return to the app and log in — you'll land on the Dashboard
5. The Dashboard shows your name, verified email badge, country (from IP lookup), and trips fetched from the protected API
6. Try **Log Out** then **Log In with Google** — Google users skip MFA and email verification (Google already handles both)
7. Try signing up with `test@yopmail.com` — it will be blocked with an error message

---

## Enhanced Requirements Discussion

### Alternative Email Verification Methods
Beyond the default link-based flow, Auth0 supports:
- **OTP via email** — Auth0's passwordless flow sends a 6-digit code instead of a link. Enabled via Dashboard → Authentication → Passwordless → Email.
- **SMS OTP** — if a phone number is collected during signup, SMS can be used (requires Twilio integration).
- **Custom email provider** — send verification emails through SendGrid, Mailgun, etc. (Dashboard → Branding → Email Provider).

### How Auth0 Actions Block Burner Emails
See `auth0-actions/02-block-disposable-emails.js`. The **Pre-User Registration** trigger fires before the user record is created. Calling `api.access.deny(message)` aborts the signup and surfaces the error message in Universal Login — no user record is ever written to the Auth0 database.

### How to Enable Conditional MFA
Auth0 provides two approaches:
1. **Actions (code):** In a Post-Login Action, call `api.multifactor.enable('any')` conditionally — e.g., check `event.user.app_metadata.role`, `event.request.geoip.country_code`, or `event.connection.strategy`. See `auth0-actions/03-enforce-mfa-non-social.js` for the social-vs-database example.
2. **Adaptive MFA (no code):** Dashboard → Security → Attack Protection → Adaptive MFA. Auth0 Risk Engine automatically triggers MFA when it detects anomalies (new device, impossible travel, leaked credentials). Requires an Enterprise/add-on plan.

---

## Deployment

The app can be hosted on any static + API hosting pair:

| Service | Frontend | Backend |
|---|---|---|
| Vercel + Railway | `vercel deploy` | `railway up` |
| Netlify + Render | Drag-and-drop build folder | Free tier available |
| AWS S3 + Lambda | S3 static hosting | API Gateway + Lambda |
| Heroku | Buildpack | Same dyno with a proxy |

Remember to update Auth0 **Allowed Callback URLs**, **Logout URLs**, and **Web Origins** with the production domain, and update the `.env` files accordingly.

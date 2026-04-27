require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { auth, InsufficientScopeError, InvalidTokenError } = require('express-oauth2-jwt-bearer')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}))

app.use(express.json())

// Auth0 JWT middleware — validates Bearer token on every protected route
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
})

// --- Public health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cruise0 API' })
})

// --- Protected: list available cruise trips ---
app.get('/api/trips', checkJwt, (req, res) => {
  res.json({
    trips: [
      {
        id: 1,
        destination: 'Mediterranean Magic',
        duration: '10 nights',
        price: '$1,899 per person',
        ports: ['Barcelona', 'Rome', 'Athens', 'Santorini'],
      },
      {
        id: 2,
        destination: 'Caribbean Paradise',
        duration: '7 nights',
        price: '$1,299 per person',
        ports: ['Miami', 'Nassau', 'Cozumel', 'Grand Cayman'],
      },
      {
        id: 3,
        destination: 'Alaska Explorer',
        duration: '7 nights',
        price: '$1,599 per person',
        ports: ['Seattle', 'Juneau', 'Skagway', 'Glacier Bay'],
      },
      {
        id: 4,
        destination: 'Norwegian Fjords',
        duration: '12 nights',
        price: '$2,499 per person',
        ports: ['Bergen', 'Flåm', 'Geiranger', 'Oslo'],
      },
    ],
  })
})

// --- Protected: get authenticated user's bookings ---
app.get('/api/bookings', checkJwt, (req, res) => {
  // req.auth.payload contains the decoded JWT claims
  const userId = req.auth.payload.sub
  res.json({
    userId,
    bookings: [],
    message: 'No bookings yet — browse trips and book your first cruise!',
  })
})

// Error handler for JWT failures
app.use((err, req, res, next) => {
  if (err instanceof InvalidTokenError) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message })
  }
  if (err instanceof InsufficientScopeError) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Cruise0 API running on http://localhost:${PORT}`)
  console.log(`Auth0 Domain:    ${process.env.AUTH0_DOMAIN}`)
  console.log(`Auth0 Audience:  ${process.env.AUTH0_AUDIENCE}`)
})

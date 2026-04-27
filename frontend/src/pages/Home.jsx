import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const FEATURED_CRUISES = [
  {
    id: 1,
    name: 'Mediterranean Magic',
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&q=80',
    duration: '10 Nights',
    from: '$1,899',
    ports: 'Barcelona → Rome → Athens → Santorini',
  },
  {
    id: 2,
    name: 'Caribbean Paradise',
    image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&q=80',
    duration: '7 Nights',
    from: '$1,299',
    ports: 'Miami → Nassau → Cozumel → Grand Cayman',
  },
  {
    id: 3,
    name: 'Alaska Explorer',
    image: 'https://images.unsplash.com/photo-1531804412657-97b5dd3862d1?w=400&q=80',
    duration: '7 Nights',
    from: '$1,599',
    ports: 'Seattle → Juneau → Skagway → Glacier Bay',
  },
]

function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>Your Next Adventure Awaits</h1>
          <p>Discover the world's most breathtaking destinations with Cruise0. Luxury travel, unforgettable memories.</p>
          <button className="btn btn-primary btn-large" onClick={handleBookNow}>
            {isAuthenticated ? 'View My Trips' : 'Book Your Cruise'}
          </button>
        </div>
      </section>

      <section className="featured-cruises">
        <h2>Featured Cruises</h2>
        <div className="cruise-grid">
          {FEATURED_CRUISES.map((cruise) => (
            <div key={cruise.id} className="cruise-card">
              <img src={cruise.image} alt={cruise.name} />
              <div className="cruise-info">
                <h3>{cruise.name}</h3>
                <p className="ports">{cruise.ports}</p>
                <div className="cruise-meta">
                  <span>{cruise.duration}</span>
                  <span className="price">From {cruise.from}</span>
                </div>
                <button className="btn btn-primary" onClick={handleBookNow}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home

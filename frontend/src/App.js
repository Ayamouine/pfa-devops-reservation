import React, { useEffect, useState } from 'react';

const AUTH_URL = 'http://localhost:8081';
const BOOKING_URL = 'http://localhost:8082';
const NOTIFICATION_URL = 'http://localhost:8083';
const PAYMENT_URL = 'http://localhost:8084';

function App() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [authStatus, setAuthStatus] = useState('');

  // --- Auth state ---
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  // --- Booking form state ---
  const [bookingForm, setBookingForm] = useState({ resource: '', date: '' });
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  const loadBookings = () => {
    fetch(`${BOOKING_URL}/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch(() => setBookings([]));
  };

  const loadNotifications = () => {
    fetch(`${NOTIFICATION_URL}/notifications`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]));
  };

  const loadPayments = () => {
    fetch(`${PAYMENT_URL}/payments`)
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(() => setPayments([]));
  };

  useEffect(() => {
    fetch(`${AUTH_URL}/auth/health`)
      .then((res) => res.json())
      .then((data) => setAuthStatus(`Auth service: ${data.status}`))
      .catch(() => setAuthStatus('Auth service: injoignable'));

    loadBookings();
    loadNotifications();
    loadPayments();
  }, []);

  // --- Auth handlers ---
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await fetch(`${AUTH_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Erreur ${res.status}`);
      }

      const data = await res.json();
      setToken(data.token);
      setCurrentUser({ username: data.username, role: data.role });
      setAuthMessage(
        authMode === 'login'
          ? `Connecté en tant que ${data.username} (${data.role})`
          : `Compte créé pour ${data.username}, vous êtes connecté(e).`
      );
      setAuthForm({ username: '', password: '' });
    } catch (err) {
      setAuthError(err.message || 'Une erreur est survenue.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setAuthMessage('');
  };

  // --- Booking handlers ---
  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingMessage('');

    try {
      const res = await fetch(`${BOOKING_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...bookingForm, status: 'pending' }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(
          res.status === 409
            ? 'Cette ressource est déjà réservée pour cette date.'
            : errText || `Erreur ${res.status}`
        );
      }

      const data = await res.json();
      setBookingMessage(`Réservation créée : ${data.resource} le ${data.date}`);
      setBookingForm({ resource: '', date: '' });
      loadBookings();
      loadNotifications();
    } catch (err) {
      setBookingError(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', background: '#f5f8ff', minHeight: '100vh' }}>
      <h1>Plateforme de réservation</h1>
      <p>Application DevOps basée sur une architecture microservices.</p>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px' }}>
        <strong>État du système :</strong> {authStatus}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

        {/* --- Authentification --- */}
        <section style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h2>Authentification</h2>

          {currentUser ? (
            <div>
              <p>Connecté(e) en tant que <strong>{currentUser.username}</strong> ({currentUser.role})</p>
              <button onClick={handleLogout}>Se déconnecter</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setAuthMode('login')}
                  style={{ fontWeight: authMode === 'login' ? 'bold' : 'normal', marginRight: '0.5rem' }}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  style={{ fontWeight: authMode === 'register' ? 'bold' : 'normal' }}
                >
                  Créer un compte
                </button>
              </div>

              <form onSubmit={handleAuthSubmit}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={authForm.username}
                    onChange={handleAuthChange}
                    required
                    style={{ width: '100%', padding: '0.4rem' }}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    name="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    required
                    style={{ width: '100%', padding: '0.4rem' }}
                  />
                </div>
                <button type="submit">
                  {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>
            </>
          )}

          {authMessage && <p style={{ color: 'green' }}>{authMessage}</p>}
          {authError && <p style={{ color: 'red' }}>{authError}</p>}
        </section>

        {/* --- Nouvelle réservation --- */}
        <section style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h2>Nouvelle réservation</h2>
          <form onSubmit={handleBookingSubmit}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                name="resource"
                placeholder="Ressource (ex: Salle A)"
                value={bookingForm.resource}
                onChange={handleBookingChange}
                required
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                name="date"
                type="date"
                value={bookingForm.date}
                onChange={handleBookingChange}
                required
                style={{ width: '100%', padding: '0.4rem' }}
              />
            </div>
            <button type="submit">Réserver</button>
          </form>
          {bookingMessage && <p style={{ color: 'green' }}>{bookingMessage}</p>}
          {bookingError && <p style={{ color: 'red' }}>{bookingError}</p>}
        </section>

        {/* --- Listes existantes --- */}
        <section style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h2>Réservations</h2>
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id}><strong>{booking.resource}</strong> — {booking.date} — {booking.status}</li>
            ))}
          </ul>
        </section>

        <section style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h2>Notifications</h2>
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>{notification.message} ({notification.status})</li>
            ))}
          </ul>
        </section>

        <section style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h2>Paiements</h2>
          <ul>
            {payments.map((payment) => (
              <li key={payment.id}>Réservation {payment.reservationId} — {payment.amount} MAD — {payment.status}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;

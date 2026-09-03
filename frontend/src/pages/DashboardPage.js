import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AUTH_URL, BOOKING_URL, authHeaders, statusClass, statusLabel } from '../api';

export default function DashboardPage() {
  const { currentUser, token } = useAuth();
  const [authStatus, setAuthStatus] = useState('');
  const [authUp, setAuthUp] = useState(true);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AUTH_URL}/auth/health`)
      .then((res) => res.json())
      .then((data) => {
        setAuthStatus(`Service d'authentification : ${data.status === 'up' ? 'opérationnel' : data.status}`);
        setAuthUp(data.status === 'up');
      })
      .catch(() => {
        setAuthStatus("Service d'authentification : injoignable");
        setAuthUp(false);
      });

    fetch(`${BOOKING_URL}/bookings/mine?username=${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then((data) => setMyBookings(data))
      .catch(() => setMyBookings([]))
      .finally(() => setLoading(false));
  }, [currentUser.username, token]);

  const stats = {
    total: myBookings.length,
    confirmed: myBookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length,
    pending: myBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length,
  };

  const recent = [...myBookings].slice(-3).reverse();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Bonjour, {currentUser.username}</h1>
        <p>Voici un aperçu de votre espace de réservation.</p>
        <div className="status-pill">
          <span className={`status-dot ${authUp ? '' : 'down'}`} />
          {authStatus || 'Vérification du service…'}
        </div>
      </header>

      <div className="stats-grid stats-grid-wide">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Réservations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.confirmed}</span>
          <span className="stat-label">Confirmées</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">En attente</span>
        </div>
      </div>

      <section className="card">
        <div className="card-header-row">
          <h2>Réservations récentes</h2>
          <Link to="/reservations" className="btn btn-ghost">Voir tout</Link>
        </div>

        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && recent.length === 0 && (
          <p className="empty-state">
            Aucune réservation pour le moment. <Link to="/reservations">Créez-en une</Link>.
          </p>
        )}
        {!loading && recent.length > 0 && (
          <div className="ticket-list">
            {recent.map((booking) => (
              <div className="ticket" key={booking.id}>
                <div className={`ticket-stub ${statusClass(booking.status)}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{booking.resource}</span>
                    <span className="ticket-meta">{booking.date}</span>
                  </div>
                  <span className={`badge ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
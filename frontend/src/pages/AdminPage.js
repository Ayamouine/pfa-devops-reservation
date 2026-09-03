import React, { useEffect, useState } from 'react';
import { BOOKING_URL, statusClass, statusLabel } from '../api';
import { useAuth } from '../AuthContext';
import { authHeaders } from '../api';

export default function AdminPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

const { token } = useAuth();

useEffect(() => {
  fetch(`${BOOKING_URL}/bookings`, { headers: authHeaders(token) })
    .then((res) => res.json())
    .then(setAllBookings)
    .catch(() => setAllBookings([]))
    .finally(() => setLoading(false));
}, [token]);

  const stats = {
    total: allBookings.length,
    confirmed: allBookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length,
    pending: allBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length,
  };

  const filtered = searchTerm.trim()
    ? allBookings.filter((b) => `${b.resource} ${b.username}`.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : allBookings;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Administration</h1>
        <p>Toutes les réservations de la plateforme.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
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
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par ressource ou utilisateur…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && filtered.length === 0 && <p className="empty-state">Aucune réservation trouvée.</p>}
        {!loading && filtered.length > 0 && (
          <div className="ticket-list">
            {filtered.map((booking) => (
              <div className="ticket" key={booking.id}>
                <div className={`ticket-stub ${statusClass(booking.status)}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{booking.resource}</span>
                    <span className="ticket-meta">{booking.date} · réservé par {booking.username}</span>
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
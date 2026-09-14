import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { BOOKING_URL, PAYMENT_URL, authHeaders, statusClass, statusLabel } from '../api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = { confirmed: '#2f6f52', pending: '#8a6a20', cancelled: '#a6394a' };

export default function AdminPage() {
  const { token } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BOOKING_URL}/bookings`, { headers: authHeaders(token) }).then((res) => res.json()),
      fetch(`${PAYMENT_URL}/payments`, { headers: authHeaders(token) }).then((res) => res.json()),
    ])
      .then(([bookings, payments]) => {
        setAllBookings(bookings);
        setAllPayments(payments);
      })
      .catch(() => {
        setAllBookings([]);
        setAllPayments([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const stats = {
    total: allBookings.length,
    confirmed: allBookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length,
    pending: allBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length,
    cancelled: allBookings.filter((b) => (b.status || '').toLowerCase() === 'cancelled').length,
  };
  const confirmationRate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;
  const activeUsers = new Set(allBookings.map((b) => b.username)).size;
  const totalRevenue = allPayments
    .filter((p) => (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const statusPieData = [
    { name: 'Confirmées', value: stats.confirmed, key: 'confirmed' },
    { name: 'En attente', value: stats.pending, key: 'pending' },
    { name: 'Annulées', value: stats.cancelled, key: 'cancelled' },
  ].filter((d) => d.value > 0);

  const countByResource = {};
  allBookings.forEach((b) => {
    if (!b.resource) return;
    countByResource[b.resource] = (countByResource[b.resource] || 0) + 1;
  });
  const topResourcesData = Object.entries(countByResource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([resource, count]) => ({ resource, count }));

  const filtered = searchTerm.trim()
    ? allBookings.filter((b) => `${b.resource} ${b.username}`.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : allBookings;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Administration</h1>
        <p>Vue d'ensemble et toutes les réservations de la plateforme.</p>
      </header>

      <div className="stats-grid stats-grid-wide">
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Réservations totales</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{stats.confirmed}</span>
          <span className="stat-label">Confirmées</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">En attente</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{stats.cancelled}</span>
          <span className="stat-label">Annulées</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{confirmationRate}%</span>
          <span className="stat-label">Taux de confirmation</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{activeUsers}</span>
          <span className="stat-label">Utilisateurs actifs</span>
        </div>
        <div className="stat-card stat-card-glow">
          <span className="stat-value">{totalRevenue.toFixed(0)} MAD</span>
          <span className="stat-label">Revenu total</span>
        </div>
      </div>

      <div className="grid-two">
        <section className="card">
          <h2>Répartition des statuts</h2>
          {statusPieData.length === 0 ? (
            <p className="empty-state">Aucune donnée pour le moment.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Ressources les plus demandées</h2>
          {topResourcesData.length === 0 ? (
            <p className="empty-state">Aucune donnée pour le moment.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={topResourcesData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dde3de" />
                  <XAxis dataKey="resource" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#c78a3e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h2>Toutes les réservations</h2>
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
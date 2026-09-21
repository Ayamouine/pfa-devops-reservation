import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  ROLE_LABELS,
  getMyBookings,
  getApprovals,
  unreadCount,
  statusClass,
  statusLabel,
} from '../api';

export default function DashboardPage() {
  const { currentUser, token, role, fullName } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [nbUnread, setNbUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getMyBookings(token, currentUser.username),
      role === 'CHEF_FILIERE' || role === 'DOYEN' || role === 'ADMIN'
        ? getApprovals(token).catch(() => [])
        : Promise.resolve([]),
      unreadCount(token).catch(() => ({ count: 0 })),
    ])
      .then(([books, appr, unread]) => {
        setMyBookings(Array.isArray(books) ? books : []);
        setApprovals(Array.isArray(appr) ? appr : []);
        setNbUnread(Number(unread.count) || 0);
      })
      .finally(() => setLoading(false));
  }, [token, currentUser.username, role]);

  useEffect(() => { load(); }, [load]);

  const list = [...myBookings]
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
    .slice(0, 5);

  const stats = {
    total: myBookings.length,
    approved: myBookings.filter((b) => (b.status || '').toLowerCase() === 'approved').length,
    confirmed: myBookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length,
    pending: myBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length,
    rejected: myBookings.filter((b) => (b.status || '').toLowerCase() === 'rejected').length,
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Bonjour, {fullName || currentUser.username} 👋</h1>
          <p className="page-subtitle">
            {ROLE_LABELS[role] || role}
            {currentUser.filiere ? ` · Filière ${currentUser.filiere}` : ''} — suivez vos demandes de réservation de salles.
          </p>
        </div>
        <div className="page-header-actions">
          {nbUnread > 0 && (
            <Link to="/notifications" className="btn btn-primary">
              {nbUnread} notification{nbUnread > 1 ? 's' : ''} non lu{nbUnread > 1 ? 'es' : ''}
            </Link>
          )}
          {(role === 'CHEF_FILIERE' || role === 'DOYEN' || role === 'ADMIN') && (
            <Link to="/validations" className="btn btn-accent">
              {approvals.length} demande{approvals.length > 1 ? 's' : ''} à valider
            </Link>
          )}
        </div>
      </header>

      <div className="stats-grid stats-grid-wide">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Demandes totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">En attente (chef)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.approved}</span>
          <span className="stat-label">Validées (doyen)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.confirmed}</span>
          <span className="stat-label">Confirmées ✓</span>
        </div>
      </div>

      <section className="card">
        <div className="card-header-row">
          <h2>Dernières demandes</h2>
          <Link to="/reservations" className="btn btn-ghost">Mes demandes</Link>
        </div>
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && list.length === 0 && (
          <p className="empty-state">
            Aucune demande pour le moment.{' '}
            {role !== 'ETUDIANT' ? (
              <Link to="/reservations">Créez une demande</Link>
            ) : (
              <Link to="/ressources">Consultez les salles</Link>
            )}
            .
          </p>
        )}
        {!loading && list.length > 0 && (
          <div className="ticket-list">
            {list.map((b) => (
              <div className="ticket" key={b.id}>
                <div className={`ticket-stub ${statusClass(b.status)}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{b.resource}</span>
                    <span className="ticket-meta">{b.date} · {b.creneau}</span>
                  </div>
                  <span className={`badge ${statusClass(b.status)}`}>{statusLabel(b.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {role === 'ETUDIANT' && (
        <section className="card">
          <div className="card-header-row">
            <h2>Espace étudiant</h2>
            <Link to="/calendar" className="btn btn-ghost">Emploi du temps</Link>
          </div>
          <p className="small-muted">
            En tant qu’étudiant de la FST, vous pouvez consulter les salles, leur disponibilité et
            l’emploi du temps. Les demandes de réservation sont réservées au corps enseignant et
            validées par le chef de filière puis le doyen.
          </p>
        </section>
      )}
    </div>
  );
}
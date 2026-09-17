import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getMyNotifications, markRead, markAllRead } from '../api';

function typeTag(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('confirm')) return 'approved';
  if (t.includes('reject') || t.includes('cancel')) return 'rejected';
  if (t.includes('approv') || t.includes('pending')) return 'pending';
  return 'info';
}

function typeLabel(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('book_paid')) return 'Paiement';
  if (t.includes('confirmed')) return 'Confirmée';
  if (t.includes('approved')) return 'Validée';
  if (t.includes('rejected')) return 'Refusée';
  if (t.includes('cancelled')) return 'Annulée';
  if (t.includes('pending') || t.includes('approval')) return 'En attente';
  return 'Information';
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationsPage() {
  const { token, showToast } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getMyNotifications(token)
      .then((list) => setNotifs(Array.isArray(list) ? list : []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = async (n) => {
    if (!n.read) {
      try {
        await markRead(token, n.id);
        setNotifs((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch {}
    }
    if (n.link) navigate(n.link);
  };

  const handleReadAll = async () => {
    try {
      await markAllRead(token);
      setNotifs((list) => list.map((x) => ({ ...x, read: true })));
      showToast('Toutes les notifications ont été marquées comme lues.', 'success');
    } catch (err) {
      showToast(err.message || 'Action impossible.', 'error');
    }
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Centre de notifications</h1>
        <p className="page-subtitle">
          Suivez chaque changement de statut de vos réservations.
        </p>
      </header>

      <div className="notif-center">
        <div className="notif-toolbar">
          <span className="status-pill">
            {unread > 0 ? `${unread} notification${unread > 1 ? 's' : ''} non lu${unread > 1 ? 'es' : ''}` : `Tout est lu (${notifs.length})`}
          </span>
          {unread > 0 && (
            <button className="btn btn-ghost" type="button" onClick={handleReadAll}>
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && notifs.length === 0 && (
          <div className="notif-empty">
            Aucune notification pour le moment.
            <br />
            Les changements de statut de vos demandes apparaîtront ici.
          </div>
        )}

        <div className="notif-list">
          {notifs.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`notif-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => handleOpen(n)}
              style={{ cursor: n.link ? 'pointer' : 'default', textAlign: 'left', width: '100%' }}
            >
              <span className={`notif-dot ${n.read ? '' : ''}`} />
              <span className={`notif-icon type-${typeTag(n.type)}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
              </span>
              <span className="notif-body">
                <span className="notif-text">{n.message}</span>
                <span className="notif-meta">
                  <span className={`notif-type-tag ${typeTag(n.type)}`}>{typeLabel(n.type)}</span>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
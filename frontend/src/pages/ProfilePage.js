import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { NOTIFICATION_URL, PAYMENT_URL, authHeaders } from '../api';

export default function ProfilePage() {
  const { currentUser, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(`${NOTIFICATION_URL}/notifications/user/${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));

    fetch(`${PAYMENT_URL}/payments/mine?username=${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setPayments)
      .catch(() => setPayments([]));
  }, [currentUser.username, token]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mon profil</h1>
        <p>Informations de votre compte, notifications et paiements.</p>
      </header>

      <section className="card">
        <h2>Votre compte</h2>
        <div className="user-box">
          <span className="who">
            <strong>{currentUser.username}</strong>
            <span className="role-tag">{currentUser.role}</span>
          </span>
        </div>
      </section>

      <section className="card">
        <div className="grid-two">
          <div>
            <h2>Vos notifications</h2>
            {notifications.length === 0 ? (
              <p className="empty-state">Aucune notification.</p>
            ) : (
              <ul className="simple-list">
                {notifications.map((n) => (
                  <li key={n.id}>{n.message} <em>({n.status})</em></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2>Vos paiements</h2>
            {payments.length === 0 ? (
              <p className="empty-state">Aucun paiement.</p>
            ) : (
              <ul className="simple-list">
                {payments.map((p) => (
                  <li key={p.id}>Réservation {p.reservationId} — {p.amount} MAD — {p.status}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
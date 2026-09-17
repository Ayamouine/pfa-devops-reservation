import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { AUTH_URL, NOTIFICATION_URL, PAYMENT_URL, authHeaders } from '../api';

const AVATAR_COLORS = ['#c78a3e', '#2f6f52', '#a6394a', '#3a5a8c', '#7a4e9e', '#c2622d'];

export default function ProfilePage() {
  const { currentUser, token, showToast, setCurrentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);

  const [avatarColor, setAvatarColor] = useState('#c78a3e');
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({ remindersEnabled: true, channel: 'INTERNE' });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetch(`${NOTIFICATION_URL}/notifications/user/${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));

    fetch(`${PAYMENT_URL}/payments/mine?username=${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setPayments)
      .catch(() => setPayments([]));

    fetch(`${NOTIFICATION_URL}/notifications/preferences/${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then((data) => setPreferences({ remindersEnabled: data.remindersEnabled, channel: data.channel }))
      .catch(() => {});
  }, [currentUser.username, token]);

  const initials = currentUser.username.slice(0, 2).toUpperCase();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Le mot de passe actuel est requis pour confirmer les changements.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${AUTH_URL}/auth/profile?username=${encodeURIComponent(currentUser.username)}`, {
        method: 'PUT',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          newUsername: newUsername !== currentUser.username ? newUsername : undefined,
          currentPassword,
          newPassword: newPassword || undefined,
          avatarColor,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCurrentUser({ username: data.username, role: data.role });
      showToast('Profil mis à jour. Reconnecte-toi si besoin pour tout rafraîchir.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Impossible de mettre à jour le profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await fetch(`${NOTIFICATION_URL}/notifications/preferences/${encodeURIComponent(currentUser.username)}`, {
        method: 'PUT',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast('Préférences de notification enregistrées.', 'success');
    } catch (err) {
      showToast(err.message || "Impossible d'enregistrer les préférences.", 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mon profil</h1>
        <p>Gère ton compte, ton avatar et tes préférences.</p>
      </header>

      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%', background: avatarColor,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>{currentUser.username}</strong>
            <div><span className="role-tag">{currentUser.role}</span></div>
          </div>
        </div>

        <div className="field">
          <label>Couleur de l'avatar</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: avatarColor === c ? '3px solid #222' : '1px solid rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="field">
            <label htmlFor="newUsername">Nom d'utilisateur</label>
            <input id="newUsername" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="currentPassword">Mot de passe actuel (requis pour confirmer)</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Paramètres de notification</h2>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id="remindersEnabled"
            type="checkbox"
            checked={preferences.remindersEnabled}
            onChange={(e) => setPreferences({ ...preferences, remindersEnabled: e.target.checked })}
            style={{ width: 'auto' }}
          />
          <label htmlFor="remindersEnabled" style={{ margin: 0 }}>Recevoir des rappels de réservation</label>
        </div>
        <div className="field">
          <label htmlFor="channel">Canal préféré</label>
          <select id="channel" value={preferences.channel} onChange={(e) => setPreferences({ ...preferences, channel: e.target.value })}>
            <option value="INTERNE">Notification interne</option>
            <option value="EMAIL">Email (simulé)</option>
            <option value="SMS">SMS (simulé)</option>
          </select>
        </div>
        <button className="btn btn-accent" type="button" onClick={handleSavePreferences} disabled={savingPrefs}>
          {savingPrefs ? 'Enregistrement…' : 'Enregistrer les préférences'}
        </button>
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
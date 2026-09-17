import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { FILIERES, ROLE_LABELS, getNotificationsForUser } from '../api';

const AVATAR_COLORS = ['#c78a3e', '#13315c', '#2f6f52', '#a6394a', '#3a5a8c', '#7a4e9e', '#c2622d'];

export default function ProfilePage() {
  const { currentUser, token, showToast, saveProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    username: currentUser?.username || '',
    filiere: currentUser?.filiere || '',
    avatarColor: currentUser?.avatarColor || AVATAR_COLORS[0],
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    getNotificationsForUser(token, currentUser.username)
      .then((list) => setNotifications((list || []).slice(0, 8)))
      .catch(() => setNotifications([]));
  }, [token, currentUser.username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) {
      showToast('Le mot de passe actuel est requis pour confirmer les changements.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveProfile(currentUser.username, {
        newUsername: form.username !== currentUser.username ? form.username : undefined,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword || undefined,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        filiere: form.filiere || undefined,
        avatarColor: form.avatarColor || undefined,
      });
      showToast('Profil mis à jour.', 'success');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      showToast(err.message || 'Impossible de mettre à jour le profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const canEditFiliere =
    !['ADMIN', 'DOYEN'].includes(currentUser.role) || currentUser.filiere;

  const initials = ((form.firstName || currentUser.firstName || currentUser.username || '?')[0] +
    (form.lastName || currentUser.lastName || '')[0]).toUpperCase();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Mon profil</h1>
        <p className="page-subtitle">Informations personnelles, filière et préférences.</p>
      </header>

      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: form.avatarColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {initials || '?'}
          </div>
          <div>
            <strong style={{ fontSize: '1.15rem' }}>
              {[form.firstName, form.lastName].filter(Boolean).join(' ') || currentUser.username}
            </strong>
            <div style={{ marginTop: 4 }}>
              <span className="role-tag">{ROLE_LABELS[currentUser.role] || currentUser.role}</span>
              {currentUser.filiere && <span className="role-tag" style={{ marginLeft: 6 }}>{currentUser.filiere}</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="firstName">Prénom</label>
              <input id="firstName" type="text" name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" type="text" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          {canEditFiliere && (
            <div className="field">
              <label htmlFor="filiere">Filière</label>
              <select id="filiere" name="filiere" value={form.filiere} onChange={handleChange}>
                <option value="">— Sans filière —</option>
                {FILIERES.map((f) => <option value={f} key={f}>{f}</option>)}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="username">Nom d’utilisateur</label>
            <input id="username" type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Couleur de l’avatar</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, avatarColor: c }))}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border: form.avatarColor === c ? '3px solid #1b232e' : '1px solid rgba(0,0,0,0.15)',
                  }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="currentPassword">Mot de passe actuel (requis pour confirmer)</label>
            <input id="currentPassword" type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <input id="newPassword" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Dernières notifications</h2>
        {notifications.length === 0 ? (
          <p className="empty-state">
            Aucune notification.{' '}
            <a href="#/notifications" onClick={(e) => e.preventDefault()}>Ouvrir le centre de notifications</a>
          </p>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div className={`notif-item ${n.read ? 'read' : 'unread'}`} key={n.id}>
                <span className="notif-dot" />
                <span className="notif-icon type-role">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                </span>
                <span className="notif-body">
                  <span className="notif-text">{n.message}</span>
                  <span className="notif-meta">
                    <span className="notif-type-tag info">{n.type}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { AUTH_URL, authHeaders } from '../api';

export default function AdminUsersPage() {
  const { token, currentUser, showToast, askConfirm } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    fetch(`${AUTH_URL}/auth/users`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (user, newRole) => {
    setSavingId(user.id);
    try {
      const res = await fetch(`${AUTH_URL}/auth/users/${user.id}/role`, {
        method: 'PUT',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(`Rôle de ${user.username} mis à jour.`, 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de modifier ce rôle.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = (user) => {
    if (user.username === currentUser.username) {
      showToast('Vous ne pouvez pas supprimer votre propre compte.', 'error');
      return;
    }
    askConfirm(`Supprimer le compte "${user.username}" ?`, async () => {
      try {
        const res = await fetch(`${AUTH_URL}/auth/users/${user.id}`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Compte supprimé.', 'success');
        load();
      } catch (err) {
        showToast(err.message || 'Impossible de supprimer ce compte.', 'error');
      }
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Gestion des utilisateurs</h1>
        <p>Consulte tous les comptes, change un rôle, ou supprime un compte.</p>
      </header>

      <section className="card">
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && users.length === 0 && <p className="empty-state">Aucun utilisateur trouvé.</p>}
        {!loading && users.length > 0 && (
          <div className="ticket-list">
            {users.map((u) => (
              <div className="ticket" key={u.id}>
                <div className={`ticket-stub ${u.role === 'ADMIN' ? 'status-confirmed' : 'status-pending'}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{u.username}</span>
                    <span className="ticket-meta">Rôle actuel : {u.role}</span>
                  </div>
                  <div className="ticket-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={savingId === u.id}
                      style={{ width: 'auto' }}
                    >
                      <option value="USER">Utilisateur</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                    <button
                      className="btn btn-danger-outline"
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={u.username === currentUser.username}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
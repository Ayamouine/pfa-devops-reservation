import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { FILIERES, ROLES, ROLE_LABELS, getUsers, updateUserRole, updateUserFiliere, deleteUser } from '../api';

export default function AdminUsersPage() {
  const { token, currentUser, showToast, askConfirm } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(null);
  const [savingFiliere, setSavingFiliere] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(() => {
    getUsers(token)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  const handleRoleChange = async (user, newRole) => {
    setSavingRole(user.id);
    try {
      await updateUserRole(token, user.id, newRole);
      showToast(`Rôle de ${user.username} mis à jour : ${ROLE_LABELS[newRole]}.`, 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de modifier ce rôle.', 'error');
    } finally {
      setSavingRole(null);
    }
  };

  const handleFiliereChange = async (user, newFiliere) => {
    setSavingFiliere(user.id);
    try {
      await updateUserFiliere(token, user.id, newFiliere);
      showToast(`Filière de ${user.username} mise à jour.`, 'success');
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de modifier la filière.', 'error');
    } finally {
      setSavingFiliere(null);
    }
  };

  const handleDelete = (user) => {
    if (user.username === currentUser.username) {
      showToast('Vous ne pouvez pas supprimer votre propre compte.', 'error');
      return;
    }
    askConfirm(`Supprimer le compte "${user.username}" ?`, async () => {
      try {
        await deleteUser(token, user.id);
        showToast('Compte supprimé.', 'success');
        load();
      } catch (err) {
        showToast(err.message || 'Impossible de supprimer ce compte.', 'error');
      }
    });
  };

  const showFiliere = (u) =>
    u.role === 'CHEF_FILIERE' || u.role === 'PROF' || u.role === 'DOYEN' || u.role === 'ETUDIANT';

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Comptes &amp; filières</h1>
          <p className="page-subtitle">
            Assignez les rôles (professeur, chef de filière, doyen) et les filières.
          </p>
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
        </select>
      </header>

      <section className="card">
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && filtered.length === 0 && <p className="empty-state">Aucun utilisateur trouvé.</p>}
        {!loading && filtered.length > 0 && (
          <div className="ticket-list">
            {filtered.map((u) => (
              <div className="ticket" key={u.id}>
                <div className={`ticket-stub ${u.role === 'ADMIN' ? 'status-confirmed' : 'status-pending'}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username}
                    </span>
                    <span className="ticket-meta">
                      @{u.username} · {u.filiere || 'Sans filière'}
                    </span>
                  </div>
                  <div className="ticket-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={savingRole === u.id}
                      style={{ width: 'auto' }}
                      aria-label={`Rôle de ${u.username}`}
                    >
                      {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
                    </select>
                    {showFiliere(u) && (
                      <select
                        value={u.filiere || ''}
                        onChange={(e) => handleFiliereChange(u, e.target.value)}
                        disabled={savingFiliere === u.id}
                        style={{ width: 'auto' }}
                        aria-label={`Filière de ${u.username}`}
                      >
                        <option value="">— Filière —</option>
                        {FILIERES.map((f) => <option value={f} key={f}>{f}</option>)}
                      </select>
                    )}
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
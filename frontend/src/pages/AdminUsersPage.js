import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { FILIERES_GROUPES, ROLES, ROLE_LABELS, getUsers, createUser, updateUserRole, updateUserFiliere, deleteUser } from '../api';

export default function AdminUsersPage() {
  const { token, currentUser, showToast, askConfirm } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(null);
  const [savingFiliere, setSavingFiliere] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'ETUDIANT',
    firstName: '',
    lastName: '',
    filiere: '',
  });

  const load = useCallback(() => {
    getUsers(token)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => setForm({
    username: '', password: '', role: 'ETUDIANT', firstName: '', lastName: '', filiere: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      showToast("Nom d'utilisateur et mot de passe requis.", 'error');
      return;
    }
    if (form.role === 'CHEF_FILIERE' && !form.filiere) {
      showToast('La filière est requise pour un chef de filière.', 'error');
      return;
    }
    setCreating(true);
    try {
      await createUser(token, { ...form, filiere: form.filiere || null });
      showToast(`Compte "${form.username}" créé avec succès.`, 'success');
      resetForm();
      setShowCreate(false);
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de créer ce compte.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const formNeedsFiliere = ['PROF', 'CHEF_FILIERE', 'ETUDIANT'].includes(form.role);

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
    u.role === 'CHEF_FILIERE' || u.role === 'PROF' || u.role === 'ETUDIANT';

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
        <div className="card-header-row">
          <h2>Créer un compte</h2>
          <button
            className="btn btn-accent"
            type="button"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? 'Annuler' : 'Nouveau compte'}
          </button>
        </div>
        {showCreate && (
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="new-firstName">Prénom</label>
                <input id="new-firstName" name="firstName" type="text" value={form.firstName} onChange={handleFormChange} />
              </div>
              <div className="field">
                <label htmlFor="new-lastName">Nom</label>
                <input id="new-lastName" name="lastName" type="text" value={form.lastName} onChange={handleFormChange} />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="new-username">Nom d’utilisateur</label>
                <input id="new-username" name="username" type="text" value={form.username} onChange={handleFormChange} required />
              </div>
              <div className="field">
                <label htmlFor="new-password">Mot de passe</label>
                <input id="new-password" name="password" type="password" value={form.password} onChange={handleFormChange} required />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="new-role">Rôle</label>
                <select id="new-role" name="role" value={form.role} onChange={handleFormChange}>
                  {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
                </select>
              </div>
              {formNeedsFiliere && (
                <div className="field">
                  <label htmlFor="new-filiere">Filière</label>
                  <select id="new-filiere" name="filiere" value={form.filiere} onChange={handleFormChange} required={form.role === 'CHEF_FILIERE'}>
                    <option value="">— Choisir la filière —</option>
                    {FILIERES_GROUPES.map((g) => (
                      <optgroup key={g.groupe} label={g.groupe}>
                        {g.filieres.map((f) => <option value={f} key={f}>{f}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-accent" disabled={creating}>
              {creating ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        )}
      </section>

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
                        {FILIERES_GROUPES.map((g) => (
                          <optgroup key={g.groupe} label={g.groupe}>
                            {g.filieres.map((f) => <option value={f} key={f}>{f}</option>)}
                          </optgroup>
                        ))}
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
import React, { useEffect, useState } from 'react';
import { BOOKING_URL, statusClass, statusLabel, getResources, createResource, updateResource, deleteResource } from '../api';
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

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Gérer les ressources</h2>
        <ResourceManager token={token} />
      </section>
    </div>
  );
}

function ResourceManager({ token }) {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ name: '', capacity: 10, location: '', price: 0 });
  const [editing, setEditing] = React.useState(null);

  const load = () => {
    setLoading(true);
    getResources().then((r) => { setList(r || []); setLoading(false); }).catch(() => { setList([]); setLoading(false); });
  };

  React.useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert('Le nom est requis');
    try {
      if (editing) {
        await updateResource(token, editing.id || editing.name, form);
      } else {
        await createResource(token, form);
      }
      setForm({ name: '', capacity: 10, location: '', price: 0 });
      setEditing(null);
      load();
    } catch (err) { alert(err.message || 'Erreur'); }
  };

  const remove = async (r) => {
    if (!confirm(`Supprimer ${r.name} ?`)) return;
    try { await deleteResource(token, r.id || r.name); load(); } catch (e) { alert('Impossible de supprimer'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="Capacité" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        <input placeholder="Emplacement" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <button className="btn btn-primary" onClick={save}>{editing ? 'Mettre à jour' : 'Créer'}</button>
      </div>

      {loading && <p className="empty-state">Chargement…</p>}
      {!loading && list.length === 0 && <p className="empty-state">Aucune ressource définie.</p>}
      {!loading && list.length > 0 && (
        <div className="simple-list">
          {list.map((r) => (
            <div key={r.id || r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <strong>{r.name}</strong> · {r.location} · cap {r.capacity} · {r.price}€
              </div>
              <div>
                <button className="btn btn-ghost" onClick={() => { setEditing(r); setForm({ name: r.name, capacity: r.capacity || 10, location: r.location || '', price: r.price || 0 }); }}>Éditer</button>
                <button className="btn btn-danger-outline" onClick={() => remove(r)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
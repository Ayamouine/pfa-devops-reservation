import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { BOOKING_URL, authHeaders } from '../api';

const CATEGORIES = [
  { value: 'SALLE', label: 'Salle' },
  { value: 'EVENEMENT', label: 'Événement' },
  { value: 'RENDEZVOUS', label: 'Rendez-vous' },
  { value: 'ATELIER', label: 'Atelier' },
];

const emptyForm = { name: '', category: 'SALLE', capacity: 1, price: 0 };

export default function AdminResourcesPage() {
  const { token, showToast, askConfirm } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch(`${BOOKING_URL}/resources`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'capacity' || name === 'price' ? Number(value) : value });
  };

  const startEdit = (resource) => {
    setEditingId(resource.id);
    setForm({ name: resource.name, category: resource.category, capacity: resource.capacity, price: resource.price });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `${BOOKING_URL}/resources/${editingId}` : `${BOOKING_URL}/resources`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(editingId ? 'Ressource modifiée.' : 'Ressource créée.', 'success');
      cancelEdit();
      load();
    } catch (err) {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (resource) => {
    askConfirm(`Supprimer la ressource "${resource.name}" ?`, async () => {
      try {
        const res = await fetch(`${BOOKING_URL}/resources/${resource.id}`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Ressource supprimée.', 'success');
        load();
      } catch (err) {
        showToast(err.message || 'Impossible de supprimer cette ressource.', 'error');
      }
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Gestion des ressources</h1>
        <p>Ajoute, modifie ou supprime les salles, événements et créneaux réservables.</p>
      </header>

      <section className="card">
        <h2>{editingId ? 'Modifier la ressource' : 'Nouvelle ressource'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nom</label>
            <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="category">Catégorie</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option value={c.value} key={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="capacity">Capacité (nombre de participants)</label>
            <input id="capacity" type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="price">Prix (MAD)</label>
            <input id="price" type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-accent btn-block" disabled={saving}>
            {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Créer la ressource'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost btn-block" onClick={cancelEdit}>
              Annuler la modification
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Ressources existantes</h2>
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && resources.length === 0 && <p className="empty-state">Aucune ressource pour le moment.</p>}
        {!loading && resources.length > 0 && (
          <div className="ticket-list">
            {resources.map((r) => (
              <div className="ticket" key={r.id}>
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{r.name}</span>
                    <span className="ticket-meta">
                      {CATEGORIES.find((c) => c.value === r.category)?.label || r.category} · capacité {r.capacity} · {r.price} MAD
                    </span>
                  </div>
                  <div className="ticket-right">
                    <button className="btn btn-ghost" onClick={() => startEdit(r)} type="button">Modifier</button>
                    <button className="btn btn-danger-outline" onClick={() => handleDelete(r)} type="button">Supprimer</button>
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
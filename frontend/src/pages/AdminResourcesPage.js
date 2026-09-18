import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  EQUIPMENTS,
} from '../api';

const emptyForm = {
  name: '',
  type: 'TD',
  category: 'TD',
  capacity: 40,
  price: 0,
  building: '',
  floor: '',
  location: '',
  equipments: [],
};

const equipmentsOf = (r) => {
  if (Array.isArray(r.equipments) && r.equipments.length > 0) return r.equipments;
  if (r.equipment) return r.equipment.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

export default function AdminResourcesPage() {
  const { token, showToast, askConfirm } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    getResources(token)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'capacity' || name === 'price') {
      setForm({ ...form, [name]: Number(value) });
      return;
    }
    if (name === 'type') {
      setForm({ ...form, type: value, category: value });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const toggleEquipment = (e) =>
    setForm((prev) => ({
      ...prev,
      equipments: prev.equipments.includes(e)
        ? prev.equipments.filter((x) => x !== e)
        : [...prev.equipments, e],
    }));

  const startEdit = (r) => {
    setEditingId(r.id);
    const type = r.type || r.category || 'TD';
    setForm({
      name: r.name,
      type,
      category: type,
      capacity: r.capacity || 40,
      price: r.price || 0,
      building: r.building || '',
      floor: r.floor || '',
      location: r.location || '',
      equipments: equipmentsOf(r),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      category: form.type,
      equipment: form.equipments.join(', '),
    };
    try {
      if (editingId) {
        await updateResource(token, editingId, payload);
      } else {
        await createResource(token, payload);
      }
      showToast(editingId ? 'Salle modifiée.' : 'Salle créée.', 'success');
      cancelEdit();
      load();
    } catch (err) {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (r) => {
    askConfirm(`Supprimer la salle "${r.name}" ?`, async () => {
      try {
        await deleteResource(token, r.id);
        showToast('Salle supprimée.', 'success');
        load();
      } catch (err) {
        showToast(err.message || 'Impossible de supprimer cette salle.', 'error');
      }
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Gestion des salles</h1>
        <p className="page-subtitle">
          Ajoutez ou mettez à jour les salles de la FST : bâtiment, étage, type, capacité, équipements, prix.
        </p>
      </header>

      <section className="card">
        <h2>{editingId ? 'Modifier la salle' : 'Nouvelle salle'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Nom</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                {ROOM_TYPES.map((t) => <option value={t.value} key={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="building">Bâtiment</label>
              <input id="building" type="text" name="building" placeholder="Ex. Bloc A" value={form.building} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="floor">Étage / local</label>
              <input id="floor" type="text" name="floor" placeholder="Ex. RDC, 1er étage" value={form.floor} onChange={handleChange} />
            </div>
          </div>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label htmlFor="capacity">Capacité</label>
              <input id="capacity" type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="price">Prix (MAD)</label>
              <input id="price" type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="location">Localisation</label>
              <input id="location" type="text" name="location" placeholder="Ex. Bloc A, Settat" value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label>Équipements</label>
            <div className="resource-meta" style={{ marginBottom: 0 }}>
              {EQUIPMENTS.map((e) => {
                const active = form.equipments.includes(e);
                return (
                  <button
                    type="button"
                    key={e}
                    className="meta-chip"
                    onClick={() => toggleEquipment(e)}
                    style={active ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : undefined}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn btn-accent btn-block" disabled={saving}>
            {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Créer la salle'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost btn-block" onClick={cancelEdit}>
              Annuler la modification
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Salles existantes</h2>
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && resources.length === 0 && <p className="empty-state">Aucune salle pour le moment.</p>}
        {!loading && resources.length > 0 && (
          <div className="ticket-list">
            {resources.map((r) => {
              const eqs = equipmentsOf(r);
              return (
                <div className="ticket" key={r.id}>
                  <div className={`ticket-stub ${r.price ? 'status-confirmed' : 'status-pending'}`} />
                  <div className="ticket-body">
                    <div className="ticket-main">
                      <span className="ticket-resource">
                        {r.name} <span className="chip">{ROOM_TYPE_LABELS[r.type || r.category] || r.type || r.category}</span>
                      </span>
                      <span className="ticket-meta">
                        {r.building || '—'}{r.floor ? ` · ${r.floor}` : ''} · capacité {r.capacity} · {r.price} MAD
                        {eqs.length > 0 ? ` · ${eqs.join(', ')}` : ''}
                      </span>
                    </div>
                    <div className="ticket-right">
                      <button className="btn btn-ghost" onClick={() => startEdit(r)} type="button">Modifier</button>
                      <button className="btn btn-danger-outline" onClick={() => handleDelete(r)} type="button">Supprimer</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

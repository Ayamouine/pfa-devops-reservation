import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResources, getOccupiedResources, ROOM_TYPES, ROOM_TYPE_LABELS, EQUIPMENTS } from '../api';
import { useAuth } from '../AuthContext';

const equipmentsOf = (r) => {
  if (Array.isArray(r.equipments) && r.equipments.length > 0) return r.equipments;
  if (r.equipment) return r.equipment.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

const typeLabel = (r) => ROOM_TYPE_LABELS[r.type || r.category] || r.type || r.category || 'Salle';

export default function ResourcesPage() {
  const { token, currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState('');
  const [type, setType] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [equipFilter, setEquipFilter] = useState([]);
  const [date, setDate] = useState('');
  const [occupied, setOccupied] = useState([]);

  useEffect(() => {
    getResources(token)
      .then((list) => setResources(Array.isArray(list) ? list : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!date) {
      setOccupied([]);
      return;
    }
    getOccupiedResources(token, date)
      .then((list) => setOccupied(list))
      .catch(() => setOccupied([]));
  }, [date, token]);

  const buildings = useMemo(() => Array.from(new Set(resources.map((r) => r.building).filter(Boolean))), [resources]);

  const toggleEquip = (e) =>
    setEquipFilter((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const resetFilters = () => {
    setQuery('');
    setBuilding('');
    setType('');
    setMinCapacity('');
    setEquipFilter([]);
    setDate('');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (building && r.building !== building) return false;
      if (type && (r.type || r.category) !== type) return false;
      if (minCapacity && Number(r.capacity || 0) < Number(minCapacity)) return false;
      if (equipFilter.length) {
        const set = equipmentsOf(r);
        if (!equipFilter.every((e) => set.includes(e))) return false;
      }
      if (date && occupied.includes(r.name)) return false;
      const haystack = `${r.name} ${r.type || r.category || ''} ${r.floor || ''} ${r.building || ''} ${equipmentsOf(r).join(' ')}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      return true;
    });
  }, [resources, building, type, minCapacity, equipFilter, date, occupied, query]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Salles &amp; ressources</h1>
          <p className="page-subtitle">
            {currentUser?.role === 'ETUDIANT'
              ? 'Consultez les salles et l’emploi du temps de la faculté.'
              : 'Salles disponibles à la réservation pour vos cours et activités.'}
          </p>
        </div>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-grid-3 form-grid">
          <div className="field">
            <label htmlFor="q">Recherche</label>
            <input id="q" type="text" placeholder="Nom, type, équipement…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="building">Bâtiment</label>
            <select id="building" value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="">Tous les bâtiments</option>
              {buildings.map((b) => <option value={b} key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Type de salle</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous les types</option>
              {ROOM_TYPES.map((t) => <option value={t.value} key={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid form-grid-3">
          <div className="field">
            <label htmlFor="minCapacity">Capacité minimale</label>
            <input
              id="minCapacity"
              type="number"
              min="0"
              placeholder="Ex. 40"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="date">Disponible le</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={resetFilters}>Réinitialiser</button>
          </div>
        </div>

        <div className="field">
          <label>Équipements</label>
          <div className="resource-meta" style={{ marginBottom: 0 }}>
            {EQUIPMENTS.map((e) => {
              const active = equipFilter.includes(e);
              return (
                <button
                  type="button"
                  key={e}
                  className="meta-chip"
                  onClick={() => toggleEquip(e)}
                  style={active ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : undefined}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && <p className="empty-state">Chargement…</p>}
      {!loading && filtered.length === 0 && (
        <p className="empty-state">Aucune salle ne correspond à votre recherche.</p>
      )}
      {!loading && filtered.length > 0 && (
        <div className="resource-list">
          {filtered.map((r) => {
            const isOccupied = date && occupied.includes(r.name);
            return (
              <div className="resource-card" key={r.id || r.name}>
                <div className="resource-body">
                  <div className="resource-meta" style={{ marginBottom: 8 }}>
                    <span className="meta-chip">{typeLabel(r)}</span>
                    {r.capacity && <span className="meta-chip">👥 {r.capacity} pers.</span>}
                    {isOccupied && <span className="meta-chip" style={{ background: '#fdecea', color: '#b3261e', borderColor: '#f5c2bd' }}>Occupé le {date}</span>}
                  </div>
                  <Link className="resource-name" to={`/ressources/${encodeURIComponent(r.name)}`}>
                    {r.name}
                  </Link>
                  <div className="resource-location">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {[r.building, r.floor].filter(Boolean).join(' · ') || r.location || 'Localisation à préciser'}
                  </div>
                  <div className="resource-meta">
                    {equipmentsOf(r).map((e) => <span className="meta-chip" key={e}>🛠 {e}</span>)}
                  </div>
                  <div className="resource-card-footer">
                    <Link className="resource-card-link" to={`/ressources/${encodeURIComponent(r.name)}`}>
                      Voir le détail →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

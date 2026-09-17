import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResources } from '../api';
import { useAuth } from '../AuthContext';

const PLACEHOLDER = 'https://www.fsts.ac.ma/images/fst_hero_img.jpg';

export default function ResourcesPage() {
  const { token, currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    getResources(token)
      .then((list) => setResources(Array.isArray(list) ? list : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  const buildings = useMemo(() => Array.from(new Set(resources.map((r) => r.building).filter(Boolean))), [resources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (building && r.building !== building) return false;
      if (q && !`${r.name} ${r.category || ''} ${r.floor || ''} ${r.equipment || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [resources, building, query]);

  const catLabel = (c) => {
    const map = { SALLE: 'Salle', TP: 'Salle TP', AMPHI: 'Amphithéâtre', REUNION: 'Salle de réunion', AUTRE: 'Autre' };
    return map[c] || c || 'Salle';
  };

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
        </div>
      </div>

      {loading && <p className="empty-state">Chargement…</p>}
      {!loading && filtered.length === 0 && (
        <p className="empty-state">Aucune salle ne correspond à votre recherche.</p>
      )}
      {!loading && filtered.length > 0 && (
        <div className="resource-list">
          {filtered.map((r) => (
            <div className="resource-card" key={r.id || r.name}>
              <div className="resource-photo">
                {r.photo ? <img src={r.photo} alt={r.name} /> : <img src={PLACEHOLDER} alt="" />}
                <div className="photo-overlay">
                  <span className="photo-category">{catLabel(r.category)}</span>
                  <span className="photo-price">{r.price ? `${r.price} MAD` : 'Gratuit'}</span>
                </div>
              </div>
              <div className="resource-body">
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
                  {r.capacity && <span className="meta-chip">👥 {r.capacity} pers.</span>}
                  {r.equipment && <span className="meta-chip">🛠 {r.equipment}</span>}
                </div>
                <div className="resource-card-footer">
                  <Link className="resource-card-link" to={`/ressources/${encodeURIComponent(r.name)}`}>
                    Voir le détail →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
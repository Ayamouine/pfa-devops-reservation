import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResources } from '../api';
import { useAuth } from '../AuthContext';

export default function ResourcesPage() {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources(token)
      .then((list) => setResources(Array.isArray(list) ? list : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Ressources</h1>
        <p>Salles, événements et créneaux disponibles à la réservation.</p>
      </header>

      <section className="card">
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && resources.length === 0 && (
          <p className="empty-state">Aucune ressource disponible pour le moment.</p>
        )}
        {!loading && resources.length > 0 && (
          <div className="resource-list">
            {resources.map((r) => (
              <div className="resource-card" key={r.id || r.name}>
                <div className="resource-card-header">
                  <span className="ticket-resource">
                    <Link to={`/ressources/${encodeURIComponent(r.name)}`}>{r.name}</Link>
                  </span>
                  <span className="stat-label">{r.category || ''}</span>
                </div>
                <p className="availability-hint">
                  {r.location ? `Lieu : ${r.location}` : ''} {r.capacity ? `— Capacité : ${r.capacity}` : ''}
                </p>
                <a href={`/ressources/${encodeURIComponent(r.name)}`}>Voir le détail</a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
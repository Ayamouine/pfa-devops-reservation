import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BOOKING_URL, authHeaders } from '../api';
import { useAuth } from '../AuthContext';

export default function ResourcesPage() {
  const { token } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BOOKING_URL}/bookings/resources`, { headers: authHeaders(token) })
      .then((res) => res.json())
      .then(setAllBookings)
      .catch(() => setAllBookings([]))
      .finally(() => setLoading(false));
  }, [token]);

  const resources = {};
  allBookings.forEach((b) => {
    if (!b.resource) return;
    if (!resources[b.resource]) resources[b.resource] = [];
    if ((b.status || '').toLowerCase() !== 'cancelled') resources[b.resource].push(b.date);
  });
  const resourceNames = Object.keys(resources).sort();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Ressources</h1>
        <p>Aperçu des ressources déjà réservées et de leurs dates occupées.</p>
      </header>

      <section className="card">
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && resourceNames.length === 0 && (
          <p className="empty-state">
            Aucune ressource réservée pour le moment. <Link to="/reservations">Créez la première réservation</Link>.
          </p>
        )}
        {!loading && resourceNames.length > 0 && (
          <div className="resource-list">
            {resourceNames.map((name) => (
              <div className="resource-card" key={name}>
                <div className="resource-card-header">
                  <span className="ticket-resource">{name}</span>
                  <span className="stat-label">{resources[name].length} réservation(s)</span>
                </div>
                <p className="availability-hint">
                  {resources[name].length > 0
                    ? `Occupée le : ${resources[name].join(', ')}`
                    : 'Aucune date occupée actuellement.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
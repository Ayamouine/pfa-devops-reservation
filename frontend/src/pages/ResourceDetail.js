import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResources, createBooking } from '../api';
import Calendar from '../components/Calendar';
import { useAuth } from '../AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const { token, currentUser, showToast } = useAuth();
  const navigate = useNavigate();
  const isEtudiant = currentUser?.role === 'ETUDIANT';

  useEffect(() => {
    getResources(token)
      .then((list) => {
        const found = list.find((r) => r.name === decodeURIComponent(id));
        setResource(found || { name: decodeURIComponent(id) });
      })
      .catch(() => setResource({ name: decodeURIComponent(id) }));
  }, [id, token]);

  const handleBook = async (resourceName, date) => {
    if (!token) return navigate('/login');
    try {
      const data = await createBooking(token, {
        resource: resourceName,
        date,
        username: currentUser.username,
        status: 'pending',
      });
      showToast(`Demande de réservation envoyée pour ${resourceName} le ${date}.`, 'success');
      return data;
    } catch (err) {
      throw new Error(err?.message || 'Erreur lors de la réservation');
    }
  };

  const catLabel = (c) => {
    const map = { SALLE: 'Salle', TP: 'Salle TP', AMPHI: 'Amphithéâtre', REUNION: 'Salle de réunion', AUTRE: 'Autre' };
    return map[c] || c || 'Salle';
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{resource ? resource.name : decodeURIComponent(id)}</h1>
          <p className="page-subtitle">
            {resource ? [resource.building, resource.floor, resource.location].filter(Boolean).join(' · ') : ''}
          </p>
        </div>
        {resource && (
          <div className="page-header-actions">
            <span className="status-pill">{catLabel(resource.category)}</span>
            {resource.capacity && <span className="status-pill">👥 Capacité : {resource.capacity}</span>}
            <span className="status-pill">💰 {resource.price ? `${resource.price} MAD` : 'Gratuit'}</span>
          </div>
        )}
      </header>

      {resource?.photo && (
        <div className="resource-detail-photo">
          <img src={resource.photo} alt={resource.name} />
        </div>
      )}

      {resource?.equipment && (
        <section className="card" style={{ marginTop: 18 }}>
          <h2>Équipements</h2>
          <p>{resource.equipment}</p>
        </section>
      )}

      <section className="card" style={{ marginTop: 18 }}>
        <h3>Disponibilité sur 14 jours</h3>
        <p className="small-muted">
          {isEtudiant
            ? 'Les étudiants consultent l’emploi du temps mais ne réservent pas.'
            : 'Cliquez sur un créneau libre pour demander une réservation.'}
        </p>
        <Calendar
          resource={resource ? resource.name : decodeURIComponent(id)}
          onBook={isEtudiant ? null : handleBook}
        />
      </section>

      {isEtudiant && (
        <section className="card" style={{ marginTop: 18 }}>
          <p className="empty-state">
            Une salle vous intéresse ? La demande de réservation est réservée au corps enseignant.
          </p>
        </section>
      )}
    </div>
  );
}
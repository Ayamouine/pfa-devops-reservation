import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResources, createBooking, ROOM_TYPE_LABELS } from '../api';
import Calendar from '../components/Calendar';
import { useAuth } from '../AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const { token, currentUser, showToast } = useAuth();
  const navigate = useNavigate();
  const isEtudiant = currentUser?.role === 'ETUDIANT';
  const isClub = currentUser?.role === 'CLUB';
  const [motif, setMotif] = useState('');

  useEffect(() => {
    getResources(token)
      .then((list) => {
        const found = list.find((r) => r.name === decodeURIComponent(id));
        setResource(found || { name: decodeURIComponent(id) });
      })
      .catch(() => setResource({ name: decodeURIComponent(id) }));
  }, [id, token]);

  const handleBook = async (resourceName, date, creneau) => {
    if (!token) return navigate('/login');
    if (isClub && !motif.trim()) {
      showToast("Indiquez l'objet de l'événement avant de réserver.", 'error');
      throw new Error("Objet de l'événement requis");
    }
    try {
      const data = await createBooking(token, {
        resource: resourceName,
        date,
        creneau,
        username: currentUser.username,
        filiere: isClub ? undefined : currentUser.filiere,
        motif: motif || undefined,
        bookingType: isClub ? 'EVENEMENT' : undefined,
        club: isClub ? currentUser.club : undefined,
        status: 'pending',
      });
      showToast(
        isClub
          ? `Demande d'événement envoyée au doyen pour ${resourceName} le ${date}${creneau ? ` (${creneau})` : ''}.`
          : `Demande de réservation envoyée pour ${resourceName} le ${date}${creneau ? ` (${creneau})` : ''}.`,
        'success'
      );
      return data;
    } catch (err) {
      throw new Error(err?.message || 'Erreur lors de la réservation');
    }
  };

  const equipments = (r) => {
    if (Array.isArray(r?.equipments) && r.equipments.length > 0) return r.equipments;
    if (r?.equipment) return r.equipment.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const catLabel = (c) => ROOM_TYPE_LABELS[c] || c || 'Salle';

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
            <span className="status-pill">{catLabel(resource.type || resource.category)}</span>
            {resource.capacity && <span className="status-pill">👥 Capacité : {resource.capacity}</span>}
            <span className="status-pill">💰 {resource.price ? `${resource.price} MAD` : 'Gratuit'}</span>
          </div>
        )}
      </header>

      {resource && equipments(resource).length > 0 && (
        <section className="card" style={{ marginTop: 18 }}>
          <h2>Équipements</h2>
          <div className="resource-meta" style={{ marginBottom: 0 }}>
            {equipments(resource).map((e) => <span className="meta-chip" key={e}>{e}</span>)}
          </div>
        </section>
      )}

      <section className="card" style={{ marginTop: 18 }}>
        <h3>Disponibilité (jour / semaine / mois)</h3>
        <p className="small-muted">
          {isEtudiant
            ? 'Les étudiants consultent l’emploi du temps mais ne réservent pas.'
            : 'Cliquez sur un créneau libre pour demander une réservation.'}
        </p>
        {!isEtudiant && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="motif">
              {isClub ? "Objet de l'événement (requis)" : 'Motif (optionnel)'}
            </label>
            <input
              id="motif"
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder={isClub ? 'Ex. Hackathon CLIC 2026' : 'Ex. Cours de Bases de Données'}
              required={isClub}
            />
          </div>
        )}
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
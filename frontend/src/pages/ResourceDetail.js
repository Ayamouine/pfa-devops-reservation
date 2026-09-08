import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResources, createBooking } from '../api';
import Calendar from '../components/Calendar';
import { useAuth } from '../AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getResources().then((list) => {
      const found = list.find((r) => r.name === decodeURIComponent(id));
      setResource(found || { name: decodeURIComponent(id) });
    });
  }, [id]);

  const handleBook = async (resourceName, date) => {
    if (!token) return navigate('/login');
    try {
      const data = await createBooking(token, { resource: resourceName, date, username: currentUser.username, status: 'pending' });
      // return data for Calendar component to show success
      return data;
    } catch (err) {
      throw new Error(err?.message || 'Erreur lors de la réservation');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Détail : {resource ? resource.name : decodeURIComponent(id)}</h1>
        <p>{resource ? resource.location || 'Emplacement inconnu' : ''}</p>
        {resource && (
          <div style={{ marginTop: 8 }}>
            <span className="status-pill">Capacité: <strong style={{ marginLeft: 8 }}>{resource.capacity || '-'}</strong></span>
            <span style={{ marginLeft: 12 }} className="status-pill">Prix: <strong style={{ marginLeft: 8 }}>{resource.price ? `${resource.price}€` : '-'}</strong></span>
          </div>
        )}
      </header>

      <section className="card">
        <h3>Calendrier (14 jours)</h3>
        <p className="small-muted">Cliquez sur une date libre pour demander une réservation.</p>
        <Calendar resource={resource ? resource.name : decodeURIComponent(id)} onBook={handleBook} />
      </section>
    </div>
  );
}

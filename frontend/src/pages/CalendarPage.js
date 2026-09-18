import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { getResources, createBooking, FILIERES_GROUPES } from '../api';
import { useAuth } from '../AuthContext';

export default function CalendarPage() {
  const [resources, setResources] = useState([]);
  const [mode, setMode] = useState('resource');
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const { currentUser, token, role } = useAuth();
  const canBook = role !== 'ETUDIANT';

  useEffect(() => {
    (async () => {
      try {
        const r = await getResources(token);
        setResources(r);
        if (r.length) setSelectedResource(r[0].name || r[0].id);
      } catch (e) {
        // ignore
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!selectedFiliere && currentUser?.filiere) setSelectedFiliere(currentUser.filiere);
  }, [currentUser, selectedFiliere]);

  const handleBook = async (resource, date, creneau) => {
    const payload = {
      resource,
      date,
      creneau,
      username: currentUser.username,
      filiere: currentUser.filiere || (mode === 'filiere' ? selectedFiliere : undefined),
      status: 'pending',
    };
    if (role === 'CLUB') {
      payload.bookingType = 'EVENEMENT';
      payload.club = currentUser.club;
      delete payload.filiere;
    }
    return createBooking(token, payload);
  };

  const active = mode === 'resource' ? selectedResource : selectedFiliere;

  return (
    <div>
      <h2>Calendrier</h2>
      <div className="calendar-toolbar">
        <div className="calendar-tabs">
          <button
            type="button"
            className={`btn calendar-tab ${mode === 'resource' ? 'active' : ''}`}
            onClick={() => setMode('resource')}
          >
            Par salle
          </button>
          <button
            type="button"
            className={`btn calendar-tab ${mode === 'filiere' ? 'active' : ''}`}
            onClick={() => setMode('filiere')}
          >
            Par filière
          </button>
        </div>
        {mode === 'resource' ? (
          <label className="calendar-select">
            Salle :
            <select value={selectedResource || ''} onChange={(e) => setSelectedResource(e.target.value)}>
              {resources.map((r) => (
                <option key={r.id} value={r.name || r.id}>{r.name || r.id}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className="calendar-select">
            Filière :
            <select value={selectedFiliere || ''} onChange={(e) => setSelectedFiliere(e.target.value)}>
              <option value="">— Choisir —</option>
              {FILIERES_GROUPES.map((g) => (
                <optgroup key={g.groupe} label={g.groupe}>
                  {g.filieres.map((f) => <option key={f} value={f}>{f}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
        )}
      </div>

      {active ? (
        <Calendar
          key={mode}
          resource={mode === 'resource' ? selectedResource : undefined}
          filiere={mode === 'filiere' ? selectedFiliere : undefined}
          onBook={canBook ? handleBook : undefined}
        />
      ) : (
        <p className="small-muted">Sélectionnez {mode === 'resource' ? 'une salle' : 'une filière'}.</p>
      )}

      {!canBook && (
        <p className="small-muted">
          Consultation seule : les demandes de réservation sont réservées au corps enseignant.
        </p>
      )}
    </div>
  );
}

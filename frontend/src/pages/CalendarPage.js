import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { getResources, createBooking } from '../api';
import { useAuth } from '../AuthContext';

export default function CalendarPage() {
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState(null);
  const { currentUser, token } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const r = await getResources();
        setResources(r);
        if (r.length) setSelected(r[0].name || r[0].id);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleBook = async (resource, date) => {
    const payload = { resource, date, username: currentUser.username };
    return createBooking(token, payload);
  };

  return (
    <div>
      <h2>Calendrier</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Ressource: </label>
        <select value={selected || ''} onChange={(e) => setSelected(e.target.value)}>
          {resources.map((r) => (
            <option key={r.id} value={r.name || r.id}>{r.name || r.id}</option>
          ))}
        </select>
      </div>
      {selected ? <Calendar resource={selected} onBook={handleBook} /> : <p>Aucune ressource</p>}
    </div>
  );
}

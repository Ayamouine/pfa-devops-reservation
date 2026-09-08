import React, { useEffect, useState } from 'react';
import { checkAvailability } from '../api';
import { useAuth } from '../AuthContext';

export default function Calendar({ resource, onBook }) {
  const [days, setDays] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});

  useEffect(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d.toISOString().slice(0, 10));
    }
    setDays(list);
  }, []);

  const check = async (day) => {
    try {
      setLoadingMap((m) => ({ ...m, [day]: true }));
      const res = await checkAvailability(resource, day);
      return res.available;
    } finally {
      setLoadingMap((m) => ({ ...m, [day]: false }));
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-grid">
        {days.map((d) => (
          <CalendarDay
            key={d}
            date={d}
            resource={resource}
            onBook={onBook}
            checkAvailability={check}
            loading={!!loadingMap[d]}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDay({ date, resource, onBook, checkAvailability, loading }) {
  const [available, setAvailable] = useState(null);
  const [booking, setBooking] = useState(false);
  const { showToast } = useAuth();

  const refresh = async () => {
    try {
      const a = await checkAvailability(date);
      setAvailable(a);
    } catch (e) {
      setAvailable(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [date, resource]);

  const handleBook = async () => {
    if (!onBook) return showToast('Action indisponible', 'error');
    try {
      setBooking(true);
      await onBook(resource, date);
      showToast(`Réservation demandée pour ${resource} le ${date}`, 'success');
      await refresh();
    } catch (err) {
      showToast(err?.message || 'Impossible de réserver', 'error');
    } finally {
      setBooking(false);
    }
  };

  const human = new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className={`calendar-day ${available === false ? 'busy' : available === true ? 'free' : ''}`}>
      <div className="day-label">{human}</div>
      {loading ? (
        <div className="small-muted">…</div>
      ) : (
        <>
          {available === null && <div className="small-muted">?</div>}
          {available === true && (
            <button className="btn btn-sm" onClick={handleBook} disabled={booking}>
              {booking ? 'Réservation…' : 'Réserver'}
            </button>
          )}
          {available === false && <div className="small-muted">Occupé</div>}
        </>
      )}
    </div>
  );
}

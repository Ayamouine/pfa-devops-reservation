import React, { useEffect, useMemo, useState } from 'react';
import { getCalendarBookings, SLOTS } from '../api';
import { useAuth } from '../AuthContext';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
const startOfWeek = (d) => {
  const c = new Date(d);
  const offset = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - offset);
  return c;
};
const sameDay = (a, b) => iso(a) === iso(b);

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const ACTIVE_STATUSES = new Set(['PENDING', 'APPROVED', 'CONFIRMED']);

const STATUS_LABEL = {
  free: 'Libre',
  pending: 'En attente',
  busy: 'Occupé',
  confirmed: 'Confirmé',
};

const statusOf = (statuses) => {
  if (!statuses || statuses.length === 0) return 'free';
  if (statuses.includes('CONFIRMED')) return 'confirmed';
  if (statuses.includes('APPROVED')) return 'busy';
  if (statuses.includes('PENDING')) return 'pending';
  return 'free';
};

export default function Calendar({ resource, filiere, onBook, defaultView = 'day' }) {
  const { token } = useAuth();
  const [view, setView] = useState(defaultView);
  const [anchor, setAnchor] = useState(() => new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const range = useMemo(() => {
    if (view === 'day') return { from: iso(anchor), to: iso(anchor) };
    if (view === 'week') {
      const s = startOfWeek(anchor);
      return { from: iso(s), to: iso(addDays(s, 6)) };
    }
    const s = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    return { from: iso(s), to: iso(addDays(s, 41)) };
  }, [view, anchor]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCalendarBookings(token, { ...range, resource, filiere })
      .then((list) => {
        if (alive) setBookings(Array.isArray(list) ? list.filter((b) => ACTIVE_STATUSES.has(b.status)) : []);
      })
      .catch(() => {
        if (alive) setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [range, resource, filiere, token, tick]);

  const byDateSlot = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const key = `${b.date}|${b.creneau || ''}`;
      (map[key] = map[key] || []).push(b);
    });
    return map;
  }, [bookings]);

  const byDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      (map[b.date] = map[b.date] || []).push(b);
    });
    return map;
  }, [bookings]);

  const listForSlot = (date, slot) => byDateSlot[`${date}|${slot}`] || [];

  const handleBook = async (date, slot) => {
    if (!onBook) return;
    await onBook(resource, date, slot);
    setTick((t) => t + 1);
  };

  const step = (dir) => {
    if (view === 'day') return setAnchor((a) => addDays(a, dir));
    if (view === 'week') return setAnchor((a) => addDays(a, dir * 7));
    return setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + dir, 1));
  };

  const title = useMemo(() => {
    if (view === 'day') {
      return anchor.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const s = startOfWeek(anchor);
      const e = addDays(s, 6);
      return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return anchor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [view, anchor]);

  const weekDays = useMemo(() => {
    const s = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [anchor]);

  const monthWeeks = useMemo(() => {
    const s = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(s, w * 7 + d)));
  }, [anchor]);

  const today = new Date();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button type="button" className="btn" onClick={() => step(-1)}>‹</button>
          <button type="button" className="btn" onClick={() => setAnchor(new Date())}>Aujourd’hui</button>
          <button type="button" className="btn" onClick={() => step(1)}>›</button>
          <span className="calendar-title">{title}</span>
        </div>
        <div className="calendar-views">
          {[['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']].map(([v, label]) => (
            <button
              type="button"
              key={v}
              className={`btn calendar-view-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        {['free', 'pending', 'busy', 'confirmed'].map((s) => (
          <span className="legend-item" key={s}>
            <span className={`legend-dot status-${s}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
        {loading && <span className="small-muted">Chargement…</span>}
      </div>

      {view === 'day' && (
        <div className="calendar-day-view">
          {SLOTS.map((slot) => {
            const list = listForSlot(iso(anchor), slot);
            const status = statusOf(list.map((b) => b.status));
            return (
              <div className={`slot-row status-${status}`} key={slot}>
                <span className="slot-time">{slot}</span>
                {status === 'free' ? (
                  onBook && resource ? (
                    <button type="button" className="btn btn-sm" onClick={() => handleBook(iso(anchor), slot)}>Réserver</button>
                  ) : (
                    <span className="slot-badge free">Libre</span>
                  )
                ) : (
                  <span className={`slot-badge ${status}`}>{STATUS_LABEL[status]}</span>
                )}
                <span className="slot-motif">
                  {list.map((b) => `${b.motif ? `« ${b.motif} » · ` : ''}${b.resource}${b.username ? ` · ${b.username}` : ''}`).join(', ')}
                </span>
              </div>
            );
          })}
          {!resource && !filiere && <p className="small-muted">Sélectionnez une salle ou une filière.</p>}
        </div>
      )}

      {view === 'week' && (
        <div className="calendar-week">
          <div className="calendar-weekrow header">
            <div className="week-slotlabel" />
            {weekDays.map((day) => (
              <div className={`week-dayhead ${sameDay(day, today) ? 'today' : ''}`} key={iso(day)}>
                {WEEKDAYS[(day.getDay() + 6) % 7]} <strong>{day.getDate()}</strong>
              </div>
            ))}
          </div>
          {SLOTS.map((slot) => (
            <div className="calendar-weekrow" key={slot}>
              <div className="week-slotlabel">{slot}</div>
              {weekDays.map((day) => {
                const list = listForSlot(iso(day), slot);
                const status = statusOf(list.map((b) => b.status));
                const clickable = status === 'free' && onBook && resource;
                return (
                  <div
                    className={`week-cell status-${status} ${clickable ? 'clickable' : ''}`}
                    key={iso(day)}
                    onClick={clickable ? () => handleBook(iso(day), slot) : undefined}
                  >
                    {status === 'free' ? (clickable ? 'Réserver' : '') : list.length > 1 ? list.length : STATUS_LABEL[status]}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === 'month' && (
        <div className="calendar-month">
          <div className="calendar-monthhead">
            {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-monthgrid">
            {monthWeeks.flat().map((day) => {
              const key = iso(day);
              const inMonth = day.getMonth() === anchor.getMonth();
              const status = statusOf((byDate[key] || []).map((b) => b.status));
              const count = (byDate[key] || []).length;
              return (
                <div
                  key={key}
                  className={`month-cell status-${status} ${inMonth ? '' : 'outside'} ${sameDay(day, today) ? 'today' : ''}`}
                  onClick={() => { setAnchor(day); setView('day'); }}
                >
                  <span className="month-daynum">{day.getDate()}</span>
                  {status !== 'free' && <span className={`legend-dot status-${status}`} />}
                  {count > 1 && <span className="month-count">{count}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

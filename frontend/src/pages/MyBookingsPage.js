import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { BOOKING_URL, PAYMENT_URL, authHeaders, statusClass, statusLabel } from '../api';

export default function MyBookingsPage() {
  const { currentUser, token, showToast, askConfirm } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({ resource: '', date: '' });
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

const loadAll = useCallback(() => {
  fetch(`${BOOKING_URL}/bookings/resources`, { headers: authHeaders(token) })
    .then((res) => res.json())
    .then(setAllBookings)
    .catch(() => setAllBookings([]));
}, [token]);

const loadMine = useCallback(() => {
  fetch(`${BOOKING_URL}/bookings/mine?username=${encodeURIComponent(currentUser.username)}`, { headers: authHeaders(token) })
    .then((res) => res.json())
    .then(setMyBookings)
    .catch(() => setMyBookings([]));
}, [currentUser.username, token]);

  const refresh = useCallback(() => {
    loadAll();
    loadMine();
  }, [loadAll, loadMine]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const knownResources = Array.from(new Set(allBookings.map((b) => b.resource).filter(Boolean)));

  const handleBookingChange = (e) => setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingMessage('');
    try {
      const res = await fetch(`${BOOKING_URL}/bookings`, {
        method: 'POST',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...bookingForm, status: 'pending', username: currentUser.username }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(res.status === 409 ? 'Cette ressource est déjà réservée pour cette date.' : errText || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setBookingMessage(`Réservation créée : ${data.resource} le ${data.date}.`);
      setBookingForm({ resource: '', date: '' });
      refresh();
    } catch (err) {
      setBookingError(err.message || 'Une erreur est survenue.');
    }
  };

  const handleCancelBooking = (booking) => {
    askConfirm(`Annuler la réservation "${booking.resource}" du ${booking.date} ?`, async () => {
      setCancellingId(booking.id);
      try {
        const params = new URLSearchParams({ username: currentUser.username, role: currentUser.role });
        const res = await fetch(`${BOOKING_URL}/bookings/${booking.id}?${params.toString()}`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        if (!res.ok && res.status !== 204) throw new Error(await res.text());
        showToast('Réservation annulée.', 'success');
        refresh();
      } catch (err) {
        showToast(err.message || "Impossible d'annuler cette réservation.", 'error');
      } finally {
        setCancellingId(null);
      }
    });
  };

  const handlePayBooking = async (booking) => {
    setPayingId(booking.id);
    try {
      const payRes = await fetch(`${PAYMENT_URL}/payments`, {
        method: 'POST',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ reservationId: String(booking.id), amount: 150, username: currentUser.username }),
      });
      if (!payRes.ok) throw new Error(await payRes.text());

      const params = new URLSearchParams({ username: currentUser.username, role: currentUser.role });
      const confirmRes = await fetch(`${BOOKING_URL}/bookings/${booking.id}/confirm?${params.toString()}`, {
        method: 'POST',
        headers: authHeaders(token),
      });
      if (!confirmRes.ok) throw new Error(await confirmRes.text());

      showToast('Paiement effectué, réservation confirmée.', 'success');
      refresh();
    } catch (err) {
      showToast(err.message || 'Le paiement a échoué.', 'error');
    } finally {
      setPayingId(null);
    }
  };

  const startEdit = (booking) => {
    setEditingBooking(booking);
    setEditDate(booking.date);
  };

  const cancelEdit = () => {
    setEditingBooking(null);
    setEditDate('');
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const params = new URLSearchParams({ username: currentUser.username, role: currentUser.role });
      const res = await fetch(`${BOOKING_URL}/bookings/${editingBooking.id}?${params.toString()}`, {
        method: 'PUT',
        headers: authHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ resource: editingBooking.resource, date: editDate }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(res.status === 409 ? 'Cette ressource est déjà réservée à cette date.' : errText);
      }
      showToast('Réservation modifiée.', 'success');
      cancelEdit();
      refresh();
    } catch (err) {
      showToast(err.message || 'Impossible de modifier cette réservation.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mes réservations</h1>
        <p>Créez, modifiez et suivez vos réservations.</p>
      </header>

      <section className="card">
        <h2>Nouvelle réservation</h2>
        <form onSubmit={handleBookingSubmit}>
          <div className="field">
            <label htmlFor="resource">Ressource</label>
            <input
              id="resource"
              type="text"
              name="resource"
              placeholder="Ex. Salle A, Vidéoprojecteur…"
              value={bookingForm.resource}
              onChange={handleBookingChange}
              list="resource-options"
              required
            />
            <datalist id="resource-options">
              {knownResources.map((r) => <option value={r} key={r} />)}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" name="date" value={bookingForm.date} onChange={handleBookingChange} required />
          </div>
          <button type="submit" className="btn btn-accent btn-block">Réserver</button>
        </form>
        {bookingMessage && <p className="message success">{bookingMessage}</p>}
        {bookingError && <p className="message error">{bookingError}</p>}
      </section>

      <section className="card">
        <h2>Vos réservations</h2>
        {myBookings.length === 0 && <p className="empty-state">Aucune réservation pour le moment.</p>}
        {myBookings.length > 0 && (
          <div className="ticket-list">
            {myBookings.map((booking) => (
              <div className="ticket" key={booking.id}>
                <div className={`ticket-stub ${statusClass(booking.status)}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">{booking.resource}</span>
                    <span className="ticket-meta">{booking.date}</span>
                  </div>
                  <div className="ticket-right">
                    <span className={`badge ${statusClass(booking.status)}`}>{statusLabel(booking.status)}</span>
                    {(booking.status || '').toLowerCase() === 'pending' && (
                      <button className="btn btn-accent" onClick={() => handlePayBooking(booking)} disabled={payingId === booking.id} type="button">
                        {payingId === booking.id ? 'Paiement…' : 'Payer'}
                      </button>
                    )}
                    {(booking.status || '').toLowerCase() !== 'cancelled' && (
                      <button className="btn btn-ghost" onClick={() => startEdit(booking)} type="button">Modifier</button>
                    )}
                    <button className="btn btn-danger-outline" onClick={() => handleCancelBooking(booking)} disabled={cancellingId === booking.id} type="button">
                      {cancellingId === booking.id ? 'Annulation…' : 'Annuler'}
                    </button>
                  </div>
                </div>
                {editingBooking?.id === booking.id && (
                  <div className="edit-row">
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                    <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit} type="button">
                      {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit} type="button">Annuler</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
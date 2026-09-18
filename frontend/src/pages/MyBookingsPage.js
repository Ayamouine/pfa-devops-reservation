import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  FILIERES_GROUPES,
  getResources,
  createBooking,
  getMyBookings,
  updateBooking,
  cancelBooking,
  attachDocument,
  downloadDocument,
  downloadSignedDocument,
  statusClass,
  statusLabel,
  checkAvailability,
  SLOTS,
} from '../api';

const CRENEAUX = SLOTS;

function historyClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'payment') return 'status-confirmed';
  if (s === 'rejected' || s === 'cancelled') return 'status-rejected';
  if (s === 'approved') return 'status-approved';
  if (s === 'document') return 'status-info';
  return 'status-pending';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyBookingsPage() {
  const { currentUser, token, showToast, askConfirm } = useAuth();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    resource: '',
    date: '',
    creneau: CRENEAUX[0],
    motif: '',
    filiere: currentUser?.filiere || '',
  });
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({ date: '', creneau: CRENEAUX[0], motif: '' });

  const load = useCallback(() => {
    return Promise.all([getResources(token), getMyBookings(token, currentUser.username)])
      .then(([res, books]) => {
        setResources(Array.isArray(res) ? res : []);
        const list = Array.isArray(books) ? books : [];
        setBookings(list.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))));
        return list;
      })
      .catch(() => [])
      .finally(() => setLoading(false));
  }, [token, currentUser.username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'resource' || name === 'date' || name === 'creneau') setAvailable(null);
  };

  const handleCheck = async () => {
    if (!form.resource || !form.date) return;
    setChecking(true);
    setAvailable(null);
    try {
      const data = await checkAvailability(form.resource, form.date, token, form.creneau);
      setAvailable(data.available);
    } catch (e) {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (form.resource && form.date) handleCheck();
  }, [form.resource, form.date, form.creneau]);

  const isClub = currentUser.role === 'CLUB';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        resource: form.resource,
        date: form.date,
        creneau: form.creneau,
        motif: form.motif,
        username: currentUser.username,
        status: 'pending',
      };
      if (isClub) {
        payload.bookingType = 'EVENEMENT';
        payload.club = currentUser.club;
      } else {
        payload.filiere = form.filiere;
      }
      const created = await createBooking(token, payload);
      if (file) {
        const updated = await attachDocument(token, created.id, file);
        showToast(isClub ? 'Demande d’événement créée avec document justificatif.' : 'Demande créée avec document justificatif.', 'success');
        return updated;
      }
      showToast(isClub ? 'Demande d’événement envoyée au doyen.' : 'Demande de réservation envoyée au chef de filière.', 'success');
      setForm((f) => ({ ...f, resource: '', date: '', motif: '', creneau: CRENEAUX[0] }));
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de créer la demande.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditState({ date: b.date, creneau: b.creneau || CRENEAUX[0], motif: b.motif || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ date: '', creneau: CRENEAUX[0], motif: '' });
  };

  const saveEdit = async () => {
    try {
      await updateBooking(token, editingId, {
        resource: bookings.find((b) => b.id === editingId)?.resource,
        date: editState.date,
        creneau: editState.creneau,
        motif: editState.motif,
      });
      showToast('Demande mise à jour (retour en attente).', 'success');
      cancelEdit();
      load();
    } catch (err) {
      showToast(err.message || 'Impossible de modifier la demande.', 'error');
    }
  };

  const handleCancel = (b) => {
    askConfirm(`Annuler la demande "${b.resource}" du ${b.date} ?`, async () => {
      try {
        await cancelBooking(token, b.id, currentUser.username, currentUser.role);
        showToast('Demande supprimée.', 'success');
        load();
      } catch (err) {
        showToast(err.message || 'Impossible de supprimer la demande.', 'error');
      }
    });
  };

  const handleUpload = async (booking, file) => {
    if (!file) {
      showToast('Sélectionnez d’abord un fichier PDF.', 'error');
      return;
    }
    try {
      const updated = await attachDocument(token, booking.id, file);
      if (updated && updated.id) {
        showToast('Document justificatif joint.', 'success');
        load();
      }
    } catch (err) {
      showToast(err.message || 'Impossible de joindre le document.', 'error');
    }
  };

  const handleViewDocument = async (booking) => {
    try {
      const { url, filename } = await downloadDocument(token, booking.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Document indisponible.', 'error');
    }
  };

  const handleViewSignedDocument = async (booking) => {
    try {
      const { url, filename } = await downloadSignedDocument(token, booking.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Document signé indisponible.', 'error');
    }
  };

  const userCanAct = (b) =>
    (currentUser.role === 'PROF' || currentUser.role === 'ADMIN') || b.username === currentUser.username;

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Mes demandes</h1>
        <p className="page-subtitle">
          {isClub
            ? 'Demande d’événement (salle) envoyée directement au doyen pour signature.'
            : 'Demande de salle soumise au chef de filière, puis cachet du doyen.'}
        </p>
      </header>

      <section className="card">
        <h2>Nouvelle demande de salle</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="resource">Salle / ressource</label>
            <select id="resource" name="resource" value={form.resource} onChange={handleChange} required>
              <option value="">— Choisir une salle —</option>
              {resources.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name} {r.building ? `· ${r.building}` : ''}{r.capacity ? ` · ${r.capacity} pers.` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().slice(0, 10)} required />
            </div>
            <div className="field">
              <label htmlFor="creneau">Créneau</label>
              <select id="creneau" name="creneau" value={form.creneau} onChange={handleChange}>
                {CRENEAUX.map((c) => <option value={c} key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {available !== null && (
            <p className={`availability-hint ${available ? 'ok' : 'busy'}`}>
              {available
                ? 'Cette salle est disponible sur ce créneau.'
                : 'Cette salle est déjà réservée pour ce créneau.'}
            </p>
          )}
          <div className="field">
            <label htmlFor="motif">{isClub ? 'Objet de l’événement' : 'Motif de la réservation'}</label>
            <textarea id="motif" name="motif" rows="3" value={form.motif} onChange={handleChange} placeholder={isClub ? 'Ex. Journée d’intégration, Hackathon, Conférence…' : 'Ex. Cours de Smart Systems, TP de Bases de Données…'} required />
          </div>
          <div className="form-grid">
            {!isClub && (
              <div className="field">
                <label htmlFor="filiere">Filière</label>
                <select id="filiere" name="filiere" value={form.filiere} onChange={handleChange} required>
                  <option value="">— Choisir la filière —</option>
                  {FILIERES_GROUPES.map((g) => (
                    <optgroup key={g.groupe} label={g.groupe}>
                      {g.filieres.map((f) => <option value={f} key={f}>{f}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="document">Document justificatif (PDF, optionnel)</label>
              <input id="document" ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files[0])} />
            </div>
          </div>
          <button type="submit" className="btn btn-accent btn-block" disabled={submitting || checking || available === false}>
            {submitting ? 'Envoi…' : isClub ? 'Envoyer la demande d’événement' : 'Envoyer la demande de réservation'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="card-header-row">
          <h2>Suivi de mes demandes</h2>
        </div>
        {loading && <p className="empty-state">Chargement…</p>}
        {!loading && bookings.length === 0 && (
          <p className="empty-state">
            Aucune demande pour le moment. <Link to="/ressources">Parcourez les salles</Link>.
          </p>
        )}
        {!loading && bookings.length > 0 && (
          <div className="ticket-list">
            {bookings.map((b) => (
              <div className="ticket" key={b.id}>
                <div className={`ticket-stub ${statusClass(b.status)}`} />
                <div className="ticket-body">
                  <div className="ticket-main">
                    <span className="ticket-resource">
                      {b.resource}
                      {b.bookingType === 'EVENEMENT' && (
                        <span className="role-tag" style={{ marginLeft: 8 }}>
                          Événement{b.club ? ` · ${b.club}` : ''}
                        </span>
                      )}
                    </span>
                    <span className="ticket-meta">
                      {b.date} · {b.creneau} · {b.filiere || b.club || 'Sans filière'}
                    </span>
                  </div>
                  <div className="ticket-right">
                    <span className={`badge ${statusClass(b.status)}`}>{statusLabel(b.status)}</span>
                    {(b.status === 'PENDING' || b.status === 'pending') && userCanAct(b) && (
                      <>
                        <button className="btn btn-ghost" type="button" onClick={() => startEdit(b)}>Modifier</button>
                        <button className="btn btn-danger-outline" type="button" onClick={() => handleCancel(b)}>Annuler</button>
                      </>
                    )}
                    {(b.status === 'APPROVED' || b.status === 'approved') && isClub && userCanAct(b) && (
                      <button className="btn btn-danger-outline" type="button" onClick={() => handleCancel(b)}>Annuler</button>
                    )}
                    {(b.status === 'PENDING' || b.status === 'pending' || b.status === 'APPROVED' || b.status === 'approved') && userCanAct(b) && !b.documentName && (
                      <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                        Joindre PDF
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) handleUpload(b, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="approval-meta">
                  <span><b>Demandeur :</b> {b.username}</span>
                  {b.documentName && (
                    <button className="btn btn-sm btn-primary" type="button" onClick={() => handleViewDocument(b)}>
                      Voir le document ({b.documentName})
                    </button>
                  )}
                  {b.hasSignedDocument && (
                    <button className="btn btn-sm btn-accent" type="button" onClick={() => handleViewSignedDocument(b)}>
                      Télécharger le PDF signé
                    </button>
                  )}
                </div>

                {(b.chefComment || b.doyenComment) && (
                  <div className="approval-comments">
                    {b.chefComment && (
                      <div className="approval-comment-item">
                        <span className="approval-comment-actor">Chef de filière :</span> {b.chefComment}
                      </div>
                    )}
                    {b.doyenComment && (
                      <div className="approval-comment-item">
                        <span className="approval-comment-actor">Doyen :</span> {b.doyenComment}
                      </div>
                    )}
                  </div>
                )}

                {editingId === b.id && (
                  <div className="edit-row">
                    <input type="date" value={editState.date} onChange={(e) => setEditState((s) => ({ ...s, date: e.target.value }))} />
                    <select value={editState.creneau} onChange={(e) => setEditState((s) => ({ ...s, creneau: e.target.value }))}>
                      {CRENEAUX.map((c) => <option value={c} key={c}>{c}</option>)}
                    </select>
                    <input type="text" value={editState.motif} onChange={(e) => setEditState((s) => ({ ...s, motif: e.target.value }))} placeholder="Motif" />
                    <button className="btn btn-primary btn-sm" type="button" onClick={saveEdit}>Enregistrer</button>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={cancelEdit}>Annuler</button>
                  </div>
                )}

                {b.history && b.history.length > 0 && (
                  <div className="history-list">
                    {b.history.map((h, i) => (
                      <div className="history-item" key={i}>
                        <span className={`history-dot ${historyClass(h.status)}`} />
                        <div className="history-body">
                          <div className="history-title">
                            {h.comment || h.status} {h.actor && <span>({h.actor})</span>}
                          </div>
                          {h.comment && h.comment !== h.status && (
                            <div className="history-comment">{formatDate(h.timestamp)}</div>
                          )}
                        </div>
                      </div>
                    ))}
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
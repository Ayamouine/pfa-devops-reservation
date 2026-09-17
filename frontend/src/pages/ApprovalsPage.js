import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import {
  ROLE_LABELS,
  getApprovals,
  approveBooking,
  rejectBooking,
  confirmBooking,
  downloadDocument,
  statusClass,
  statusLabel,
} from '../api';

export default function ApprovalsPage() {
  const { currentUser, role, token, showToast } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentOpen, setCommentOpen] = useState(null);
  const [comments, setComments] = useState({});
  const [busy, setBusy] = useState(null);

  const isDoyen = role === 'DOYEN';

  const load = useCallback(() => {
    getApprovals(token)
      .then((list) => setApprovals(Array.isArray(list) ? list : []))
      .catch(() => setApprovals([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const comment = (id) => comments[id] || '';

  const run = async (fn, id, successMsg) => {
    setBusy(id);
    try {
      await fn;
      showToast(successMsg, 'success');
      setCommentOpen(null);
      setComments((c) => ({ ...c, [id]: '' }));
      load();
    } catch (err) {
      showToast(err.message || 'Action impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = (b) =>
    run(approveBooking(token, b.id, comment(b.id)), b.id, 'Demande validée, envoyée au doyen.');

  const handleReject = (b) =>
    run(rejectBooking(token, b.id, comment(b.id)), b.id, 'Demande refusée.');

  const handleStamp = (b) =>
    run(confirmBooking(token, b.id, comment(b.id)), b.id, 'Cachet apposé : réservation confirmée.');

  const handleViewDocument = async (b) => {
    try {
      const { url, filename } = await downloadDocument(token, b.id);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      showToast(`Ouverture de "${filename}".`, 'success');
    } catch (err) {
      showToast(err.message || 'Document indisponible.', 'error');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">
          {isDoyen ? 'Cachet du doyen' : 'Validations chef de filière'}
        </h1>
        <p className="page-subtitle">
          {isDoyen
            ? 'Demandes validées par les chefs de filière, en attente du cachet officiel.'
            : `${ROLE_LABELS[role]} · demandes de votre filière en attente de validation.`}
        </p>
      </header>

      {loading && <p className="empty-state">Chargement…</p>}
      {!loading && approvals.length === 0 && (
        <p className="empty-state">
          {isDoyen
            ? 'Aucune demande validée en attente du cachet.'
            : 'Aucune demande en attente dans votre filière.'}
        </p>
      )}

      <div className="approval-list">
        {approvals.map((b) => (
          <div className="approval-card" key={b.id}>
            <div className="approval-header">
              <div>
                <span className="approval-title">{b.resource}</span>
                <div className="approval-subtitle">
                  #{b.id} · demandeur <b>{b.username}</b> · {b.filiere || 'Sans filière'}
                </div>
              </div>
              <span className={`badge ${statusClass(b.status)}`}>{statusLabel(b.status)}</span>
            </div>

            <div className="approval-meta">
              <span className="chip">📅 {b.date}</span>
              <span className="chip">🕐 {b.creneau}</span>
              {b.documentName && (
                <button className="btn btn-sm btn-primary" type="button" onClick={() => handleViewDocument(b)}>
                  📄 Voir le document justificatif
                </button>
              )}
            </div>

            {b.motif && (
              <div className="approval-comments">
                <div className="approval-comment-item">
                  <span className="approval-comment-actor">Motif :</span> {b.motif}
                </div>
              </div>
            )}

            {b.history && b.history.length > 0 && (
              <div className="history-list" style={{ padding: '12px 18px 0' }}>
                {b.history.map((h, i) => (
                  <div className="history-item" key={i}>
                    <span className={`history-dot ${statusClass(h.status)}`} />
                    <div className="history-body">
                      <div className="history-title">
                        {h.comment || h.status} {h.actor && <span>({h.actor})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="approval-actions">
              {!isDoyen ? (
                <>
                  <button className="btn btn-primary" type="button" onClick={() => handleApprove(b)} disabled={busy === b.id}>
                    {busy === b.id ? '…' : '✓ Valider pour le doyen'}
                  </button>
                  <button className="btn btn-danger-outline" type="button" onClick={() => setCommentOpen(commentOpen === b.id ? null : b.id)}>
                    Refuser
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary" type="button" onClick={() => handleStamp(b)} disabled={busy === b.id}>
                    {busy === b.id ? '…' : '🕮 Apposer le cachet (Confirmer)'}
                  </button>
                  <button className="btn btn-danger-outline" type="button" onClick={() => setCommentOpen(commentOpen === b.id ? null : b.id)}>
                    Refuser malgré la validation
                  </button>
                </>
              )}
            </div>

            {commentOpen === b.id && (
              <div className="approval-actions">
                <textarea
                  rows="2"
                  placeholder="Commentaire pour cette demande (optionnel)…"
                  value={comment(b.id)}
                  onChange={(e) => setComments((c) => ({ ...c, [b.id]: e.target.value }))}
                />
                <button className="btn btn-danger-outline" type="button" onClick={() => handleReject(b)}>
                  Confirmer le refus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
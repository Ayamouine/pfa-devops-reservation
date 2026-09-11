import React from 'react';

export default function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;

  const handlePrint = () => window.print();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content receipt-print" onClick={(e) => e.stopPropagation()}>
        <h2>Reçu de paiement</h2>
        <hr />
        <p><strong>N° de reçu :</strong> #{payment.id}</p>
        <p><strong>Réservation :</strong> #{payment.reservationId}</p>
        {payment.resource && <p><strong>Ressource :</strong> {payment.resource}</p>}
        <p><strong>Client :</strong> {payment.username}</p>
        <p><strong>Montant :</strong> {payment.amount} MAD</p>
        <p><strong>Statut :</strong> {payment.status}</p>
        {payment.paidAt && <p><strong>Date :</strong> {new Date(payment.paidAt).toLocaleString('fr-FR')}</p>}
        <hr />
        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Paiement simulé — plateforme de réservation PFA.</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }} className="no-print">
          <button className="btn btn-accent" onClick={handlePrint} type="button">Imprimer / Enregistrer en PDF</button>
          <button className="btn btn-ghost" onClick={onClose} type="button">Fermer</button>
        </div>
      </div>
    </div>
  );
}
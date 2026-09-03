import React from 'react';
import { useAuth } from '../AuthContext';

export default function ConfirmModal() {
  const { confirmDialog, setConfirmDialog } = useAuth();
  if (!confirmDialog) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p>{confirmDialog.message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setConfirmDialog(null)} type="button">
            Annuler
          </button>
          <button
            className="btn btn-danger-outline"
            onClick={() => {
              const action = confirmDialog.onConfirm;
              setConfirmDialog(null);
              action();
            }}
            type="button"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
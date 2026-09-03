import React from 'react';
import { useAuth } from '../AuthContext';

export default function ToastStack() {
  const { toasts } = useAuth();
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
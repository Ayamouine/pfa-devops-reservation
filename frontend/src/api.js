export const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081';
export const BOOKING_URL = process.env.REACT_APP_BOOKING_URL || 'http://localhost:8082';
export const NOTIFICATION_URL = process.env.REACT_APP_NOTIFICATION_URL || 'http://localhost:8083';
export const PAYMENT_URL = process.env.REACT_APP_PAYMENT_URL || 'http://localhost:8084';

export function authHeaders(token, extra = {}) {
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'status-confirmed';
  if (s === 'cancelled') return 'status-cancelled';
  return 'status-pending';
}

export function statusLabel(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'Confirmée';
  if (s === 'cancelled') return 'Annulée';
  return 'En attente';
}
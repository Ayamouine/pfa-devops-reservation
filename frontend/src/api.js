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

// Auth endpoints
export async function login(username, password) {
  const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Identifiants invalides');
  }
  return data;
}

export async function register(payload) {
  const res = await fetch(`${AUTH_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Inscription impossible.');
  }
  return data;
}
export async function refreshToken(refreshToken) {
  const res = await fetch(`${AUTH_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return res.json();
}

export async function forgotPassword(username) {
  const res = await fetch(`${AUTH_URL}/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return res.json();
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${AUTH_URL}/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return res;
}

export async function verifyAccount(token) {
  const res = await fetch(`${AUTH_URL}/auth/verify?token=${encodeURIComponent(token)}`);
  return res;
}

// Resources
export async function getResources() {
  const res = await fetch(`${BOOKING_URL}/resources`);
  return res.json();
}

export async function createResource(token, payload) {
  const res = await fetch(`${BOOKING_URL}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateResource(token, id, payload) {
  const res = await fetch(`${BOOKING_URL}/resources/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteResource(token, id) {
  const res = await fetch(`${BOOKING_URL}/resources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  return res;
}

// Availability and bookings
export async function checkAvailability(resource, date) {
  const url = new URL(`${BOOKING_URL}/bookings/availability`);
  url.searchParams.set('resource', resource);
  url.searchParams.set('date', date);
  const res = await fetch(url.toString());
  return res.json();
}

export async function createBooking(token, booking) {
  const res = await fetch(`${BOOKING_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(booking),
  });
  return res.json();
}

export async function confirmBooking(token, id, username, role = 'USER') {
  const res = await fetch(`${BOOKING_URL}/bookings/${id}/confirm?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
  return res.json();
}

export async function cancelBooking(token, id, username, role = 'USER') {
  const res = await fetch(`${BOOKING_URL}/bookings/${id}?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  return res;
}

// Payments
export async function pay(token, payment) {
  const res = await fetch(`${PAYMENT_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payment),
  });
  return res.json();
}

// Notifications (internal)
export async function getNotifications(token) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications`, {
    headers: { ...authHeaders(token) },
  });
  return res.json();
}
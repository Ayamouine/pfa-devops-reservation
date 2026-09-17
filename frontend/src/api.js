export const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081';
export const BOOKING_URL = process.env.REACT_APP_BOOKING_URL || 'http://localhost:8082';
export const NOTIFICATION_URL = process.env.REACT_APP_NOTIFICATION_URL || 'http://localhost:8083';
export const PAYMENT_URL = process.env.REACT_APP_PAYMENT_URL || 'http://localhost:8084';

export const ROLES = [
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'PROF', label: 'Professeur' },
  { value: 'CHEF_FILIERE', label: 'Chef de filière' },
  { value: 'DOYEN', label: 'Doyen' },
  { value: 'ADMIN', label: 'Administrateur' },
];

export const ROLE_LABELS = {
  ETUDIANT: 'Étudiant',
  PROF: 'Professeur',
  CHEF_FILIERE: 'Chef de filière',
  DOYEN: 'Doyen',
  ADMIN: 'Administrateur',
  USER: 'Utilisateur',
};

export const REGISTRATION_CODES = {
  ETUDIANT: null,
  PROF: 'pfa-prof-2026',
  CHEF_FILIERE: 'pfa-chef-2026',
  DOYEN: 'pfa-doyen-2026',
  ADMIN: 'pfa-admin-2026',
};

export const FILIERES = [
  'Informatique',
  'Mathématiques et Applications',
  'Physique et Applications',
  'Chimie',
  'Sciences et Techniques de l\'Ingénieur',
  'Biologie et Santé',
  'Génie Civil et Environnement',
  'Agroalimentaire et Qualité',
];

export function authHeaders(token, extra = {}) {
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'approuved' || s === 'approuved_by_doyen') return 'status-confirmed';
  if (s === 'rejected' || s === 'cancelled') return 'status-cancelled';
  if (s === 'approved') return 'status-approved';
  if (s === 'pending') return 'status-pending';
  return 'status-pending';
}

export function statusLabel(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'Confirmée (Doyen)';
  if (s === 'approved') return 'Validée (Chef de filière)';
  if (s === 'rejected') return 'Refusée';
  if (s === 'cancelled') return 'Annulée';
  return 'En attente';
}

export async function parseError(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Erreur ${res.status}`);
  }
  return data;
}

// ---------------- AUTH ----------------
export async function login(username, password) {
  const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseError(res);
  return data;
}

export async function register(payload) {
  const res = await fetch(`${AUTH_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseError(res);
  return data;
}

export async function refreshToken(refreshToken) {
  const res = await fetch(`${AUTH_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseError(res);
  return data;
}

export async function forgotPassword(username) {
  const res = await fetch(`${AUTH_URL}/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const data = await parseError(res);
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${AUTH_URL}/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return parseError(res);
}

export async function verifyAccount(token) {
  const res = await fetch(`${AUTH_URL}/auth/verify?token=${encodeURIComponent(token)}`);
  return parseError(res);
}

export async function updateProfile(token, username, payload) {
  const res = await fetch(`${AUTH_URL}/auth/profile?username=${encodeURIComponent(username)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return parseError(res);
}

// Admin users
export async function getUsers(token) {
  const res = await fetch(`${AUTH_URL}/auth/users`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function updateUserRole(token, id, role) {
  const res = await fetch(`${AUTH_URL}/auth/users/${id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ role }),
  });
  return parseError(res);
}

export async function updateUserFiliere(token, id, filiere) {
  const res = await fetch(`${AUTH_URL}/auth/users/${id}/filiere`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ filiere }),
  });
  return parseError(res);
}

export async function deleteUser(token, id) {
  const res = await fetch(`${AUTH_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseError(res);
}

// ---------------- RESOURCES ----------------
export async function getResources(token) {
  const res = await fetch(`${BOOKING_URL}/resources`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function getResource(token, id) {
  const list = await getResources(token);
  return list.find((r) => String(r.id) === String(id)) || null;
}

export async function createResource(token, payload) {
  const res = await fetch(`${BOOKING_URL}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return parseError(res);
}

export async function updateResource(token, id, payload) {
  const res = await fetch(`${BOOKING_URL}/resources/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  return parseError(res);
}

export async function deleteResource(token, id) {
  const res = await fetch(`${BOOKING_URL}/resources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseError(res);
}

// ---------------- BOOKINGS ----------------
export async function checkAvailability(resource, date, token, creneau) {
  const url = new URL(`${BOOKING_URL}/bookings/availability`);
  url.searchParams.set('resource', resource);
  url.searchParams.set('date', date);
  if (creneau) url.searchParams.set('creneau', creneau);
  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  return parseError(res);
}

export async function createBooking(token, booking) {
  const res = await fetch(`${BOOKING_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(booking),
  });
  return parseError(res);
}

export async function getMyBookings(token, username) {
  const res = await fetch(`${BOOKING_URL}/bookings/mine?username=${encodeURIComponent(username)}`, {
    headers: authHeaders(token),
  });
  return parseError(res);
}

export async function getAllBookings(token) {
  const res = await fetch(`${BOOKING_URL}/bookings`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function getApprovals(token) {
  const res = await fetch(`${BOOKING_URL}/bookings/approvals`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function getBooking(token, id) {
  const res = await fetch(`${BOOKING_URL}/bookings/${encodeURIComponent(id)}`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function approveBooking(token, id, comment) {
  const url = new URL(`${BOOKING_URL}/bookings/${id}/approve`);
  if (comment) url.searchParams.set('comment', comment);
  const res = await fetch(url.toString(), { method: 'POST', headers: authHeaders(token) });
  return parseError(res);
}

export async function rejectBooking(token, id, comment) {
  const url = new URL(`${BOOKING_URL}/bookings/${id}/reject`);
  if (comment) url.searchParams.set('comment', comment);
  const res = await fetch(url.toString(), { method: 'POST', headers: authHeaders(token) });
  return parseError(res);
}

export async function confirmBooking(token, id, comment) {
  const url = new URL(`${BOOKING_URL}/bookings/${id}/confirm`);
  if (comment) url.searchParams.set('comment', comment);
  const res = await fetch(url.toString(), { method: 'POST', headers: authHeaders(token) });
  return parseError(res);
}

export async function updateBooking(token, id, booking) {
  const res = await fetch(`${BOOKING_URL}/bookings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(booking),
  });
  return parseError(res);
}

export async function cancelBooking(token, id, username, role = 'USER') {
  const res = await fetch(`${BOOKING_URL}/bookings/${encodeURIComponent(id)}?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Annulation impossible');
  }
  return res;
}

export async function attachDocument(token, id, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BOOKING_URL}/bookings/${id}/document`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  return parseError(res);
}

export async function downloadDocument(token, id) {
  const res = await fetch(`${BOOKING_URL}/bookings/${id}/document`, { headers: authHeaders(token) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Document indisponible');
  }
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const filename = match ? match[1] : 'document.pdf';
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return { url, filename };
}

// ---------------- NOTIFICATIONS ----------------
export async function getNotifications(token) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function getMyNotifications(token) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications/my`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function getNotificationsForUser(token, username) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications/user/${encodeURIComponent(username)}`, {
    headers: authHeaders(token),
  });
  return parseError(res);
}

export async function unreadCount(token) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications/unread-count`, { headers: authHeaders(token) });
  return parseError(res);
}

export async function markRead(token, id) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return parseError(res);
}

export async function markAllRead(token) {
  const res = await fetch(`${NOTIFICATION_URL}/notifications/read-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({}),
  });
  return parseError(res);
}

// ---------------- PAYMENTS ----------------
export async function pay(token, payment) {
  const res = await fetch(`${PAYMENT_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payment),
  });
  return parseError(res);
}
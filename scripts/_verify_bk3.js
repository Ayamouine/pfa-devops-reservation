const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const s = fs.readFileSync(f, 'utf8');
const lines = s.split('\r\n').length === 1 ? s.split('\n') : s.split('\r\n');
const open = (s.match(/{/g) || []).length;
const close = (s.match(/}/g) || []).length;
console.log('LIGNES=' + lines.length + ' braces{' + open + '}=' + close + (open === close ? ' OK' : ' BAD'));
const checks = [
  'boolean estEvenement = "EVENEMENT".equalsIgnoreCase(entity.getBookingType());',
  'Demande #" + savedEvent.getId() + " validée par le chef de filière',
  'BOOKING_APPROVAL_PENDING", "/validations');',
  'salle a été validée et confirmée par le chef de filière',
  'processSimulatedPayment(saved.getId(), saved.getUsername(), montant)'
];
for (const c of checks) {
  let t = s.includes(c) ? 'OK' : 'FAIL';
  console.log('[' + t + '] ' + c);
}
const idx = s.indexOf('public Booking approveBooking');
const chunk = s.substr(idx > 0 ? idx : 0, 2600);
console.log('=== approveBooking début ===');
console.log(chunk.replace(/^\s*$/gm, '(vide)'));

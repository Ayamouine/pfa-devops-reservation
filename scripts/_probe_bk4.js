const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const s = fs.readFileSync(f, 'utf8');
console.log('LIGNES=' + s.split('\n').length);
const map = {
  'workflow EVENEMENT->doyen direct (create)': 'boolean isEvent',
  'EVENEMENT statut APPROVED a la creation': '? initialStatus',
  'create notifie le doyen (cachet)': 'ROLE:DOYEN',
  'confirmBooking demande role doyen': 'ROLE:DOYEN',
  'cachet final / pdf invoque': 'PdfGenerator',
  'paiement sur confirmation doyen': 'processSimulatedPayment',
  'STATUS_CONFIRMED utilise': 'STATUS_CONFIRMED',
};
for (const k in map) console.log(k + ' : ' + (s.indexOf(map[k]) >= 0 ? 'PRESENT' : 'abs?marqueur=' + map[k]));

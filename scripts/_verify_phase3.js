const fs = require('fs');
const exec = require('child_process').execFileSync;
const F = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';

let s;
try {
  s = fs.readFileSync(F, 'utf8');
  console.log('READ_OK lignes=' + s.split('\n').length);
} catch (e) {
  console.log('READ_ERR=' + e.code);
  process.exit(2);
}

const open = (s.match(/{/g) || []).length;
const close = (s.match(/}/g) || []).length;
console.log('accolades {' + open + ' }=' + close + (open === close ? ' OK' : ' DESEQUILIBRE'));

const markers = [
  'toute demande qui n\'appartient pas à votre filière',
  'Demande #" + finalise.getId() + " confirmée définitivement (cachet final du doyen)',
  'autorisée par le doyen',
  'est maintenant confirmée (cachet et signature du doyen)',
  'confirmedEvent.setUpdatedAt(LocalDateTime.now())',
  'confirmedEvent.addHistory("CONFIRMED", actor, actorRoleFigure)',
  'resolvePrice(saved.getResource())',
  'processSimulatedPayment(finalise.getId(), finalise.getUsername(), montant)',
  'salle a été validée et confirmée par le chef de filière (pas de passage au doyen)',
  '"SALLE_CONFIRMED", "/validations")'
];
for (const m of markers) {
  console.log((s.includes(m) ? '[OK] ' : '[  ] ') + m);
}

const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
const a = Math.max(0, 163 - 1);
const b = Math.min(lines.length, 225);
for (let i = a; i < b; i++) {
  const t = lines[i];
  if (t.trim().length === 0) { console.log('L' + (i + 1) + ':(vide)'); continue; }
  console.log('L' + (i + 1) + ': ' + t);
}

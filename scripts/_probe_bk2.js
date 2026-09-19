const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');
function show(min, max) {
  console.log('--- lignes ' + min + '-' + max + ' ---');
  for (let i = min; i <= max && i <= lines.length; i++) {
    const t = lines[i - 1];
    if (t.trim().length > 0) console.log('L' + i + ': ' + t);
  }
  console.log('');
}
show(158, 205);

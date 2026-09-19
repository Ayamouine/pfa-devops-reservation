const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const ranges = [[112, 155], [160, 270]];
for (const [a, b] of ranges) {
  console.log('--- lignes ' + a + '-' + b + ' ---');
  for (let i = a; i <= b && i <= lines.length; i++) {
    const t = lines[i - 1].trim();
    if (t.length > 0) console.log('L' + i + ': ' + t);
  }
  console.log('');
}

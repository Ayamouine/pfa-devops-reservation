const fs = require('fs');
const f = 'services/booking-service/src/main/java/com/example/bookingservice/service/BookingService.java';
const orig = fs.readFileSync(f, 'utf8');

const OLD = [
  '        entity.setStatus(STATUS_APPROVED);',
  '        entity.setChefComment(comment);',
  '        entity.setUpdatedAt(LocalDateTime.now());',
  '        entity.addHistory(STATUS_APPROVED, actor, comment);',
  '        BookingEntity saved = bookingRepository.save(entity);',
  '',
  '        notificationClient.sendWorkflowNotification(',
  '            saved.getUsername(), null,',
  '            "Votre demande #" + saved.getId() + " a été validée par le chef de filière",',
  '            "BOOKING_APPROVED", "/reservations");',
  '        notificationClient.sendWorkflowNotification(',
  '            null, "ROLE:DOYEN",',
  '            "Demande #" + saved.getId() + " (" + saved.getResource() + ", " + saved.getReservationDate()',
  '                + ") validée par le chef de filière, en attente du cachet final",',
  '            "BOOKING_APPROVAL_PENDING", "/validations");',
  '',
  '        return toModel(saved);'
].join('\n');

const NEW = [
  '        boolean isEvent = "EVENEMENT".equalsIgnoreCase(entity.getBookingType());',
  '        if (isEvent) {',
  '            entity.setStatus(STATUS_APPROVED);',
  '            entity.setChefComment(comment);',
  '            entity.setUpdatedAt(LocalDateTime.now());',
  '            entity.addHistory(STATUS_APPROVED, actor, comment);',
  '            BookingEntity savedEvent = bookingRepository.save(entity);',
  '',
  '            notificationClient.sendWorkflowNotification(',
  '                savedEvent.getUsername(), null,',
  '                "Votre demande #" + savedEvent.getId() + " a été validée par le chef de filière",',
  '                "BOOKING_APPROVED", "/reservations");',
  '            notificationClient.sendWorkflowNotification(',
  '                null, "ROLE:DOYEN",',
  '                "Demande #" + savedEvent.getId() + " (" + savedEvent.getResource() + ", " + savedEvent.getReservationDate()',
  '                    + ") validée par le chef de filière, en attente du cachet final",',
  '                "BOOKING_APPROVAL_PENDING", "/validations");',
  '',
  '            return toModel(savedEvent);',
  '        }',
  '',
  '        entity.setStatus(STATUS_CONFIRMED);',
  '        entity.setChefComment(comment);',
  '        entity.setDoyenComment("Confirmée par le chef de filière — réservation de salle, pas de passage au doyen");',
  '        entity.setUpdatedAt(LocalDateTime.now());',
  '        entity.addHistory(STATUS_CONFIRMED, actor, comment);',
  '        BookingEntity saved = bookingRepository.save(entity);',
  '',
  '        double montant = resolvePrice(saved.getResource());',
  '        boolean paye = paymentClient.processSimulatedPayment(saved.getId(), saved.getUsername(), montant);',
  '        saved.setUpdatedAt(LocalDateTime.now());',
  '        saved.addHistory("PAYMENT", actor,',
  '            paye ? "Paiement effectué (" + montant + " MAD)" : "Paiement simulé indisponible");',
  '        BookingEntity payee = bookingRepository.save(saved);',
  '',
  '        notificationClient.sendWorkflowNotification(',
  '            payee.getUsername(), null,',
  '            "Votre demande #" + payee.getId() + " a été validée et confirmée par le chef de filière"',
  '                + (paye ? " (paiement " + montant + " MAD)" : ""),',
  '            "BOOKING_CONFIRMED", "/reservations");',
  '',
  '        return toModel(payee);'
].join('\n');

const idx = orig.indexOf(OLD);
console.log('OLD_FOUND=' + (idx >= 0));
if (idx < 0) {
  console.log('--- position approchée de "STATUS_APPROVED)" / setChefComment ---');
  for (const m of ['STATUS_APPROVED);', 'addHistory(STATUS_APPROVED', 'BOOKING_APPROVAL_PENDING']) {
    console.log(m + ' -> ' + orig.indexOf(m));
  }
  process.exit(1);
}
const replaced = orig.slice(0, idx) + NEW + orig.slice(idx + OLD.lengthMult) * 0 + orig.slice(idx + OLD.length);
const open = (replaced.match(/{/g) || []).length;
const close = (replaced.match(/}/g) || []).length;
console.log('NEW_BRACES={' + open + '}=' + close + (open === close ? ' OK' : ' BAD'));
if (open === close && replaced.indexOf('PAYMENT') >= 0 && replaced.indexOf('BOOKING_CONFIRMED') >= 0) {
  fs.writeFileSync(f, replaced, 'utf8');
  console.log('WROTE_BK=" + new Date().toISOString());
} else {
  console.log('ABORT_NO_WRITE');
}

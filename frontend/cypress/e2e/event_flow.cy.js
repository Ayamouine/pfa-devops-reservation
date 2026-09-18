describe('Flux evenement club -> signature doyen -> PDF signe', () => {
  const authUrl = Cypress.env('AUTH_URL') || 'http://localhost:8081';
  const bookingUrl = Cypress.env('BOOKING_URL') || 'http://localhost:8082';

  const stamp = Date.now();
  const resourceName = 'Amphi Central';
  const eventDay = () => {
    const d = new Date();
    d.setDate(d.getDate() + 200 + (stamp % 300));
    return d.toISOString().slice(0, 10);
  };

  const login = (username, password) =>
    cy.request('POST', `${authUrl}/auth/login`, { username, password }).its('body.token');

  it('cree un evenement au nom du club, le doyen signe et le PDF est telechargeable', () => {
    let bookingId;
    let clubToken;

    login('club.clic', 'club123').then((token) => {
      clubToken = token;
      cy.request({
        method: 'POST',
        url: `${bookingUrl}/bookings`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          resource: resourceName,
          date: eventDay(),
          creneau: '16:00-18:00',
          username: 'club.clic',
          bookingType: 'EVENEMENT',
          club: 'CLIC',
          motif: 'Hackathon CLIC (E2E)',
        },
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        expect(res.body.status).to.eq('APPROVED');
        expect(res.body.bookingType).to.eq('EVENEMENT');
        expect(res.body.club).to.eq('CLIC');
        expect(res.body.hasSignedDocument).to.not.eq(true);
        bookingId = res.body.id;
      });
    });

    cy.then(() => {
      login('doyen', 'doyen123').then((doyenToken) => {
        cy.request({
          method: 'GET',
          url: `${bookingUrl}/bookings/approvals`,
          headers: { Authorization: `Bearer ${doyenToken}` },
        }).then((res) => {
          const mine = (res.body || []).find((b) => String(b.id) === String(bookingId));
          expect(mine, 'l evenement doit apparaitre chez le doyen').to.exist;

          cy.request({
            method: 'POST',
            url: `${bookingUrl}/bookings/${bookingId}/confirm?comment=Signature%20E2E`,
            headers: { Authorization: `Bearer ${doyenToken}` },
          }).then((confirmed) => {
            expect(confirmed.status).to.eq(200);
            expect(confirmed.body.status).to.eq('CONFIRMED');
            expect(confirmed.body.hasSignedDocument).to.eq(true);
            expect(confirmed.body.signedDocumentName).to.contain('autorisation-evenement');
          });
        });
      });
    });

    cy.then(() => {
      cy.request({
        method: 'GET',
        url: `${bookingUrl}/bookings/${bookingId}/signed-document`,
        headers: { Authorization: `Bearer ${clubToken}` },
        encoding: 'binary',
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.headers['content-type']).to.contain('application/pdf');
        expect(String(res.body).slice(0, 5)).to.eq('%PDF-');
      });
    });
  });
});

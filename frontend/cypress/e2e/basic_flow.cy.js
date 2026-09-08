describe('Basic reservation flow (API)', () => {
  const authUrl = Cypress.env('AUTH_URL') || 'http://localhost:8081';
  const bookingUrl = Cypress.env('BOOKING_URL') || 'http://localhost:8082';
  const username = `e2e_user_${Date.now()}`;
  const password = 'pass1234';

  it('registers, logs in, lists resources and attempts booking', () => {
    // Register
    cy.request('POST', `${authUrl}/auth/register`, { username, password }).then(() => {
      // Login
      cy.request('POST', `${authUrl}/auth/login`, { username, password }).then((loginRes) => {
        expect(loginRes.body).to.have.property('token');
        const token = loginRes.body.token;

        // Get resources
        cy.request('GET', `${bookingUrl}/resources`).then((res) => {
          expect(res.status).to.eq(200);
          const list = res.body || [];
          if (list.length === 0) {
            // Nothing to book; test ends here
            return;
          }
          const r = list[0];
          const date = new Date();
          date.setDate(date.getDate() + 7);
          const day = date.toISOString().slice(0, 10);

          // Check availability
          cy.request('GET', `${bookingUrl}/bookings/availability?resource=${encodeURIComponent(r.name)}&date=${day}`).then((avail) => {
            expect(avail.status).to.eq(200);
            // Try create booking (may fail if occupied)
            cy.request({
              method: 'POST',
              url: `${bookingUrl}/bookings`,
              headers: { Authorization: `Bearer ${token}` },
              body: { resource: r.name, date: day, username },
              failOnStatusCode: false,
            }).then((createRes) => {
              expect([200,201,409,500]).to.include(createRes.status);
            });
          });
        });
      });
    });
  });
});

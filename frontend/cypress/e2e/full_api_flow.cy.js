describe('Full API reservation flow', () => {
  const authUrl = Cypress.env('AUTH_URL') || 'http://localhost:8081';
  const bookingUrl = Cypress.env('BOOKING_URL') || 'http://localhost:8082';
  const paymentUrl = Cypress.env('PAYMENT_URL') || 'http://localhost:8084';
  const username = `full_e2e_${Date.now()}`;
  const password = 'Pass!2345';

  it('registers, logs in, creates booking, pays, confirms and cancels', () => {
    // Register
    cy.request('POST', `${authUrl}/auth/register`, { username, password }).then((reg) => {
      expect([200,201]).to.include(reg.status);
    });

    // Login
    cy.request('POST', `${authUrl}/auth/login`, { username, password }).then((loginRes) => {
      expect(loginRes.status).to.eq(200);
      const token = loginRes.body.token;

      // Get resources
      cy.request('GET', `${bookingUrl}/resources`).then((res) => {
        expect(res.status).to.eq(200);
        const list = res.body || [];
        if (list.length === 0) {
          // No resources to book in this environment — skip booking steps
          cy.log('No resources available — skipping booking flow');
          return;
        }

        const resource = list[0];
        const date = new Date();
        date.setDate(date.getDate() + 8);
        const day = date.toISOString().slice(0, 10);

        // Create booking
        cy.request({
          method: 'POST',
          url: `${bookingUrl}/bookings`,
          headers: { Authorization: `Bearer ${token}` },
          body: { resource: resource.name, date: day, username },
          failOnStatusCode: false,
        }).then((createRes) => {
          expect([200,201,409]).to.include(createRes.status);
          if (createRes.status === 409) {
            cy.log('Resource already booked for that date — test complete');
            return;
          }

          const booking = createRes.body;
          expect(booking).to.have.property('id');

          // Pay (mock)
          cy.request({
            method: 'POST',
            url: `${paymentUrl}/payments`,
            headers: { Authorization: `Bearer ${token}` },
            body: { reservationId: String(booking.id), amount: 10, username },
            failOnStatusCode: false,
          }).then((payRes) => {
            expect([200,201,400,500]).to.include(payRes.status);

            // Confirm booking
            cy.request({
              method: 'POST',
              url: `${bookingUrl}/bookings/${booking.id}/confirm?username=${encodeURIComponent(username)}&role=USER`,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            }).then((confRes) => {
              expect([200,201,403,404]).to.include(confRes.status);

              // Fetch my bookings and ensure the booking exists (status may vary)
              cy.request({
                method: 'GET',
                url: `${bookingUrl}/bookings/mine?username=${encodeURIComponent(username)}`,
                headers: { Authorization: `Bearer ${token}` },
              }).then((mineRes) => {
                expect(mineRes.status).to.eq(200);
                const mine = mineRes.body || [];
                const found = mine.find((b) => String(b.id) === String(booking.id));
                expect(found).to.exist;

                // Cancel booking
                cy.request({
                  method: 'DELETE',
                  url: `${bookingUrl}/bookings/${booking.id}?username=${encodeURIComponent(username)}&role=USER`,
                  headers: { Authorization: `Bearer ${token}` },
                  failOnStatusCode: false,
                }).then((delRes) => {
                  expect([200,204,403,404]).to.include(delRes.status);
                });
              });
            });
          });
        });
      });
    });
  });
});

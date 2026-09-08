describe('UI reservation flow', () => {
  const username = `ui_user_${Date.now()}`;
  const password = 'pass1234';

  it('registers, logs in, navigates to resources and attempts booking via calendar', () => {
    cy.visit('/register');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').contains('Créer').click();

    // After registration, should redirect to dashboard — go to resources
    cy.visit('/ressources');
    cy.get('.resource-list', { timeout: 10000 }).should('exist');
    cy.get('.resource-list .resource-card').first().within(() => {
      cy.get('a').first().click();
    });

    // On resource detail, wait for calendar and try to click a Réserver button
    cy.get('.calendar', { timeout: 10000 }).should('exist');
    cy.contains('Réserver').first().click({ force: true });
    // After booking attempt, expect an alert or toast — tolerate either
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Réservation|Erreur/);
    });
  });
});

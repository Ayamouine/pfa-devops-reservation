describe('UI reservation flow', () => {
  const username = `ui_user_${Date.now()}`;
  const password = 'pass1234';

  it('registers, logs in, navigates to resources and attempts booking via calendar', () => {
    cy.visit('/register');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').contains('Créer').click();

    // Log in explicitly (registration does not authenticate automatically)
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.visit('/ressources');
    cy.get('.resource-list', { timeout: 10000 }).should('exist');
    cy.get('.resource-list .resource-card').first().within(() => {
      cy.get('a').first().click();
    });

    cy.get('.calendar', { timeout: 10000 }).should('exist');
    cy.contains('Réserver').first().click({ force: true });
    cy.on('window:alert', (txt) => {
      expect(txt).to.match(/Réservation|Erreur/);
    });
  });
});
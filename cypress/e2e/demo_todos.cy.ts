describe('Demo Todos', () => {
  beforeEach(() => {
    // Seed the database
    // cy.request('POST', '/api/auth/seed');
    cy.visit('/login');
    
    // Login
    cy.get('input[name="email"]').type('user@todo.dev');
    cy.get('input[name="password"]').type('ChangeMe123!');
    cy.get('button[type="submit"]').click();
  });

  it('should display demo todos with correct statuses', () => {
    // Verify Dashboard
    cy.url().should('include', '/');
    cy.contains('Welcome, Demo User');

    // Check for Demo Todos
    cy.contains('Demo Backlog').scrollIntoView().should('be.visible');
    cy.contains('Demo Pending').scrollIntoView().should('be.visible');
    cy.contains('Demo In Progress').scrollIntoView().should('be.visible');
    cy.contains('Demo Completed').scrollIntoView().should('be.visible');
  });
});

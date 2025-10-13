describe('Navigation Test', () => {
    it('should navigate to the tags page', () => {
      cy.visit('https://www.avonture.be');

      cy.contains('a', 'Tags').click();

      cy.url().should('include', '/tags');

      cy.get('h1').should('contain', 'Tags');
    });
});

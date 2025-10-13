describe('Testing my blog', () => {
    it('Check my last name is somewhere', () => {
      cy.visit('https://www.avonture.be')
      cy.contains('Christophe Avonture')
    })
})

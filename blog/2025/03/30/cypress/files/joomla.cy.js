describe("Joomla Test", () => {
  it("use tags and display Joomla posts", () => {
    cy.visit("https://www.avonture.be");

    // Find the "TAGS" link and click it. Adjust the selector if needed.
    cy.contains("a", "Tags").click();

    // Assert that the URL includes '/tags'.
    // cspell:disable-next-line
    cy.contains("a", "jomla").click();
  });
});

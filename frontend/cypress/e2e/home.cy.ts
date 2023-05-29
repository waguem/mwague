describe("Visit Some basic pages", () => {
  it("visit home page", () => {
    cy.visit("/");
  });
  it("visit login page", () => {
    cy.visit("/auth/login");
  });
  it("visit register", () => {
    cy.visit("/auth/register");
  });
});

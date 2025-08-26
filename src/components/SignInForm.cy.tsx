import React from "react";
import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignInForm from "./SignInForm";
import { authMachine } from "../machines/authMachine";

describe("SignInForm", () => {
  let authService;
  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();

    expect(authService.state.value).to.equal("unauthorized");
    cy.intercept("POST", "http://localhost:3001/login", {
      user: {
        id: "t45AiwidW",
        uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
        firstName: "Edgar",
        lastName: "Johns",
        username: "Katharina_Bernier",
        password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
        email: "Norene39@yahoo.com",
        phoneNumber: "625-316-9882",
        avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
        defaultPrivacyLevel: "public",
        balance: 168137,
        createdAt: "2019-08-27T23:47:05.637Z",
        modifiedAt: "2020-05-21T11:02:22.857Z",
      },
    }).as("loginPost");
  });

  it("submits the username and password to the backend", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test*=signin-username]").type("Katharina_Bernier");
    cy.get("[data-test*=signin-password]").type("s3cret");
    cy.get("[data-test*=signin-submit]").click();

    cy.wait("@loginPost");

    cy.get("[data-test*=signin-error]").should("not.exist");
  });

  describe("Form Validation Tests", () => {
    beforeEach(() => {
      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );
    });

    it("shows validation error for empty username field", () => {
      cy.get("[data-test*=signin-username] input").focus();
      cy.get("[data-test*=signin-username] input").blur();
      cy.get("[data-test*=signin-username] input").should("have.attr", "aria-invalid", "true");
      cy.contains("Username is required").should("be.visible");
    });

    it("shows validation error for password shorter than 4 characters", () => {
      cy.get("[data-test*=signin-password] input").type("123");
      cy.get("[data-test*=signin-password] input").blur();
      cy.get("[data-test*=signin-password] input").should("have.attr", "aria-invalid", "true");
      cy.contains("Password must contain at least 4 characters").should("be.visible");
    });

    it("clears validation errors when fields become valid", () => {
      cy.get("[data-test*=signin-username] input").focus();
      cy.get("[data-test*=signin-username] input").blur();
      cy.contains("Username is required").should("be.visible");

      cy.get("[data-test*=signin-username] input").type("validuser");
      cy.contains("Username is required").should("not.exist");
      cy.get("[data-test*=signin-username] input").should("not.have.attr", "aria-invalid", "true");
    });
  });

  describe("Authentication Error Handling", () => {
    it("displays authentication error message when login fails", () => {
      authService.state.context.message = "Invalid credentials";

      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );

      cy.get("[data-test*=signin-error]").should("be.visible");
      cy.get("[data-test*=signin-error]").should("contain", "Invalid credentials");
    });

    it("hides error message when no authentication error exists", () => {
      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );

      cy.get("[data-test*=signin-error]").should("not.exist");
    });
  });

  describe("Remember Me Checkbox Functionality", () => {
    beforeEach(() => {
      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );
    });

    it("can toggle the remember me checkbox", () => {
      cy.get("[data-test*=signin-remember-me] input").should("not.be.checked");

      cy.get("[data-test*=signin-remember-me] input").check();
      cy.get("[data-test*=signin-remember-me] input").should("be.checked");

      cy.get("[data-test*=signin-remember-me] input").uncheck();
      cy.get("[data-test*=signin-remember-me] input").should("not.be.checked");
    });

    it("maintains checkbox state during form interaction", () => {
      cy.get("[data-test*=signin-remember-me] input").check();
      cy.get("[data-test*=signin-remember-me] input").should("be.checked");

      cy.get("[data-test*=signin-username] input").type("testuser");
      cy.get("[data-test*=signin-password] input").type("testpass");

      cy.get("[data-test*=signin-remember-me] input").should("be.checked");
    });
  });

  describe("Form Submission Disabled States", () => {
    beforeEach(() => {
      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );
    });

    it("disables submit button when form is invalid (empty fields)", () => {
      cy.get("[data-test*=signin-username] input").focus();
      cy.get("[data-test*=signin-username] input").blur();
      cy.get("[data-test*=signin-submit]").should("be.disabled");
    });

    it("disables submit button when only username is filled", () => {
      cy.get("[data-test*=signin-username] input").type("testuser");
      cy.get("[data-test*=signin-submit]").should("be.disabled");
    });

    it("disables submit button when only password is filled", () => {
      cy.get("[data-test*=signin-password] input").type("testpass");
      cy.get("[data-test*=signin-submit]").should("be.disabled");
    });

    it("disables submit button when password is too short", () => {
      cy.get("[data-test*=signin-username] input").type("testuser");
      cy.get("[data-test*=signin-password] input").type("123");
      cy.get("[data-test*=signin-submit]").should("be.disabled");
    });

    it("enables submit button when form is valid", () => {
      cy.get("[data-test*=signin-username] input").type("testuser");
      cy.get("[data-test*=signin-password] input").type("validpass");
      cy.get("[data-test*=signin-submit]").should("not.be.disabled");
    });

    it("shows submit button as enabled when form is valid", () => {
      cy.get("[data-test*=signin-username] input").type("testuser");
      cy.get("[data-test*=signin-password] input").type("validpass");
      cy.get("[data-test*=signin-submit]").should("not.be.disabled");
      cy.get("[data-test*=signin-submit]").should("contain", "Sign In");
    });
  });

  describe("Field-level Validation Feedback", () => {
    beforeEach(() => {
      cy.mount(
        <MemoryRouter>
          <SignInForm authService={authService} />
        </MemoryRouter>
      );
    });

    it("shows error styling on username field when invalid", () => {
      cy.get("[data-test*=signin-username] input").focus();
      cy.get("[data-test*=signin-username] input").blur();
      cy.get("[data-test*=signin-username] input").should("have.attr", "aria-invalid", "true");
      cy.get("[data-test*=signin-username] .MuiFormLabel-root").should("have.class", "Mui-error");
    });

    it("shows error styling on password field when invalid", () => {
      cy.get("[data-test*=signin-password] input").type("123");
      cy.get("[data-test*=signin-password] input").blur();
      cy.get("[data-test*=signin-password] input").should("have.attr", "aria-invalid", "true");
      cy.get("[data-test*=signin-password] .MuiFormLabel-root").should("have.class", "Mui-error");
    });

    it("removes error styling when fields become valid", () => {
      cy.get("[data-test*=signin-username] input").focus();
      cy.get("[data-test*=signin-username] input").blur();
      cy.get("[data-test*=signin-username] input").should("have.attr", "aria-invalid", "true");

      cy.get("[data-test*=signin-username] input").type("validuser");
      cy.get("[data-test*=signin-username] input").should("not.have.attr", "aria-invalid", "true");
      cy.get("[data-test*=signin-username] .MuiFormLabel-root").should(
        "not.have.class",
        "Mui-error"
      );
    });

    it("shows validation feedback immediately when typing invalid input", () => {
      cy.get("[data-test*=signin-password] input").type("12");
      cy.get("[data-test*=signin-password] input").blur();
      cy.contains("Password must contain at least 4 characters").should("be.visible");

      cy.get("[data-test*=signin-password] input").type("34");
      cy.contains("Password must contain at least 4 characters").should("not.exist");
    });

    it("does not show validation errors on initial load", () => {
      cy.get("[data-test*=signin-username] input").should("not.have.attr", "aria-invalid", "true");
      cy.get("[data-test*=signin-password] input").should("not.have.attr", "aria-invalid", "true");
      cy.contains("Username is required").should("not.exist");
      cy.contains("Enter your password").should("not.exist");
    });
  });
});

import React from "react";
import {
  render,
  waitFor,
  screen,
  fireEvent,
} from "@app/test-config/test-utils";

import "@testing-library/jest-dom";
import { server } from "@mocks/server";
import { rest } from "msw";

import { IdentityForm } from "..";

describe("Component: identity-form", () => {
  beforeEach(() =>
    server.use(
      rest.get("http://localhost/hub/identities", (_req, res, ctx) => {
        return res(ctx.json([]));
      })
    )
  );

  const mockChangeValue = jest.fn();

  it("Display form on initial load", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);
    const identityNameInput = await screen.findByLabelText("Name *");
    expect(identityNameInput).toBeInTheDocument();

    const descriptionInput = await screen.findByLabelText("Description");
    expect(descriptionInput).toBeInTheDocument();

    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );
    expect(typeSelector).toBeInTheDocument();
  });

  it("Check dynamic form rendering - Source Control", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);
    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );
    fireEvent.click(typeSelector);

    const sourceControlOption = await screen.findByText("Source Control");
    fireEvent.click(sourceControlOption);

    const userCredentialsSelector = await screen.findByLabelText(
      "User credentials select dropdown toggle"
    );
    expect(userCredentialsSelector).toBeInTheDocument();

    // Check User credentials Username/Password
    fireEvent.click(userCredentialsSelector);
    const userPassOption = await screen.findByText("Username/Password");
    fireEvent.click(userPassOption);

    const userInput = await screen.findByLabelText("Username *");
    expect(userInput).toBeInTheDocument();

    const passwordInput = await screen.findByLabelText("Password *");
    expect(passwordInput).toBeInTheDocument();

    // Check User credentials Source Private Key/Passphrase
    fireEvent.click(userCredentialsSelector);
    const sourceOption = await screen.findByText(
      "Source Private Key/Passphrase"
    );
    fireEvent.click(sourceOption);

    const credentialKeyFileUpload = await screen.findByLabelText(
      "Upload your [SCM Private Key] file or paste its contents below. *"
    );
    expect(credentialKeyFileUpload).toBeInTheDocument();

    const credentialKeyPassphrase = await screen.findByLabelText(
      "Private Key Passphrase"
    );
    expect(credentialKeyPassphrase).toBeInTheDocument();
  });

  it("Check dynamic form rendering - Maven Settings File", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);
    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );
    fireEvent.click(typeSelector);

    const mavenSettingsOption = await screen.findByText("Maven Settings File");
    fireEvent.click(mavenSettingsOption);

    const mavenSettingsUpload = await screen.findByLabelText(
      "Upload your Settings file or paste its contents below. *"
    );
    expect(mavenSettingsUpload).toBeInTheDocument();
  });

  it("Check dynamic form rendering - Proxy", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);
    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );
    fireEvent.click(typeSelector);

    const proxyOption = await screen.findByText("Proxy");

    fireEvent.click(proxyOption);

    const proxyUserInput = await screen.findByLabelText("Username *");
    expect(proxyUserInput).toBeInTheDocument();

    const proxyPasswordInput = await screen.findByLabelText("Password");
    expect(proxyPasswordInput).toBeInTheDocument();
  });

  it("Identity form validation test - Source Control / username/password", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);

    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );
    fireEvent.click(typeSelector);

    const sourceControlOption = await screen.findByText("Source Control");
    fireEvent.click(sourceControlOption);

    const userCredentialsSelector = await screen.findByLabelText(
      "User credentials select dropdown toggle"
    );
    fireEvent.click(userCredentialsSelector);

    const userPassOption = await screen.findByText("Username/Password");
    fireEvent.click(userPassOption);

    const nameInput = await screen.findByLabelText("Name *");
    const userInput = await screen.findByLabelText("Username *");
    const passwordInput = await screen.findByLabelText("Password *");
    const createButton = await screen.findByRole("button", { name: /submit/i });

    expect(createButton).not.toBeEnabled();

    // fill out the form
    await waitFor(
      () => {
        fireEvent.change(nameInput, {
          target: { value: "identity-name" },
        });

        fireEvent.change(userInput, {
          target: { value: "username" },
        });

        fireEvent.change(passwordInput, {
          target: { value: "password" },
        });
      },
      {
        timeout: 3000,
      }
    );

    // verify field contents have enabled the create button
    expect(nameInput).toHaveValue("identity-name");
    expect(userInput).toHaveValue("username");
    expect(passwordInput).toHaveValue("password");
    expect(createButton).toBeEnabled();

    // focus off password then focus back on should 1. clear the password and 2. disable the create button
    await waitFor(() => {
      fireEvent.focus(createButton);
      fireEvent.focus(passwordInput);
    });

    expect(passwordInput).toHaveValue("");
    expect(createButton).toBeDisabled();
  });

  it("Identity form validation test - source - key upload", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);

    const identityNameInput = await screen.findByLabelText("Name *");

    fireEvent.change(identityNameInput, {
      target: { value: "identity-name" },
    });

    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );

    fireEvent.click(typeSelector);

    const sourceControlOption = await screen.findByText("Source Control");

    fireEvent.click(sourceControlOption);

    const userCredentialsSelector = await screen.findByLabelText(
      "User credentials select dropdown toggle"
    );

    fireEvent.click(userCredentialsSelector);

    const keyOption = await screen.findByText("Source Private Key/Passphrase");

    fireEvent.click(keyOption);

    const keyUpload = await screen.findByLabelText(
      "Upload your [SCM Private Key] file or paste its contents below. *"
    );

    //TODO:
    // Unable to test file upload due to lack of ID in PF code.
    //We need an ID field for the input with type=file for the drop event to work

    await waitFor(
      () =>
        fireEvent.change(keyUpload, {
          target: { value: "test-key-contents" },
        }),

      {
        timeout: 3000,
      }
    );

    expect(screen.getByText("test-key-contents")).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: /submit/i });

    expect(createButton).toBeEnabled();
  });

  it("Identity form validation test - maven", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);

    const identityNameInput = await screen.findByLabelText("Name *");

    fireEvent.change(identityNameInput, {
      target: { value: "identity-name" },
    });

    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );

    fireEvent.click(typeSelector);

    const mavenOption = await screen.findByText("Maven Settings File");

    fireEvent.click(mavenOption);

    const mavenUpload = await screen.findByLabelText(
      "Upload your Settings file or paste its contents below. *"
    );

    // TODO:
    // Unable to test file upload due to lack of ID in PF code.
    // We need an ID field for the input with type=file for the drop event to work
    const testSettingsFile = `

<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 http://maven.apache.org/xsd/settings-1.2.0.xsd">
  <profiles>
    <profile>
      <id>github</id>
    </profile>
  </profiles>
</settings>

`.trim();

    await waitFor(
      () =>
        fireEvent.change(mavenUpload, {
          target: { value: testSettingsFile },
        }),
      {
        timeout: 3000,
      }
    );

    const createButton = screen.getByRole("button", { name: /submit/i });

    await waitFor(() => expect(createButton).toBeEnabled());
  });

  it("Identity form validation test - proxy", async () => {
    render(<IdentityForm onClose={mockChangeValue} />);

    const identityNameInput = await screen.findByLabelText("Name *");

    fireEvent.change(identityNameInput, {
      target: { value: "identity-name" },
    });

    const typeSelector = await screen.findByLabelText(
      "Type select dropdown toggle"
    );

    fireEvent.click(typeSelector);

    const proxyOption = await screen.findByText("Proxy");

    fireEvent.click(proxyOption);

    const proxyUserInput = await screen.findByLabelText("Username *");
    await waitFor(
      () => {
        fireEvent.change(proxyUserInput, {
          target: { value: "username" },
        });
      },
      {
        timeout: 3000,
      }
    );

    const proxyPasswordInput = await screen.findByLabelText("Password");

    await waitFor(
      () => {
        fireEvent.change(proxyPasswordInput, {
          target: { value: "password" },
        });
      },
      {
        timeout: 3000,
      }
    );

    const createButton = screen.getByRole("button", { name: /submit/i });

    expect(createButton).toBeEnabled();

    // focus off password then focus back on should 1. clear the password and 2. disable the create button
    await waitFor(() => {
      fireEvent.focus(createButton);
      fireEvent.focus(proxyPasswordInput);
    });

    expect(proxyPasswordInput).toHaveValue("");
    expect(createButton).toBeDisabled();
  });
});

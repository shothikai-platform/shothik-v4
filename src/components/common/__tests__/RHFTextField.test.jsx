import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RHFTextField from "../RHFTextField";

const { mockController } = vi.hoisted(() => ({
  mockController: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({ control: {} }),
  Controller: (props) => mockController(props),
}));

describe("RHFTextField Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockController.mockReset();
  });

  it("renders helper text associated with input via aria-describedby", () => {
    mockController.mockImplementation(({ render }) =>
      render({
        field: {
          name: "test-field",
          value: "",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn(),
        },
        fieldState: { error: null },
      }),
    );

    render(
      <RHFTextField
        name="email"
        label="Email"
        helperText="Enter your email address"
      />,
    );

    const input = screen.getByLabelText("Email");
    const helperText = screen.getByText("Enter your email address");

    // This should fail initially as aria-describedby is missing
    expect(input.hasAttribute("aria-describedby")).toBe(true);

    const describedBy = input.getAttribute("aria-describedby");
    // Ensure the ID matches
    expect(helperText.getAttribute("id")).toBe(describedBy);
  });

  it("renders error message associated with input via aria-describedby and sets aria-invalid", () => {
    // Mock an error state
    mockController.mockImplementation(({ render }) =>
      render({
        field: {
          name: "email",
          value: "invalid",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn(),
        },
        fieldState: { error: { message: "Invalid email address" } },
      }),
    );

    render(<RHFTextField name="email" label="Email" />);

    const input = screen.getByLabelText("Email");
    const errorMessage = screen.getByText("Invalid email address");

    // These should fail initially
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("aria-describedby")).toBe(true);

    const describedBy = input.getAttribute("aria-describedby");
    expect(errorMessage.getAttribute("id")).toBe(describedBy);

    // Check for role="alert" on the error message container
    expect(errorMessage.getAttribute("role")).toBe("alert");
  });
});

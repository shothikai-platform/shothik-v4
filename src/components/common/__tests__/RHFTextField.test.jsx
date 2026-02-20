import React, { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { useForm, FormProvider } from "react-hook-form";
import RHFTextField from "../RHFTextField";

// Helper component to render RHFTextField with react-hook-form context
const TestWrapper = ({
  children,
  defaultValues = { testField: "" },
  setErrorOnMount = false,
}) => {
  const methods = useForm({ defaultValues });

  useEffect(() => {
    if (setErrorOnMount) {
      methods.setError("testField", {
        type: "manual",
        message: "This is an error message",
      });
    }
  }, [setErrorOnMount, methods]);

  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  );
};

// Cleanup DOM after each test to prevent collisions
afterEach(() => {
  document.body.innerHTML = "";
});

describe("RHFTextField Accessibility", () => {
  it("renders with label and input", () => {
    render(
      <TestWrapper>
        <RHFTextField name="testField" label="Test Label" />
      </TestWrapper>,
    );

    expect(screen.getByLabelText("Test Label")).toBeTruthy();
    const input = screen.getByLabelText("Test Label");
    expect(input.getAttribute("name")).toBe("testField");
  });

  it("links error message to input via aria-describedby when error exists", async () => {
    render(
      <TestWrapper setErrorOnMount={true}>
        <RHFTextField name="testField" label="Test Label" />
      </TestWrapper>,
    );

    // Wait for the error to appear (useEffect runs after render)
    const errorMessage = await screen.findByText("This is an error message");
    expect(errorMessage).toBeTruthy();

    const input = screen.getByLabelText("Test Label");

    // This is expected to fail initially
    const describedBy = input.getAttribute("aria-describedby");
    const errorId = errorMessage.getAttribute("id");

    expect(errorId).toBeTruthy();
    expect(describedBy).toBe(errorId);
    expect(errorId).toBe("testField-description");
  });

  it("sets aria-invalid on input when error exists", async () => {
    render(
      <TestWrapper setErrorOnMount={true}>
        <RHFTextField name="testField" label="Test Label" />
      </TestWrapper>,
    );

    const input = await screen.findByLabelText("Test Label");

    // Wait for error state
    await screen.findByText("This is an error message");

    // This is expected to fail initially
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("renders helper text with correct ID when provided", () => {
    render(
      <TestWrapper>
        <RHFTextField
          name="testField"
          label="Test Label"
          helperText="Helper text"
        />
      </TestWrapper>,
    );

    const helperText = screen.getByText("Helper text");
    const input = screen.getByLabelText("Test Label");

    // This is expected to fail initially
    const describedBy = input.getAttribute("aria-describedby");
    const helperId = helperText.getAttribute("id");

    expect(helperId).toBe("testField-description");
    expect(describedBy).toBe(helperId);
  });
});

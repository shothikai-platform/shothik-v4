import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import RHFTextField from "../RHFTextField";
import { describe, it, expect, afterEach } from "vitest";
import React, { useEffect } from "react";

// Wrapper to provide React Hook Form context
const TestWrapper = ({ children, useFormProps = {} }) => {
  const methods = useForm(useFormProps);
  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Component that forces an error state on mount
const ErrorComponent = ({ name, errorMessage }) => {
  const methods = useForm({
    defaultValues: { [name]: "" },
  });

  useEffect(() => {
    methods.setError(name, { type: "custom", message: errorMessage });
  }, [name, errorMessage, methods]);

  return (
    <FormProvider {...methods}>
      <RHFTextField name={name} label="Test Label" />
    </FormProvider>
  );
};

describe("RHFTextField Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("links helper text to input via aria-describedby", () => {
    render(
      <TestWrapper>
        <RHFTextField
          name="test"
          label="Test Label"
          helperText="Helper text content"
        />
      </TestWrapper>,
    );

    const input = screen.getByLabelText("Test Label");
    const helperText = screen.getByText("Helper text content");

    // Check if input has aria-describedby
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // Check if helper text has the corresponding id
    expect(helperText.getAttribute("id")).toBe(describedBy);
  });

  it('renders aria-invalid="true" and links error message when error exists', async () => {
    render(<ErrorComponent name="email" errorMessage="Invalid email" />);

    const input = screen.getByLabelText("Test Label");
    const errorMessage = await screen.findByText("Invalid email");

    // Check aria-invalid
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Check aria-describedby linking to error message
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(errorMessage.getAttribute("id")).toBe(describedBy);
  });

  it("does not have aria-invalid or aria-describedby when no error or helper text", () => {
    render(
      <TestWrapper>
        <RHFTextField name="simple" label="Simple Field" />
      </TestWrapper>,
    );

    const input = screen.getByLabelText("Simple Field");
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });
});

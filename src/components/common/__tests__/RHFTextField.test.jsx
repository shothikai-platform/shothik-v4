import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { describe, it, expect } from "vitest";
import RHFTextField from "../RHFTextField";

// Wrapper component to provide form context
const TestWrapper = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      testField: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    methods.setError("testField", {
      type: "manual",
      message: "Test Error Message",
    });
  }, [methods]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("RHFTextField Accessibility", () => {
  it("should have aria-invalid and aria-describedby when error is present", async () => {
    render(
      <TestWrapper>
        <RHFTextField name="testField" label="Test Label" />
      </TestWrapper>,
    );

    // Wait for the error to appear
    const errorMessage = await screen.findByText("Test Error Message");
    expect(errorMessage).toBeTruthy();

    const input = screen.getByLabelText("Test Label");

    // Check for aria-invalid
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Check for aria-describedby
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // Verify the describedby ID points to the error message
    expect(errorMessage.getAttribute("id")).toBe(describedBy);
  });
});

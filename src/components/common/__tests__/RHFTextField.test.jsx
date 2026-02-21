import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { describe, it, expect, vi, afterEach } from "vitest";
import RHFTextField from "../RHFTextField";

afterEach(() => {
  cleanup();
});

// Mock Input component to avoid issues with absolute imports if not configured perfectly in test
// However, the vitest config has alias for @, so it might work.
// But to be safe and test strictly the RHFTextField logic, mocking UI components is fine.
vi.mock("@/components/ui/input", () => ({
  Input: (props) => <input data-testid="mock-input" {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, ...props }) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

describe("RHFTextField Accessibility", () => {
  it("should associate error message with input using aria-describedby", () => {
    const TestComponent = () => {
      const methods = useForm({
        defaultValues: { testField: "" },
        mode: "onChange",
      });

      // Force an error state
      React.useEffect(() => {
        methods.setError("testField", {
          type: "manual",
          message: "This field is required",
        });
      }, [methods]);

      return (
        <FormProvider {...methods}>
          <RHFTextField name="testField" label="Test Label" />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const input = screen.getByTestId("mock-input");
    const errorMessage = screen.getByText("This field is required");

    // These assertions are expected to FAIL initially
    // Check for aria-invalid
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Check for aria-describedby
    const errorId = errorMessage.getAttribute("id");
    expect(errorId).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(errorId);

    // Check for role="alert"
    expect(errorMessage.getAttribute("role")).toBe("alert");
  });

  it("should associate helper text with input using aria-describedby", () => {
    const TestComponent = () => {
      const methods = useForm({
        defaultValues: { testField: "" },
      });

      return (
        <FormProvider {...methods}>
          <RHFTextField
            name="testField"
            label="Test Label"
            helperText="Some helper text"
          />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const input = screen.getByTestId("mock-input");
    const helperText = screen.getByText("Some helper text");

    // These assertions are expected to FAIL initially
    const helperId = helperText.getAttribute("id");
    expect(helperId).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(helperId);
  });
});

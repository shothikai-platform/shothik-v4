import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { describe, it, expect, afterEach } from "vitest";
import { RHFSelect } from "../RHFSelect";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Wrapper component to provide form context
const TestWrapper = ({ children, errorMessage = "Select Error Message" }) => {
  const methods = useForm({
    defaultValues: {
      testSelect: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    methods.setError("testSelect", {
      type: "manual",
      message: errorMessage,
    });
  }, [methods, errorMessage]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("RHFSelect Accessibility", () => {
  it("should have aria-invalid and aria-describedby when error is present (Custom Select)", async () => {
    render(
      <TestWrapper errorMessage="Custom Error">
        <RHFSelect name="testSelect" label="Test Select Label">
          <option value="1">Option 1</option>
        </RHFSelect>
      </TestWrapper>,
    );

    const errorMessage = await screen.findByText("Custom Error");
    expect(errorMessage).toBeTruthy();

    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");

    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(errorMessage.getAttribute("id")).toBe(describedBy);
  });

  it("should have aria-invalid and aria-describedby when error is present (Native Select)", async () => {
    render(
      <TestWrapper errorMessage="Native Error">
        <RHFSelect name="testSelect" label="Test Native Select Label" native>
          <option value="1">Option 1</option>
        </RHFSelect>
      </TestWrapper>,
    );

    const errorMessage = await screen.findByText("Native Error");
    expect(errorMessage).toBeTruthy();

    // For native select, the label points to the select element ID
    const select = screen.getByLabelText("Test Native Select Label");

    expect(select.getAttribute("aria-invalid")).toBe("true");

    const describedBy = select.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(errorMessage.getAttribute("id")).toBe(describedBy);
  });
});

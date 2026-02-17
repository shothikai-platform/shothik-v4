import { render, screen, cleanup } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { RHFSelect } from "../RHFSelect";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";

// Wrapper component to provide FormContext
const Wrapper = ({ children, defaultValues = { testSelect: "" } }) => {
  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ScrollIntoView for Radix UI
Element.prototype.scrollIntoView = vi.fn();

describe("RHFSelect Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("links helperText to the select input via aria-describedby", () => {
    render(
      <Wrapper>
        <RHFSelect
          name="testSelect"
          label="Test Label"
          helperText="Helper text content"
        >
          <div value="1">Option 1</div>
        </RHFSelect>
      </Wrapper>
    );

    // The trigger is a button with role="combobox" for Radix Select
    const trigger = screen.getByRole("combobox");

    // Check for aria-describedby
    const describedBy = trigger.getAttribute("aria-describedby");

    // This expectation should fail before the fix
    expect(describedBy).toBeTruthy();

    if (describedBy) {
      // Verify the element it points to exists and has the helper text
      // We use document.getElementById because getByRole might not find it easily by ID if it's just a p tag
      const helperTextElement = document.getElementById(describedBy);
      expect(helperTextElement).toBeTruthy();
      expect(helperTextElement.textContent).toBe("Helper text content");
    }
  });

  it("links helperText to the native select input via aria-describedby", () => {
    render(
      <Wrapper>
        <RHFSelect
          native
          name="testSelect"
          label="Test Label"
          helperText="Native helper text"
        >
          <option value="1">Option 1</option>
        </RHFSelect>
      </Wrapper>
    );

    // Native select is also a combobox (or distinct role depending on browser/library versions, usually 'combobox' or 'listbox' isn't applied to select, but role='combobox' might be implicitly applied or we query by tag)
    // Testing library query for native select: usually getByRole('combobox') works if it has a label.
    const select = screen.getByRole("combobox");

    const describedBy = select.getAttribute("aria-describedby");

    // This expectation should fail before the fix
    expect(describedBy).toBeTruthy();

    if (describedBy) {
      const helperTextElement = document.getElementById(describedBy);
      expect(helperTextElement).toBeTruthy();
      expect(helperTextElement.textContent).toBe("Native helper text");
    }
  });
});

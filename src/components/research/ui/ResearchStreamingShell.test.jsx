import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import ResearchStreamingShell from "./ResearchStreamingShell";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Mock NextImage
vi.mock("next/image", () => ({
  default: (props) => <img {...props} alt={props.alt} />,
}));

// Mock child components
const { ResearchProcessLogsMock } = vi.hoisted(() => {
  return { ResearchProcessLogsMock: vi.fn(() => <div>Logs</div>) };
});
vi.mock("./ResearchProcessLogs", () => ({ default: ResearchProcessLogsMock }));

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const createMockStore = () =>
  configureStore({
    reducer: {
      researchCore: (state = { userPrompt: "Test Prompt" }, action) => state,
    },
  });

describe("ResearchStreamingShell", () => {
  it("renders the disabled download button", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ResearchStreamingShell />
      </Provider>,
    );

    // It has alt="Download" inside
    const button = screen.getByRole("button", { name: /Download/i });
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);
  });

  it("passes stable empty array for researches prop", () => {
    const store = createMockStore();
    const { rerender } = render(
      <Provider store={store}>
        <ResearchStreamingShell streamEvents={[{ step: "queued" }]} />
      </Provider>,
    );

    expect(ResearchProcessLogsMock).toHaveBeenCalled();
    const firstCallProps = ResearchProcessLogsMock.mock.lastCall[0];
    const firstResearches = firstCallProps.researches;

    // Rerender with same props
    rerender(
      <Provider store={store}>
        <ResearchStreamingShell streamEvents={[{ step: "queued" }]} />
      </Provider>,
    );

    const secondCallProps = ResearchProcessLogsMock.mock.lastCall[0];
    const secondResearches = secondCallProps.researches;

    expect(firstResearches).toBe(secondResearches);
  });
});

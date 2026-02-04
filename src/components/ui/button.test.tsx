import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeDefined();
    expect(button.disabled).toBe(false);
  });

  it("shows spinner and disables button when isLoading is true", () => {
    render(<Button isLoading>Loading...</Button>);

    // Check for spinner
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();

    // Check button is disabled
    const button = screen.getByRole("button");
    expect(button.disabled).toBe(true);
  });

  it("renders with asChild without crashing", () => {
    render(
      <Button asChild>
        <a href="#">Link</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toBeDefined();
  });
});

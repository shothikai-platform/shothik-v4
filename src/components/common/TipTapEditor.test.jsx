import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import TipTapEditor from "./TipTapEditor";

// Mock @tiptap/react to prevent actual editor initialization issues in tests
vi.mock("@tiptap/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useEditor: () => ({
      commands: {
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
        toggleUnderline: vi.fn(),
        setParagraph: vi.fn(),
        setHeading: vi.fn(),
        toggleOrderedList: vi.fn(),
        toggleBulletList: vi.fn(),
        toggleBlockquote: vi.fn(),
        setHorizontalRule: vi.fn(),
        setContent: vi.fn(),
      },
      getHTML: () => "<p>Test content</p>",
    }),
    EditorContent: () => <div data-testid="tiptap-editor-content" />,
  };
});

describe("TipTapEditor UX/Accessibility", () => {
  it("should render all formatting buttons with aria-label and title attributes", () => {
    render(<TipTapEditor content="<p>Test content</p>" onChange={vi.fn()} />);

    // Verify Bold button
    const boldBtn = screen.getByRole("button", { name: "Bold" });
    expect(boldBtn).toBeInTheDocument();
    expect(boldBtn).toHaveAttribute("title", "Bold");

    // Verify Italic button
    const italicBtn = screen.getByRole("button", { name: "Italic" });
    expect(italicBtn).toBeInTheDocument();
    expect(italicBtn).toHaveAttribute("title", "Italic");

    // Verify Underline button
    const underlineBtn = screen.getByRole("button", { name: "Underline" });
    expect(underlineBtn).toBeInTheDocument();
    expect(underlineBtn).toHaveAttribute("title", "Underline");

    // Verify Paragraph button
    const paragraphBtn = screen.getByRole("button", { name: "Paragraph" });
    expect(paragraphBtn).toBeInTheDocument();
    expect(paragraphBtn).toHaveAttribute("title", "Paragraph");

    // Verify Heading buttons
    const h2Btn = screen.getByRole("button", { name: "Heading 2" });
    expect(h2Btn).toBeInTheDocument();
    expect(h2Btn).toHaveAttribute("title", "Heading 2");

    const h3Btn = screen.getByRole("button", { name: "Heading 3" });
    expect(h3Btn).toBeInTheDocument();
    expect(h3Btn).toHaveAttribute("title", "Heading 3");

    const h4Btn = screen.getByRole("button", { name: "Heading 4" });
    expect(h4Btn).toBeInTheDocument();
    expect(h4Btn).toHaveAttribute("title", "Heading 4");

    // Verify List buttons
    const orderedListBtn = screen.getByRole("button", { name: "Ordered List" });
    expect(orderedListBtn).toBeInTheDocument();
    expect(orderedListBtn).toHaveAttribute("title", "Ordered List");

    const bulletListBtn = screen.getByRole("button", { name: "Bullet List" });
    expect(bulletListBtn).toBeInTheDocument();
    expect(bulletListBtn).toHaveAttribute("title", "Bullet List");

    // Verify Blockquote button
    const blockquoteBtn = screen.getByRole("button", { name: "Blockquote" });
    expect(blockquoteBtn).toBeInTheDocument();
    expect(blockquoteBtn).toHaveAttribute("title", "Blockquote");

    // Verify Horizontal Rule button
    const hrBtn = screen.getByRole("button", { name: "Horizontal Rule" });
    expect(hrBtn).toBeInTheDocument();
    expect(hrBtn).toHaveAttribute("title", "Horizontal Rule");
  });
});

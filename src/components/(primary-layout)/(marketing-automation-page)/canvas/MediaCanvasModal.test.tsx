import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MediaCanvasModal from "./MediaCanvasModal";
import { mediaAPI } from "@/services/marketing-automation.service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ projectId: "project-123" }),
}));

// Mock marketing-automation.service
vi.mock("@/services/marketing-automation.service", () => ({
  mediaAPI: {
    regenerateMedia: vi.fn(),
  },
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Download: () => <div data-testid="icon-download" />,
  Edit3: () => <div data-testid="icon-edit" />,
  Film: () => <div data-testid="icon-film" />,
  Image: () => <div data-testid="icon-image" />,
  ImageIcon: () => <div data-testid="icon-image" />,
  Layers: () => <div data-testid="icon-layers" />,
  RefreshCw: () => <div data-testid="icon-refresh" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Wand2: () => <div data-testid="icon-wand" />,
  Zap: () => <div data-testid="icon-zap" />,
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
}));

const mockAd = {
  id: "ad-123",
  adSetId: "adset-123",
  format: "IMAGE",
  headline: "Test Ad",
  description: "Test Description",
  cta: "SHOP_NOW",
  creative_direction: "Make it pop",
  hook: "Grab attention",
  persona: "Techie",
  awareness_stage: "problem_aware",
};

describe("MediaCanvasModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls mediaAPI.regenerateMedia when applying edits", async () => {
    // Setup mock return
    const mockNewImage = "https://example.com/new-image.png";
    (mediaAPI.regenerateMedia as any).mockResolvedValue({
      success: true,
      mediaUrl: mockNewImage,
    });

    render(<MediaCanvasModal ad={mockAd as any} onClose={() => {}} />);

    // 1. Generate Media (using the internal mock implementation)
    // The "Generate" tab is active by default.
    // The content one has "Generate Image" or "Generate Video" text.
    // The code says: Generate {isVideoFormat ? "Video" : "Image"}
    const generateActionBtn = screen.getByRole("button", { name: /generate image/i });

    fireEvent.click(generateActionBtn);

    // Wait for generation to finish (it uses setTimeout 2000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // 2. Switch to Edit Tab
    const editTab = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editTab);

    // 3. Enter Prompt
    const promptInput = screen.getByPlaceholderText("Describe what you want to change...");
    fireEvent.change(promptInput, { target: { value: "Make it blue" } });

    // 4. Click Apply Edit
    const applyBtn = screen.getByRole("button", { name: /apply edit/i });
    fireEvent.click(applyBtn);

    // The current implementation uses setTimeout 2000ms.
    // The NEW implementation will wait for API promise.
    // Since we want to test the NEW implementation, we don't need to advance timers IF the new implementation is awaited.
    // But since the current implementation is setTimeout, let's see what happens if I run this test now.
    // If I don't advance timers, the mock setTimeout won't finish.

    // However, I am writing this test to pass AFTER my changes.
    // My changes will REMOVE setTimeout and use await mediaAPI.regenerateMedia().
    // So checking `toHaveBeenCalledWith` immediately after click (and maybe wait for promise resolution) is correct.

    // BUT, `handleEditMedia` is async.
    // We should wait for the call.

    await act(async () => {
       // Allow promises to resolve
    });

    expect(mediaAPI.regenerateMedia).toHaveBeenCalledWith(
      "project-123",
      "ad-123",
      "Make it blue",
      undefined // No region selected
    );
  });
});

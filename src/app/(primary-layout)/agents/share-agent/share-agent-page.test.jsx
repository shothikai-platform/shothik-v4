import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SharedAgentPage from "./[shareId]/page";

// Mock Next.js hooks
vi.mock("next/navigation", () => ({
  useParams: () => ({ shareId: "test-share-id" }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Redux hooks
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector) =>
    selector({
      auth: { accessToken: "test-token", user: { id: "user-123" } },
    }),
}));

const mockVerifySharedAgent = vi.fn();
const mockCreateReplica = vi.fn();

const mockData = {
  success: true,
  data: {
    agent: {
      _id: "agent-1",
      type: "research",
      title: "XSS Test Title",
      content:
        "Safe Markdown text\n<script>alert('xss')</script>\n<img src=\"x\" onerror=\"alert('xss')\">",
      sources: [],
    },
    shareInfo: {
      sharedBy: { name: "Test User" },
      visibility: "public",
      views: 10,
      createdAt: new Date().toISOString(),
    },
  },
};

vi.mock("@/redux/api/shareAgent/shareAgentApi", () => ({
  useLazyVerifySharedAgentQuery: () => [
    mockVerifySharedAgent,
    { isLoading: false, data: mockData, error: null },
  ],
  useCreateAgentReplicaMutation: () => [
    mockCreateReplica,
    { isLoading: false },
  ],
}));

describe("SharedAgentPage XSS Sanitization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sanitizes malicious script tags and inline event handlers from research content", async () => {
    mockVerifySharedAgent.mockReturnValue({
      unwrap: () => Promise.resolve(mockData),
    });

    const { container } = render(<SharedAgentPage />);

    await waitFor(() => {
      expect(screen.getByText("Shared AI Research")).not.toBeNull();
    });

    // Verify <script> tag is completely removed
    expect(container.querySelector("script")).toBeNull();

    // Verify onerror attribute on <img> is stripped by DOMPurify
    const imgElement = container.querySelector("img[src='x']");
    expect(imgElement).not.toBeNull();
    expect(imgElement?.getAttribute("onerror")).toBeNull();
  });
});

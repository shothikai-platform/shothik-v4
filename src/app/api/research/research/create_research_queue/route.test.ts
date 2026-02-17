import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockFindOne, mockSave, mockFindByIdAndUpdate } =
  vi.hoisted(() => {
    return {
      mockFindById: vi.fn(),
      mockFindOne: vi.fn(),
      mockSave: vi.fn(),
      mockFindByIdAndUpdate: vi.fn(),
    };
  });

vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  };
});

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("POST /api/research/research/create_research_queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat1", query: "test" }),
      },
    );

    const response = await POST(request);

    // Currently, it does NOT check auth, so it returns 200.
    // The test expects 401.
    expect(response.status).toBe(401);
  });

  it("should return 404 if chat belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user2" });

    // Mock findOne to return null (chat not found for this user)
    mockFindOne.mockResolvedValue(null);

    // In the insecure implementation, findById is used.
    mockFindById.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      messages: [],
      save: mockSave,
    });

    const request = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat1", query: "test" }),
      },
    );

    const response = await POST(request);

    // Currently, it returns 200 because it ignores ownership.
    // The test expects 404.
    expect(response.status).toBe(404);
  });
});

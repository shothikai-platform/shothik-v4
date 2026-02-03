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

// Hoist mocks for Mongoose model
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

// Mock NextResponse
// We need to support both .json() static method and new NextResponse() constructor
vi.mock("next/server", () => {
  return {
    NextResponse: class {
      static json = vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
      }));
      constructor(body, options) {
        return { body, options, status: options?.status || 200 };
      }
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

    const req = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ chat: "chat123", query: "test" }),
    });

    const response = await POST(req);

    // This is expected to FAIL before the fix, as the current code doesn't check auth
    expect(response.status).toBe(401);
  });

  it("should return 404 if chat is not found or not owned by user (IDOR protection)", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOne to return null (simulating not found or not owned)
    mockFindOne.mockResolvedValue(null);
    // Also mock findById to return something so we know if it fell back to insecure method
    mockFindById.mockResolvedValue({
      _id: "chat123",
      userId: "otherUser",
      messages: [],
      save: mockSave,
    });

    const req = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ chat: "chat123", query: "test" }),
    });

    const response = await POST(req);

    // Should use findOne with userId
    expect(mockFindOne).toHaveBeenCalledWith({
      _id: "chat123",
      userId: "user123",
    });
    expect(response.status).toBe(404);
  });
});

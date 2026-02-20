import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

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

// Mock Mongoose model
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
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  // We need to allow `NextResponse.json` and `new NextResponse()`
  // But since the route uses `NextResponse.json` for errors and `new NextResponse(stream)` for success,
  // we can just check the returned object structure.

  return {
    ...actual,
    NextResponse: class {
      status: number;
      body: any;
      constructor(body: any, init?: any) {
        this.status = init?.status || 200;
        this.body = body;
      }
      static json(data: any, init?: any) {
        return {
          status: init?.status || 200,
          json: async () => data,
        };
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

    const req = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({
          chat: "chat1",
          query: "test query",
          config: {},
        }),
      },
    );

    const response = await POST(req);

    // If vulnerable, it returns success (stream) or 500 (if mocks fail later).
    // If fixed, it returns 401.
    expect(response.status).toBe(401);
  });

  it("should return 404 if chat belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user2" });

    // Mock findById returning a chat owned by user1 (Simulate DB existing chat)
    const mockChat = {
      _id: "chat1",
      userId: "user1",
      messages: [],
      save: mockSave,
    };
    mockFindById.mockResolvedValue(mockChat);

    // Mock findOne returning null (Simulate not found for user2)
    mockFindOne.mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({
          chat: "chat1",
          query: "test query",
          config: {},
        }),
      },
    );

    const response = await POST(req);

    // If vulnerable, it finds chat via findById and returns success (200).
    // If fixed, it searches via findOne (which returns null) and returns 404.
    expect(response.status).toBe(404);
  });
});

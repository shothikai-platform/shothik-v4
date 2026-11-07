import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSort } = vi.hoisted(() => {
  const sortFn = vi.fn().mockReturnThis();
  const findFn = vi.fn(() => ({
    sort: sortFn,
  }));
  return {
    mockFind: findFn,
    mockSort: sortFn,
  };
});

// Mock Mongoose model
vi.mock("@/models/SheetSession", () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(401);
  });

  it("should only return chats belonging to the authenticated user", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session1", userId: "user123", title: "My Session" },
    ];
    (mockSort as any).mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: "user123" });
  });

  it("should support user.id fallback if _id is not present", async () => {
    const mockUser = { id: "user456" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session2", userId: "user456", title: "My Session 2" },
    ];
    (mockSort as any).mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: "user456" });
  });
});

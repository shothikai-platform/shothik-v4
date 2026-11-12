import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const leanFn = vi.fn();
  const sortFn = vi.fn(() => ({ lean: leanFn }));
  const findFn = vi.fn(() => ({ sort: sortFn }));
  return {
    mockFind: findFn,
    mockSort: sortFn,
    mockLean: leanFn,
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
    expect((response as any).data).toEqual({ error: "Unauthorized" });
    expect(mockFind).not.toHaveBeenCalled();
  });

  it("should only return chats belonging to the authenticated user (_id)", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session1", userId: "user123", title: "My Spreadsheet" },
    ];
    (mockLean as any).mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: "user123" });
    expect((response as any).data).toEqual(mockSessions);
  });

  it("should fallback to user.id if _id is not present", async () => {
    const mockUser = { id: "user456", email: "test2@example.com" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session2", userId: "user456", title: "My Spreadsheet 2" },
    ];
    (mockLean as any).mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: "user456" });
    expect((response as any).data).toEqual(mockSessions);
  });
});

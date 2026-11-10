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
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
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
    })),
  },
}));

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSort.mockResolvedValue([
      { _id: "session-1", title: "Sheet 1", userId: "user-123" },
    ]);
    mockFind.mockReturnValue({ sort: mockSort });
  });

  it("should return 401 Unauthorized if user is not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: "Unauthorized" });
    expect(mockFind).not.toHaveBeenCalled();
  });

  it("should scope sessions query to authenticated user id and sort by updatedAt desc", async () => {
    const mockUser = {
      _id: "user-123",
      name: "Test User",
      email: "test@example.com",
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: "user-123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(response.data).toEqual([
      { _id: "session-1", title: "Sheet 1", userId: "user-123" },
    ]);
  });

  it("should handle alternate user.id if _id is not present", async () => {
    const mockUser = {
      id: "user-456",
      _id: "",
      name: "Test User",
      email: "test@example.com",
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    await GET(new Request("http://localhost/api/sheet/chat/get_my_chats"));

    expect(mockFind).toHaveBeenCalledWith({ userId: "user-456" });
  });

  it("should return 500 without leaking sensitive errors when database fails", async () => {
    const mockUser = {
      _id: "user-123",
      name: "Test User",
      email: "test@example.com",
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);
    mockFind.mockImplementation(() => {
      throw new Error(
        "Database connection failed with credentials mongodb://secret",
      );
    });

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: "Internal Server Error" });
  });
});

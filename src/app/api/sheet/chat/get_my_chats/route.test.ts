import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";
import SheetSession from "@/models/SheetSession";
import { getAuthenticatedUser } from "@/lib/server-auth";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockSort } = vi.hoisted(() => ({
  mockSort: vi.fn(),
}));

vi.mock("@/models/SheetSession", () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: mockSort,
    }),
  },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => {
      return {
        ...init,
        json: async () => data,
      };
    }),
  },
}));

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Unauthorized" },
      { status: 401 },
    );
  });

  it("should return sessions filtered by the authenticated user ID", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session1", title: "Session 1" },
      { _id: "session2", title: "Session 2" },
    ];

    mockSort.mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    const data = await (response as any).json();
    expect(data).toEqual(mockSessions);
  });

  it("should fallback to user.id if user._id is not available", async () => {
    const mockUser = { id: "user456" }; // user object from some auth providers might use 'id' instead of '_id'
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockSort.mockResolvedValue([]);

    await GET(new Request("http://localhost/api/sheet/chat/get_my_chats"));

    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user456" });
  });

  it("should return 500 on database error", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    (SheetSession.find as any).mockImplementationOnce(() => {
      throw new Error("DB Error");
    });

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  });
});

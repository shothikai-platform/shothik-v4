import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getAuthenticatedUser } from "@/lib/server-auth";
import SheetSession from "@/models/SheetSession";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn().mockResolvedValue(true),
}));

// Mock SheetSession
const mockSort = vi.hoisted(() => vi.fn());
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

vi.mock("@/models/SheetSession", () => ({
  default: {
    find: mockFind,
  },
}));

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request as any);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 200 and only user's sessions if authenticated", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session1", userId: "user123", title: "Sheet 1" },
      { _id: "session2", userId: "user123", title: "Sheet 2" },
    ];
    mockSort.mockResolvedValue(mockSessions);

    const request = new NextRequest(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockSessions);

    // Verify find was called with correct userId filter
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });

  it("should handle internal server errors gracefully", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Simulate error during db call
    mockFind.mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const request = new NextRequest(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request as any);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal Server Error");
  });
});

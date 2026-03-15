import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getAuthenticatedUser } from "@/lib/server-auth";
import SheetSession from "@/models/SheetSession";
import dbConnect from "@/lib/dbConnect";

// Mock dependencies
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

// Hoist mocks for Mongoose chaining before vi.mock
const mockLean = vi.fn();
const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

vi.mock("@/models/SheetSession", () => ({
  default: {
    find: (...args: any[]) => mockFind(...args),
  },
}));

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
    expect(dbConnect).not.toHaveBeenCalled();
    expect(mockFind).not.toHaveBeenCalled();
  });

  it("should return 200 and the user sessions if authenticated", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };
    const mockSessions = [
      { _id: "session1", title: "Session 1", userId: "user123" },
      { _id: "session2", title: "Session 2", userId: "user123" },
    ];

    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockSessions);
    expect(dbConnect).toHaveBeenCalled();
    expect(mockFind).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });

  it("should return 500 if an error occurs", async () => {
    const mockUser = { id: "user456", email: "error@example.com" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (dbConnect as any).mockRejectedValue(new Error("Database error"));

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});

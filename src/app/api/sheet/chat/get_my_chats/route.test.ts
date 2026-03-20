import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getAuthenticatedUser } from "@/lib/server-auth";
import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

// Setup mock chain for Mongoose find().sort()
const { mockFind, mockSort } = vi.hoisted(() => {
  const mockSort = vi.fn();
  const mockFind = vi.fn().mockReturnValue({
    sort: mockSort,
  });
  return { mockFind, mockSort };
});

vi.mock("@/models/SheetSession", () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });

    expect(dbConnect).not.toHaveBeenCalled();
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it("should fetch chats scoped to the authenticated user", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session1", title: "Chat 1", userId: "user123" },
      { _id: "session2", title: "Chat 2", userId: "user123" },
    ];

    mockSort.mockResolvedValue(mockSessions);

    const request = new Request(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(data).toEqual(mockSessions);
  });

  it("should fetch chats scoped to the authenticated user using id if _id is missing", async () => {
    const mockUser = { id: "user456", email: "test2@example.com" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: "session3", title: "Chat 3", userId: "user456" },
    ];

    mockSort.mockResolvedValue(mockSessions);

    const request = new Request(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);

    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user456" });
  });

  it("should return 500 on internal server error", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    (dbConnect as any).mockRejectedValue(new Error("DB connection failed"));

    const request = new Request(
      "http://localhost:3000/api/sheet/chat/get_my_chats",
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: "Internal Server Error" });
  });
});

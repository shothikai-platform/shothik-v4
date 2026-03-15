import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock dbConnect
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
    mockLean: vi.fn(),
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

// Setup mock chain
mockFind.mockReturnValue({ sort: mockSort });
mockSort.mockReturnValue({ lean: mockLean });

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

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all sessions sorted by newest updated with lean", async () => {
    const mockSessions = [
      { _id: "session1", title: "Session 1", status: "active" },
      { _id: "session2", title: "Session 2", status: "completed" },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
    expect(response.status).toBe(200);
  });

  it("should return 500 on database error", async () => {
    mockLean.mockRejectedValue(new Error("Database connection failed"));

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 },
    );
    expect(response.status).toBe(500);
  });
});

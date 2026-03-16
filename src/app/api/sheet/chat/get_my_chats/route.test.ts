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

    // Setup chained mocks: find().sort().lean()
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });
  });

  it("should return plain JS objects via .lean() to improve performance", async () => {
    const mockSessions = [
      { _id: "1", title: "Session 1", status: "active" },
      { _id: "2", title: "Session 2", status: "completed" },
    ];

    // Resolve lean mock
    mockLean.mockResolvedValue(mockSessions);

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    const response = await GET(request);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);
  });

  it("should return 500 on database error", async () => {
    mockFind.mockImplementation(() => {
      throw new Error("Database Error");
    });

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: "Internal Server Error" });
  });
});

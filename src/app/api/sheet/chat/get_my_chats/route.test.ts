import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock dependencies
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
vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({
        data,
        status: options?.status || 200,
      })),
    },
  };
});

import dbConnect from "@/lib/dbConnect";
import SheetSession from "@/models/SheetSession";

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chained mocks
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });
  });

  it("should fetch and return sheet sessions successfully", async () => {
    const mockSessions = [
      {
        _id: "session1",
        title: "Chat 1",
        status: "active",
        updatedAt: new Date(),
      },
      {
        _id: "session2",
        title: "Chat 2",
        status: "active",
        updatedAt: new Date(),
      },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
  });

  it("should return 500 if database operation fails", async () => {
    mockLean.mockRejectedValue(new Error("Database error"));

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(dbConnect).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 },
    );
    expect(response.status).toBe(500);
  });
});

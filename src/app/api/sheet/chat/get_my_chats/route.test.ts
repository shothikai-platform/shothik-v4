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
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(async (data, options) => {
      return {
        async json() {
          return data;
        },
        status: options?.status || 200,
      };
    }),
  },
}));

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockLean.mockResolvedValue([
      { _id: "session1", userId: "user1", title: "New Chat 1" },
      { _id: "session2", userId: "user1", title: "New Chat 2" },
    ]);
    mockSort.mockReturnValue({ lean: mockLean });
    mockFind.mockReturnValue({ sort: mockSort });
  });

  it("should fetch sheet sessions using .lean() for performance and map _id to id", async () => {
    const response = (await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    )) as any;
    const data = await response.json();

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify virtual mapping logic
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe("session1");
    expect(data[0]._id).toBe("session1");
    expect(data[1].id).toBe("session2");
    expect(data[1]._id).toBe("session2");
  });

  it("should handle errors gracefully", async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error("DB Error");
    });

    const response = (await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    )) as any;

    expect(response.status).toBe(500);
  });
});

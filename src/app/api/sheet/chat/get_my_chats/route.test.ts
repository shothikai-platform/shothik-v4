import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

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
    json: vi.fn((data, options) => {
      return {
        data,
        options,
        status: options?.status || 200,
        json: async () => data,
      };
    }),
  },
}));

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockLean.mockResolvedValue([
      { _id: "session1", title: "Chat 1" },
      { _id: "session2", title: "Chat 2" },
    ]);
    mockSort.mockReturnValue({ lean: mockLean });

    // Default behavior for find
    mockFind.mockReturnValue({
      sort: mockSort,
    });
  });

  it("should fetch sessions using .lean() for performance and map _id to id", async () => {
    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    // Parse response data
    const data = await response.json();

    // Verify .lean() was called in the query chain
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify the frontend contract: id should be mapped from _id
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty("id", "session1");
    expect(data[0]).toHaveProperty("_id", "session1");
    expect(data[0]).toHaveProperty("title", "Chat 1");

    expect(data[1]).toHaveProperty("id", "session2");
    expect(data[1]).toHaveProperty("_id", "session2");
    expect(data[1]).toHaveProperty("title", "Chat 2");
  });
});

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

    // Setup generic mock chain
    mockLean.mockResolvedValue([{ _id: "1", title: "New Chat" }]);
    mockSort.mockReturnValue({ lean: mockLean });
    mockFind.mockReturnValue({ sort: mockSort });
  });

  it("should fetch sheet sessions using lean() for better performance", async () => {
    await GET(new Request("http://localhost/api/sheet/chat/get_my_chats"));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // THIS IS THE CRITICAL ASSERTION
    // It verifies that .lean() was called for optimization
    expect(mockLean).toHaveBeenCalled();
  });

  it("should return a 500 error on failure", async () => {
    // Setup mock to simulate an error during query
    mockFind.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(500);
    expect((response as any).data.error).toBe("Internal Server Error");
  });
});

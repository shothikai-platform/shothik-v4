import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn().mockReturnValue({ lean });
  const find = vi.fn().mockReturnValue({ sort });
  return {
    mockFind: find,
    mockSort: sort,
    mockLean: lean,
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
  });

  it("should use .lean() to return plain JS objects for better performance", async () => {
    mockLean.mockResolvedValue([{ id: 1, title: "Chat 1" }]);

    // Test the current endpoint which is expected to fail with "TypeError: ...lean is not a function"
    // because the actual code doesn't chain .lean() yet.

    // We expect `mockLean` not to have been called yet because we are reproducing the issue.
    // The endpoint returns `await find({}).sort(...)`. `mockSort` returns `{ lean: mockLean }`
    // but the endpoint does NOT call `.lean()`.

    const response = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });
});

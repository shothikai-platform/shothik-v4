import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock dependencies
const { mockDbConnect, mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({
    lean: mockLean,
  });
  const mockFind = vi.fn().mockReturnValue({
    sort: mockSort,
  });
  return {
    mockDbConnect: vi.fn(),
    mockFind,
    mockSort,
    mockLean,
  };
});

vi.mock("@/lib/dbConnect", () => ({
  default: () => mockDbConnect(),
}));

vi.mock("@/models/SheetSession", () => ({
  default: {
    find: () => mockFind(),
  },
}));

vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi.fn((data, init) => {
        return {
          status: init?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and return sheet sessions as plain objects with mapped id", async () => {
    const mockSessions = [
      { _id: "session_id_1", title: "Session 1", status: "active" },
      { _id: "session_id_2", title: "Session 2", status: "completed" },
    ];

    mockLean.mockResolvedValueOnce(mockSessions);

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    const response = await GET(request);

    // Verify db connection
    expect(mockDbConnect).toHaveBeenCalledTimes(1);

    // Verify query structure
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalledTimes(1);

    // Verify response processing
    expect(NextResponse.json).toHaveBeenCalledTimes(1);
    const jsonResponse = await response.json();

    // Assert the mapping correctly applies `id` based on `_id`
    expect(jsonResponse).toEqual([
      {
        _id: "session_id_1",
        id: "session_id_1",
        title: "Session 1",
        status: "active",
      },
      {
        _id: "session_id_2",
        id: "session_id_2",
        title: "Session 2",
        status: "completed",
      },
    ]);
    expect(response.status).toBe(200);
  });

  it("should return 500 on internal error", async () => {
    mockDbConnect.mockRejectedValueOnce(new Error("DB Error"));

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({ error: "Internal Server Error" });
  });
});

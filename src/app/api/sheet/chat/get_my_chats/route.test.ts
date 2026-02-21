import { describe, it, expect, vi, beforeEach } from "vitest";

// Set environment variable to avoid dbConnect error during import if mock fails
process.env.MONGODB_URI = "mongodb://localhost:27017/test";

// Mock dbConnect with a factory to prevent original module execution
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/models/SheetSession");
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(),
  },
}));

import { GET } from "./route";
import SheetSession from "@/models/SheetSession";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

describe("GET /api/sheet/chat/get_my_chats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return optimized chat list with mapped fields", async () => {
    const mockDate = new Date().toISOString();
    const mockSessions = [
      {
        _id: "session1",
        title: "Chat 1",
        status: "active",
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      {
        _id: "session2",
        title: "Chat 2",
        status: "active",
        createdAt: mockDate,
        updatedAt: mockDate,
      },
    ];

    const mockChain = {
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockSessions),
    };

    (SheetSession.find as any).mockReturnValue(mockChain);

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    await GET(request);

    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({});
    expect(mockChain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockChain.select).toHaveBeenCalledWith(
      "title status createdAt updatedAt",
    );
    expect(mockChain.lean).toHaveBeenCalled();

    const expectedResponse = mockSessions.map((session) => ({
      ...session,
      id: session._id,
      name: session.title,
    }));

    expect(NextResponse.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should handle errors gracefully", async () => {
    (SheetSession.find as any).mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new Request("http://localhost/api/sheet/chat/get_my_chats");
    await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  });
});

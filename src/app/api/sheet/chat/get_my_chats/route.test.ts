import { GET } from "./route";
import SheetSession from "@/models/SheetSession";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { NextResponse } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({ default: vi.fn() }));
vi.mock("@/models/SheetSession");
vi.mock("@/lib/server-auth");
vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
      })),
    },
  };
});

describe("GET /api/sheet/chat/get_my_chats", () => {
  const mockUser = { _id: "user123" };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
  });

  it("should filter by userId and use lean()", async () => {
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };
    (SheetSession.find as any).mockReturnValue(mockQuery);

    await GET(new Request("http://localhost/api/sheet/chat/get_my_chats"));

    // We expect it to call find({ userId: ... })
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(mockQuery.lean).toHaveBeenCalled();
  });
});

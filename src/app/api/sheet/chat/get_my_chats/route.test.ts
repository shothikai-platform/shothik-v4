import { GET } from "./route";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SheetSession from "@/models/SheetSession";
import { getAuthenticatedUser } from "@/lib/server-auth";

// Mocks
vi.mock("@/models/SheetSession", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

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

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response: any = await GET(
      new Request("http://localhost/api/sheet/chat/get_my_chats"),
    );

    expect(response.status).toBe(401);
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it("should fetch sessions only for the authenticated user", async () => {
    const mockUser = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    const mockLean = vi.fn().mockResolvedValue([{ title: "Session 1" }]);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

    await GET(new Request("http://localhost/api/sheet/chat/get_my_chats"));

    expect(SheetSession.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });
});

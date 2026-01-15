import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server BEFORE importing the route
const mockJson = vi.fn((data, options) => {
  return {
    json: async () => data,
    status: options?.status || 200,
    _data: data,
  };
});

vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: (data: any, options: any) => ({
        json: async () => data,
        status: options?.status || 200,
        _data: data,
      }),
    },
  };
});

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

const mockFindOneAndDelete = vi.fn();
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findOneAndDelete: (query: any) => mockFindOneAndDelete(query),
    },
  };
});

const mockGetAuthenticatedUser = vi.fn();
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

import { DELETE } from "./route";

describe("DELETE /api/research/chat/delete_chat/[id]", () => {
  const mockChatId = "chat-123";
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new Request(
      `http://localhost/api/research/chat/delete_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });
    const data = (response as any)._data;

    expect((response as any).status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if chat not found or not owned by user", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });
    mockFindOneAndDelete.mockResolvedValue(null); // Not found

    const request = new Request(
      `http://localhost/api/research/chat/delete_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect((response as any).status).toBe(404);
    // Verify query contained userId
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: mockChatId,
        userId: mockUserId,
      }),
    );
  });

  it("should return success if chat deleted", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });
    mockFindOneAndDelete.mockResolvedValue({ _id: mockChatId });

    const request = new Request(
      `http://localhost/api/research/chat/delete_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });
    const data = (response as any)._data;

    expect((response as any).status).toBe(200);
    expect(data.success).toBe(true);
  });
});

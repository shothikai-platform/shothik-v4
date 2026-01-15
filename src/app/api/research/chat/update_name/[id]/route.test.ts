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

const mockFindOneAndUpdate = vi.fn();
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findOneAndUpdate: (query: any, update: any, options: any) =>
        mockFindOneAndUpdate(query, update, options),
    },
  };
});

const mockGetAuthenticatedUser = vi.fn();
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

import { PUT } from "./route";

describe("PUT /api/research/chat/update_name/[id]", () => {
  const mockChatId = "chat-123";
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new Request(
      `http://localhost/api/research/chat/update_name/${mockChatId}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await PUT(request, { params });
    const data = (response as any)._data;

    expect((response as any).status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if chat not found or not owned by user", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });
    mockFindOneAndUpdate.mockResolvedValue(null); // Not found

    const request = new Request(
      `http://localhost/api/research/chat/update_name/${mockChatId}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await PUT(request, { params });

    expect((response as any).status).toBe(404);
    // Verify query contained userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: mockChatId,
        userId: mockUserId,
      }),
      expect.any(Object),
      expect.any(Object),
    );
  });

  it("should return updated chat if successful", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });
    mockFindOneAndUpdate.mockResolvedValue({
      _id: mockChatId,
      title: "New Name",
    });

    const request = new Request(
      `http://localhost/api/research/chat/update_name/${mockChatId}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await PUT(request, { params });
    const data = (response as any)._data;

    expect((response as any).status).toBe(200);
    expect(data.title).toBe("New Name");
  });
});

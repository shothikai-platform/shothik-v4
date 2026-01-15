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
      redirect: vi.fn(),
      next: vi.fn(),
    },
  };
});

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

// We need to mock the ResearchChat model completely
const mockFindById = vi.fn();
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findById: (id: string) => mockFindById(id),
    },
  };
});

// Mock server-auth
const mockGetAuthenticatedUser = vi.fn();
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

// Import the route AFTER mocking
import { GET } from "./route";

describe("GET /api/research/chat/get_one_chat/[id]", () => {
  const mockChatId = "chat-123";
  const mockUserId = "user-123";
  const otherUserId = "user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new Request(
      `http://localhost/api/research/chat/get_one_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await GET(request, { params });
    // In our mock, response is the object returned by json()
    // We added _data for easy verification
    const data = (response as any)._data;

    // This assertion expects the FIX.
    // Currently, without fix, it will likely return 200 (if we mock findById to return something) or fail differently.
    // Since we mock findById to return nothing by default (undefined), the current code returns 404.
    // But we want to test that it returns 401 for unauth.

    expect((response as any).status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 403 or 404 if user tries to access another user's chat", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });

    // Chat belongs to otherUserId
    mockFindById.mockResolvedValue({
      _id: mockChatId,
      userId: otherUserId,
      title: "Secret Chat",
    });

    const request = new Request(
      `http://localhost/api/research/chat/get_one_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await GET(request, { params });

    // Should be denied
    expect([403, 404]).toContain((response as any).status);
  });

  it("should return 200 and chat data if user owns the chat", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: mockUserId });

    // Chat belongs to mockUserId
    mockFindById.mockResolvedValue({
      _id: mockChatId,
      userId: mockUserId,
      title: "My Chat",
    });

    const request = new Request(
      `http://localhost/api/research/chat/get_one_chat/${mockChatId}`,
    );
    const params = Promise.resolve({ id: mockChatId });

    const response = await GET(request, { params });
    const data = (response as any)._data;

    expect((response as any).status).toBe(200);
    expect(data._id).toBe(mockChatId);
    expect(data.title).toBe("My Chat");
  });
});

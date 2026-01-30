import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

const {
  mockFindById,
  mockFindOne,
  mockFindByIdAndUpdate,
  mockSave,
  mockGetAuthenticatedUser,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockFindOne: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
  mockSave: vi.fn(),
  mockGetAuthenticatedUser: vi.fn(),
}));

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/models/ResearchChat", () => ({
  default: {
    findById: mockFindById,
    findOne: mockFindOne,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  },
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

describe("POST /api/research/research/create_research_queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should prevent IDOR: return 404/403 if user tries to access another user's chat", async () => {
    // 1. Authenticate as User A
    mockGetAuthenticatedUser.mockResolvedValue({
      _id: "user-A",
      id: "user-A",
      email: "a@example.com",
    });

    // 2. Chat belongs to User B
    const mockChat = {
      _id: "chat-123",
      userId: "user-B", // Different user!
      messages: [],
      save: mockSave,
    };

    // Current implementation calls findById
    mockFindById.mockResolvedValue(mockChat);

    // Future implementation might call findOne({ _id, userId })
    // If it calls findOne with correct params, it should return null because we haven't mocked findOne to return anything yet (default undefined/null).
    // Or we can mock findOne implementation to check args.

    mockFindOne.mockImplementation((query) => {
      if (query._id === "chat-123" && query.userId === "user-A") {
        return null; // Not found because it belongs to user-B
      }
      return null;
    });

    const requestBody = JSON.stringify({
      chat: "chat-123",
      query: "test query",
    });
    const request = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: requestBody,
      },
    );

    const response = await POST(request);

    // If vulnerability exists: returns 200 (Stream) because findById finds the chat.
    // If fixed: returns 404 because findOne fails or explicit check fails.

    expect(response.status).toBe(404);
  });

  it("should allow access if user owns the chat", async () => {
    // 1. Authenticate as User A
    mockGetAuthenticatedUser.mockResolvedValue({
      _id: "user-A",
      id: "user-A",
      email: "a@example.com",
    });

    // 2. Chat belongs to User A
    const mockChat = {
      _id: "chat-123",
      userId: "user-A",
      messages: [],
      save: mockSave,
    };

    // Mock findOne to return the chat if userId matches
    mockFindOne.mockImplementation((query) => {
      if (query._id === "chat-123" && query.userId === "user-A") {
        return mockChat;
      }
      return null;
    });

    const requestBody = JSON.stringify({
      chat: "chat-123",
      query: "test query",
    });
    const request = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: requestBody,
      },
    );

    const response = await POST(request);

    // Should return 200 (Stream)
    expect(response.status).toBe(200);
    // Since it returns a stream, we can check headers
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });
});

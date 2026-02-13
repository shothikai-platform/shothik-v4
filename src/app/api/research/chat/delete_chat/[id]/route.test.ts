import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DELETE } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

const mocks = vi.hoisted(() => {
  return {
    findByIdAndDelete: vi.fn(),
    findOneAndDelete: vi.fn(),
    getAuthenticatedUser: vi.fn(),
  };
});

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findByIdAndDelete: mocks.findByIdAndDelete,
      findOneAndDelete: mocks.findOneAndDelete,
    },
  };
});

// Mock NextResponse to return a simple object we can inspect
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe("DELETE /api/research/chat/delete_chat/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    // Arrange
    mocks.getAuthenticatedUser.mockResolvedValue(null);
    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat-123",
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await DELETE(request, { params });

    // Assert
    expect(response.status).toBe(401);
    expect(mocks.findByIdAndDelete).not.toHaveBeenCalled();
    expect(mocks.findOneAndDelete).not.toHaveBeenCalled();
  });

  it("should return 404 if chat not found or does not belong to user (IDOR protection)", async () => {
    // Arrange
    const user = { _id: "user-123" };
    mocks.getAuthenticatedUser.mockResolvedValue(user);

    // Simulate chat not found (or belonging to another user)
    mocks.findOneAndDelete.mockResolvedValue(null);

    // Also mock findByIdAndDelete for the "before fix" case,
    // but in the "before fix" case, it WOULD find it if we mock it to return something.
    // If we mock it to return a chat, the test fails (because status becomes 200).
    // If we mock it to return null, the test passes (status 404).
    // We want the test to fail initially if the code is vulnerable.
    // The vulnerable code calls `findByIdAndDelete`. If we mock that to return a chat (simulating successful deletion of someone else's chat),
    // it returns 200. We expect 404. So test fails.
    mocks.findByIdAndDelete.mockResolvedValue({
      _id: "chat-123",
      userId: "other-user",
    });

    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat-123",
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await DELETE(request, { params });

    // Assert
    expect(response.status).toBe(404);
  });

  it("should delete chat if it belongs to user", async () => {
    // Arrange
    const user = { _id: "user-123" };
    mocks.getAuthenticatedUser.mockResolvedValue(user);

    const chat = { _id: "chat-123", userId: "user-123" };
    mocks.findOneAndDelete.mockResolvedValue(chat);
    mocks.findByIdAndDelete.mockResolvedValue(chat);

    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat-123",
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await DELETE(request, { params });

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

const mocks = vi.hoisted(() => {
  return {
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
    getAuthenticatedUser: vi.fn(),
  };
});

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findByIdAndUpdate: mocks.findByIdAndUpdate,
      findOneAndUpdate: mocks.findOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe("PUT /api/research/chat/update_name/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    // Arrange
    mocks.getAuthenticatedUser.mockResolvedValue(null);
    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat-123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await PUT(request, { params });

    // Assert
    expect(response.status).toBe(401);
    expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("should return 404 if chat not found or does not belong to user (IDOR protection)", async () => {
    // Arrange
    const user = { _id: "user-123" };
    mocks.getAuthenticatedUser.mockResolvedValue(user);

    // Simulate chat not found via secure method
    mocks.findOneAndUpdate.mockResolvedValue(null);

    // Simulate chat found via insecure method (to verify vulnerability existence before fix)
    mocks.findByIdAndUpdate.mockResolvedValue({
      _id: "chat-123",
      userId: "other-user",
      name: "Old Name",
    });

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat-123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await PUT(request, { params });

    // Assert
    expect(response.status).toBe(404);
  });

  it("should update chat name if it belongs to user", async () => {
    // Arrange
    const user = { _id: "user-123" };
    mocks.getAuthenticatedUser.mockResolvedValue(user);

    const updatedChat = {
      _id: "chat-123",
      userId: "user-123",
      name: "New Name",
    };
    mocks.findOneAndUpdate.mockResolvedValue(updatedChat);

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat-123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );
    const params = Promise.resolve({ id: "chat-123" });

    // Act
    const response: any = await PUT(request, { params });

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedChat);

    // Also verify the update uses the correct field 'name'
    if (mocks.findOneAndUpdate.mock.calls.length > 0) {
      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: "New Name" }), // Ensure we are updating 'name' not 'title'
        expect.anything(),
      );
    }
  });
});

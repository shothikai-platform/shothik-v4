import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndDelete, mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindByIdAndDelete: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findByIdAndDelete: mockFindByIdAndDelete,
      findOneAndDelete: mockFindOneAndDelete,
    },
  };
});

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
    })),
  },
}));

describe("DELETE /api/research/chat/delete_chat/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a chat if user owns it", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock successful deletion
    mockFindOneAndDelete.mockResolvedValue({ _id: "chat123" });

    // Assuming params is a Promise as per Next.js 15
    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat123",
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);
    // Verify we are using the SECURE method
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "chat123",
      userId: "user123",
    });
    // Verify we are NOT using the INSECURE method
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
  });

  it("should return 404 if chat not found or not owned by user", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndDelete.mockResolvedValue(null);

    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat123",
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request, { params });

    expect(response.status).toBe(404);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "chat123",
      userId: "user123",
    });
  });

  it("should return 401 if not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/delete_chat/chat123",
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request, { params });

    expect(response.status).toBe(401);
    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
  });
});

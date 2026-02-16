import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindByIdAndDelete: vi.fn(), // Not used here but consistent with other mocks
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
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

describe("PUT /api/research/chat/update_name/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update chat name if user owns it", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock successful update
    const mockUpdatedChat = { _id: "chat123", name: "New Name" };
    mockFindOneAndUpdate.mockResolvedValue(mockUpdatedChat);

    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, { params });

    expect(response.status).toBe(200);
    // Verify secure method is used
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "chat123", userId: "user123" },
      { name: "New Name" }, // Should use 'name', not 'title'
      { new: true },
    );
    // Verify insecure method is NOT used
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("should return 404 if chat not found or not owned by user", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue(null);

    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, { params });

    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalled();
  });

  it("should return 401 if not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const params = Promise.resolve({ id: "chat123" });
    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat123",
      {
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, { params });

    expect(response.status).toBe(401);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});

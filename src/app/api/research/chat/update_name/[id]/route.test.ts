import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
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

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("PUT /api/research/chat/update_name/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      name: "Updated Chat",
    });

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Chat" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    // Current behavior: 200 (returns chat) because no auth check
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it("should return 404 if chat belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user2" });

    // The db returns a chat belonging to user1.
    // Insecure implementation finds it by ID only.
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      name: "Updated Chat",
    });

    // Secure implementation uses findOneAndUpdate with userId filter, so it should return null.
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Chat" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    // Current behavior: 200 (returns chat found by findByIdAndUpdate)
    // Desired behavior: 404 (Not Found via findOneAndUpdate)
    expect(response.status).toBe(404);
  });

  it("should update name if user is owner", async () => {
    const user = { _id: "user1" };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    // Secure implementation
    mockFindOneAndUpdate.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      name: "Updated Chat",
    });

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Chat" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "chat1", userId: "user1" },
      { name: "Updated Chat" },
      { new: true },
    );
  });
});

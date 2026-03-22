import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("PUT /api/research/chat/update_name/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 404 if chat belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user2" });

    // The findOneAndUpdate won't find the chat because of userId mismatch
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    expect(response.status).toBe(404);
  });

  it("should update chat name and return chat if user is owner", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user1" });

    mockFindOneAndUpdate.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      title: "New Name",
    });

    const request = new Request(
      "http://localhost/api/research/chat/update_name/chat1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      },
    );

    const response = await PUT(request, {
      params: Promise.resolve({ id: "chat1" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe("New Name");
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "chat1", userId: "user1" },
      { title: "New Name" },
      { new: true },
    );
  });
});

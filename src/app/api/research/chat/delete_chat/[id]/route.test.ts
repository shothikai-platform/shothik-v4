import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindOneAndDelete: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findOneAndDelete: mockFindOneAndDelete,
    },
  };
});

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("DELETE /api/research/chat/delete_chat/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
      new Request("http://localhost/api/research/chat/delete_chat/chat1"),
      { params: Promise.resolve({ id: "chat1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("should return 404 if chat belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user2" });

    // The findOneAndDelete won't find the chat because of userId mismatch
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
      new Request("http://localhost/api/research/chat/delete_chat/chat1"),
      { params: Promise.resolve({ id: "chat1" }) },
    );

    expect(response.status).toBe(404);
  });

  it("should delete chat and return success if user is owner", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user1" });

    mockFindOneAndDelete.mockResolvedValue({
      _id: "chat1",
      userId: "user1",
      name: "Chat 1",
    });

    const response = await DELETE(
      new Request("http://localhost/api/research/chat/delete_chat/chat1"),
      { params: Promise.resolve({ id: "chat1" }) },
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "chat1",
      userId: "user1",
    });
  });
});

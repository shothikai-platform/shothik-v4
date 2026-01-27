import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Use vi.hoisted for variables used in mock factory
const { mockFindOne, mockFindById } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindById: vi.fn(),
  };
});

vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findOne: mockFindOne,
      findById: mockFindById,
    },
  };
});

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("GET /api/research/chat/get_one_chat/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const params = Promise.resolve({ id: "chat123" });

    mockFindById.mockResolvedValue({ _id: "chat123", userId: "user456" });

    const response = await GET(
      new Request("http://localhost/api/research/chat/get_one_chat/chat123"),
      { params },
    );

    expect(response.status).toBe(401);
  });

  it("should return 404/403 if chat does not belong to user", async () => {
    const mockUser = { _id: "user123", id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null);
    mockFindById.mockResolvedValue({
      _id: "chat_of_other_user",
      userId: "user999",
    });

    const params = Promise.resolve({ id: "chat_of_other_user" });
    const response = await GET(
      new Request(
        "http://localhost/api/research/chat/get_one_chat/chat_of_other_user",
      ),
      { params },
    );

    expect(response.status).toBe(404);
  });

  it("should return chat if it belongs to user", async () => {
    const mockUser = { _id: "user123", id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = { _id: "chat123", userId: "user123", name: "My Chat" };
    mockFindOne.mockResolvedValue(mockChat);

    const params = Promise.resolve({ id: "chat123" });
    const response = await GET(
      new Request("http://localhost/api/research/chat/get_one_chat/chat123"),
      { params },
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      _id: "chat123",
      userId: "user123",
    });
    expect(response.data).toEqual(mockChat);
  });
});

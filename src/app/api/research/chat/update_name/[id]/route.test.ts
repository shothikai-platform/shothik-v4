import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PUT } from "./route";
import ResearchChat from "@/models/ResearchChat";
import { getAuthenticatedUser } from "@/lib/server-auth";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/models/ResearchChat", () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init, status: init?.status || 200 })),
  },
}));

describe("PUT /api/research/chat/update_name/[id]", () => {
  const mockParams = Promise.resolve({ id: "chat-123" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const req = {
      json: async () => ({ name: "New Name" }),
    } as any;

    const response = await PUT(req, { params: mockParams });

    // The current implementation returns 500 or 200/404 because it lacks auth check.
    // We expect this test to FAIL or return unexpected status until we fix the code.
    // If we were strictly TDDing the bug fix, we'd expect the current code to NOT return 401.

    // For now, let's just inspect what it does. ideally we want to assert 401 eventually.
    // But since this is a reproduction of a bug, let's see if we can catch the lack of security.

    // If the current code doesn't check auth, it will proceed to db call.
    // In our mock, dbConnect is called.

    // To confirm vulnerability, we check that it DID try to call DB without auth.
    // But for the final test suite, we want to assert 401.
    // I will write the test as it SHOULD be (assert 401), so it fails now (Red), then passes later (Green).

    expect(response.status).toBe(401);
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
    expect(ResearchChat.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("should return 404 if chat is not found or not owned by user (IDOR protection)", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: "user-123" });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null); // Simulate not found for this user

    const req = {
      json: async () => ({ name: "New Name" }),
    } as any;

    const response = await PUT(req, { params: mockParams });

    expect(response.status).toBe(404);
    // Crucially, it should use findOneAndUpdate with userId constraint
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "chat-123", userId: "user-123" }),
      expect.any(Object),
      expect.any(Object),
    );
  });

  it("should return 400 if name is missing or empty", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: "user-123" });

    const req = {
      json: async () => ({ name: "" }),
    } as any;

    const response = await PUT(req, { params: mockParams });

    expect(response.status).toBe(400);
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("should successfully update name when authorized", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: "user-123" });
    const mockChat = {
      _id: "chat-123",
      userId: "user-123",
      name: "Updated Name",
    };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockChat);

    const req = {
      json: async () => ({ name: "Updated Name" }),
    } as any;

    const response = await PUT(req, { params: mockParams });

    expect(response.status).toBe(200);
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "chat-123", userId: "user-123" },
      { name: "Updated Name" },
      { new: true },
    );
    expect(response.body).toEqual(mockChat);
  });
});

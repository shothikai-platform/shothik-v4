import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { getAuthenticatedUser } from "@/lib/server-auth";
import dbConnect from "@/lib/dbConnect";
import ResearchChat from "@/models/ResearchChat";

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/models/ResearchChat", () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe("PUT /api/research/chat/update_name/[id]", () => {
  const mockId = "chat123";
  const mockUserId = "user123";
  const mockParams = Promise.resolve({ id: mockId });
  const mockNewName = "New Chat Name";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any) =>
    new Request(
      "http://localhost:3000/api/research/chat/update_name/" + mockId,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = createMockRequest({ name: mockNewName });
    const response = await PUT(request, { params: mockParams });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("should return 404 if chat is not found or does not belong to user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = createMockRequest({ name: mockNewName });
    const response = await PUT(request, { params: mockParams });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Chat not found");
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockId, userId: mockUserId },
      { title: mockNewName },
      { new: true },
    );
  });

  it("should update and return chat if user owns it", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    const mockUpdatedChat = {
      _id: mockId,
      title: mockNewName,
      userId: mockUserId,
    };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const request = createMockRequest({ name: mockNewName });
    const response = await PUT(request, { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe(mockNewName);
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockId, userId: mockUserId },
      { title: mockNewName },
      { new: true },
    );
  });

  it("should return 500 on database error", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockRejectedValue(
      new Error("DB Error"),
    );

    const request = createMockRequest({ name: mockNewName });
    const response = await PUT(request, { params: mockParams });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed");
  });
});

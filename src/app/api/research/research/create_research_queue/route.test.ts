import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockFindOne, mockFindOneAndUpdate, mockSave } =
  vi.hoisted(() => {
    return {
      mockFindById: vi.fn(),
      mockFindOne: vi.fn(),
      mockFindOneAndUpdate: vi.fn(),
      mockSave: vi.fn(),
    };
  });

vi.mock("@/models/ResearchChat", () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
      findByIdAndUpdate: vi.fn(),
    },
  };
});

vi.mock("next/server", () => {
  class MockNextResponse {
    body: any;
    status: number;
    headers: any;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers || {};
    }
    static json(data: any, init?: any) {
      return { data, status: init?.status || 200 };
    }
  }
  return {
    NextResponse: MockNextResponse,
  };
});

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("POST /api/research/research/create_research_queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat123", query: "test query" }),
      },
    );

    const res: any = await POST(req);
    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if chatId or query is missing or invalid", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user123" });

    const req1 = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ query: "test query" }),
      },
    );

    const res1: any = await POST(req1);
    expect(res1.status).toBe(400);

    const req2 = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat123", query: "   " }),
      },
    );

    const res2: any = await POST(req2);
    expect(res2.status).toBe(400);
  });

  it("should return 404 if chat is not found or belongs to another user", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user123" });
    mockFindOne.mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat123", query: "test query" }),
      },
    );

    const res: any = await POST(req);
    expect(mockFindOne).toHaveBeenCalledWith({
      _id: "chat123",
      userId: "user123",
    });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "Chat not found" });
  });

  it("should save user message and return stream when valid", async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: "user123" });
    const fakeChat = {
      _id: "chat123",
      userId: "user123",
      messages: [],
      save: mockSave.mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(fakeChat);

    const req = new Request(
      "http://localhost/api/research/research/create_research_queue",
      {
        method: "POST",
        body: JSON.stringify({ chat: "chat123", query: "test query" }),
      },
    );

    const res: any = await POST(req);
    expect(res.status).toBe(200);
    expect(fakeChat.messages).toHaveLength(1);
    expect(fakeChat.messages[0].content).toBe("test query");
    expect(mockSave).toHaveBeenCalled();
  });
});

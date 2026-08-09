import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock dependencies
vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreateSession, mockSaveSession } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockSaveSession: vi.fn(),
  };
});

const { mockCreateConversation, mockSaveConversation } = vi.hoisted(() => {
  return {
    mockCreateConversation: vi.fn(),
    mockSaveConversation: vi.fn(),
  };
});

// Mock SheetSession model
vi.mock("@/models/SheetSession", () => {
  return {
    default: {
      findOne: mockFindOne,
      create: mockCreateSession,
    },
  };
});

// Mock SheetConversation model
vi.mock("@/models/SheetConversation", () => {
  return {
    default: {
      create: mockCreateConversation,
    },
  };
});

// Mock NextResponse to support both constructor 'new NextResponse()' and static method '.json()'
const { MockNextResponse } = vi.hoisted(() => {
  class MockResponse {
    body: any;
    headers: any;
    status: number;

    constructor(body: any, init: any) {
      this.body = body;
      this.headers = init?.headers;
      this.status = init?.status || 200;
    }

    static json(data: any, options: any) {
      return {
        data,
        options,
        status: options?.status || 200,
      };
    }
  }

  return { MockNextResponse: MockResponse };
});

vi.mock("next/server", () => ({
  NextResponse: MockNextResponse,
}));

import { getAuthenticatedUser } from "@/lib/server-auth";

describe("POST /api/sheet/conversation/create_conversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateSession.mockResolvedValue({
      _id: "session_new",
      userId: "user123",
      title: "New prompt test",
      save: mockSaveSession,
    });

    mockCreateConversation.mockResolvedValue({
      _id: "conv123",
      sessionId: "session_new",
      prompt: "New prompt test",
      events: [],
      status: "generating",
      save: mockSaveConversation,
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/sheet/conversation/create_conversation",
      {
        method: "POST",
        body: JSON.stringify({ prompt: "test prompt" }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("should return 404 if chatId is provided but is not owned by user (BOLA protection)", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null); // Not found or belongs to someone else

    const req = new Request(
      "http://localhost/api/sheet/conversation/create_conversation",
      {
        method: "POST",
        body: JSON.stringify({ prompt: "test prompt", chat: "other_chat_id" }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({
      _id: "other_chat_id",
      userId: "user123",
    });
  });

  it("should create session with correct user ID if chatId is not provided", async () => {
    const mockUser = { _id: "user123" };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const req = new Request(
      "http://localhost/api/sheet/conversation/create_conversation",
      {
        method: "POST",
        body: JSON.stringify({ prompt: "test prompt" }),
      },
    );

    const response = await POST(req);
    expect(mockCreateSession).toHaveBeenCalledWith({
      userId: "user123",
      title: "test prompt",
    });
    expect(response).toBeDefined();
  });
});

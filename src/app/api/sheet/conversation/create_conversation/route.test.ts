import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import SheetSession from "@/models/SheetSession";
import SheetConversation from "@/models/SheetConversation";
import * as serverAuth from "@/lib/server-auth";

// Mock modules
vi.mock("@/lib/dbConnect", () => ({ default: vi.fn() }));
vi.mock("@/models/SheetSession");
vi.mock("@/models/SheetConversation");
vi.mock("@/lib/server-auth");
vi.mock("next/server", () => {
  return {
    NextResponse: class {
      constructor(body: any, init?: any) {
        // @ts-ignore
        this.body = body;
        // @ts-ignore
        this.init = init;
      }
      static json(body: any, init?: any) {
        return { body, init, json: true };
      }
    },
  };
});

describe("POST /api/sheet/conversation/create_conversation", () => {
  let req: any;
  const mockUser: any = { _id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.resetAllMocks();
    req = {
      json: vi.fn().mockResolvedValue({ prompt: "test prompt" }),
    };
    (SheetSession.create as any) = vi.fn();
    (SheetSession.findById as any) = vi.fn();
    (SheetSession.findOne as any) = vi.fn();
    (SheetConversation.create as any) = vi.fn().mockResolvedValue({
      _id: "conv-123",
      events: [],
      save: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue(null);

    const response: any = await POST(req);

    expect(response.init?.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("should create a new session with correct userId when no chatId provided", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue(mockUser);
    (SheetSession.create as any).mockResolvedValue({
      _id: "session-123",
      title: "New Spreadsheet",
    });

    await POST(req);

    expect(SheetSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser._id,
        title: expect.any(String),
      }),
    );
  });

  it("should find existing session only if it belongs to user", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue(mockUser);
    req.json.mockResolvedValue({ prompt: "test", chat: "chat-123" });

    const mockSession = { _id: "chat-123", save: vi.fn() };
    (SheetSession.findOne as any) = vi.fn().mockResolvedValue(mockSession);

    await POST(req);

    // This expects the FIX to be in place.
    // Before the fix, this test would fail because it calls findById instead of findOne,
    // or we assert that findById is NOT called.
    expect(SheetSession.findOne).toHaveBeenCalledWith({
      _id: "chat-123",
      userId: mockUser._id,
    });
    expect(SheetSession.findById).not.toHaveBeenCalled();
  });

  it("should create new session if existing session not found (or not owned)", async () => {
    vi.spyOn(serverAuth, "getAuthenticatedUser").mockResolvedValue(mockUser);
    req.json.mockResolvedValue({ prompt: "test", chat: "chat-123" });

    // Mock findOne to return null (not found or not owned)
    (SheetSession.findOne as any) = vi.fn().mockResolvedValue(null);
    (SheetSession.create as any).mockResolvedValue({ _id: "new-session-123" });

    await POST(req);

    expect(SheetSession.findOne).toHaveBeenCalledWith({
      _id: "chat-123",
      userId: mockUser._id,
    });
    expect(SheetSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser._id,
      }),
    );
  });
});

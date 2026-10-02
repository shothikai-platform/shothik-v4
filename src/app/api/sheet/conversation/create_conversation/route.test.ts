import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock('next/server', () => {
  class MockNextResponse {
    body: any;
    headers: any;
    status: number;

    constructor(body?: any, init?: any) {
      this.body = body;
      this.headers = init?.headers || {};
      this.status = init?.status || 200;
    }

    static json(data: any, options?: any) {
      return {
        data,
        status: options?.status || 200,
      };
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create budget sheet' }),
    });

    const res: any = await POST(req);
    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if prompt is missing or invalid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' });

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: '   ' }),
    });

    const res: any = await POST(req);
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ error: 'Prompt is required' });
  });

  it('should return 404 on IDOR attempt (session not found or owned by another user)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' });
    (SheetSession.findOne as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Update sheet', chat: 'otherUserSessionId' }),
    });

    const res: any = await POST(req);
    expect(SheetSession.findOne).toHaveBeenCalledWith({ _id: 'otherUserSessionId', userId: 'user123' });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: 'Session not found' });
  });

  it('should successfully create session and conversation when authenticated and valid', async () => {
    const mockUser = { id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = { _id: 'session123', title: 'New Spreadsheet', save: vi.fn() };
    const mockConversation = { _id: 'conv123', events: [], save: vi.fn() };

    (SheetSession.create as any).mockResolvedValue(mockSession);
    (SheetConversation.create as any).mockResolvedValue(mockConversation);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create sales sheet' }),
    });

    const res: any = await POST(req);
    expect(res.status).toBe(200);
    expect(SheetSession.create).toHaveBeenCalledWith({
      userId: 'user123',
      title: 'Create sales sheet',
    });
    expect(SheetConversation.create).toHaveBeenCalledWith({
      sessionId: 'session123',
      prompt: 'Create sales sheet',
      events: expect.any(Array),
      status: 'generating',
    });
  });
});

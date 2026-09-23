import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

vi.mock('next/server', () => {
  class MockNextResponse {
    body: any;
    init: any;
    status: number;
    constructor(body?: any, init?: any) {
      this.body = body;
      this.init = init;
      this.status = init?.status || 200;
    }
    static json(data: any, options?: any) {
      return new MockNextResponse(data, { ...options, status: options?.status || 200, isJson: true });
    }
  }
  return {
    NextResponse: MockNextResponse,
  };
});

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat123', query: 'Quantum Computing' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 when input parameters are missing or invalid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: '', query: '  ' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 404 when chat is not found or belongs to another user (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOne.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat_belonging_to_other', query: 'AI Security' }),
    });

    const res = await POST(req);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat_belonging_to_other', userId: 'user123' });
    expect(res.status).toBe(404);
  });

  it('should append user message and return stream when user is authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    const mockChat = {
      _id: 'chat123',
      userId: 'user123',
      messages: [],
      save: vi.fn().mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(mockChat);

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat123', query: 'AI Security' }),
    });

    const res = await POST(req);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(mockChat.messages.length).toBe(1);
    expect(mockChat.messages[0].content).toBe('AI Security');
    expect(mockChat.save).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});

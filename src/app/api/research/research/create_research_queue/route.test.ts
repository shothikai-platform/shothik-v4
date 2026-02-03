import { describe, it, expect, vi, afterEach } from 'vitest';
import { POST } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', async () => {
  return {
    NextResponse: class {
      status: number;
      body: any;
      constructor(body: any, init: any) {
        this.body = body;
        this.status = init?.status || 200;
      }
      static json(data: any, init: any) {
        return {
          status: init?.status || 200,
          data,
          json: async () => data,
        };
      }
    },
  };
});

describe('POST /api/research/research/create_research_queue - Security Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({
        chat: 'chat-123',
        query: 'test query',
        config: {},
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
    expect(ResearchChat.findOne).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    const mockUser = { _id: 'user-123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({
        chat: 'chat-456',
        query: 'test query',
        config: {},
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(response.data).toEqual({ error: 'Chat not found' });
    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-456', userId: 'user-123' });
  });

  it('should proceed (return stream) if authenticated and chat belongs to user', async () => {
    const mockUser = { _id: 'user-123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = {
      _id: 'chat-123',
      userId: 'user-123',
      messages: [],
      save: vi.fn(),
    };
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify({
        chat: 'chat-123',
        query: 'test query',
        config: {},
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // Verify security check
    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-123' });

    // Verify functionality
    expect(mockChat.messages).toHaveLength(1);
    expect(mockChat.messages[0].content).toBe('test query');
    expect(mockChat.save).toHaveBeenCalled();
  });
});

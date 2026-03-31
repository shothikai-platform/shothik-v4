
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body, init) {
                this.body = body;
                this.status = init?.status || 200;
                this.headers = init?.headers;
            }
            static json(data, options) {
                return { data, options, status: options?.status || 200 };
            }
        }
    }
});

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test' })
        })
    );

    expect(ResearchChat.findOne).toHaveBeenCalledWith({
        _id: 'chat123',
        userId: 'user123'
    });
    expect(response.status).toBe(404);
  });

  it('should return stream if user is owner', async () => {
    const mockUser = { _id: 'user123' };
    const mockChat = {
        _id: 'chat123',
        messages: [],
        save: vi.fn().mockResolvedValue({})
    };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test' })
        })
    );

    expect(response.status).toBe(200);
    expect(mockChat.save).toHaveBeenCalled();
  });
});

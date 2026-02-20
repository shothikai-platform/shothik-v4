
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockFindOneAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    NextResponse: class {
      constructor(body, init) {
        this.body = body;
        this.init = init;
        this.status = init?.status || 200;
      }
      static json(body, init) {
        return { body, init, status: init?.status || 200, json: () => Promise.resolve(body) };
      }
    },
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = {
      json: async () => ({ chat: 'chat1', query: 'test query' }),
    } as any;

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const request = {
      json: async () => ({ chat: 'chat1', query: 'test query' }),
    } as any;

    const response = await POST(request);
    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
  });

  it('should return 200 (stream) if chat is valid and belongs to user', async () => {
    const user = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    const mockChat = {
      _id: 'chat1',
      userId: 'user1',
      messages: [],
      save: mockSave,
    };
    mockFindOne.mockResolvedValue(mockChat);

    const request = {
      json: async () => ({ chat: 'chat1', query: 'test query' }),
    } as any;

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(mockSave).toHaveBeenCalled();
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockSave, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockSave: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
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
vi.mock('next/server', () => {
    class MockNextResponse {
        stream: any;
        options: any;
        status: number;
        constructor(stream: any, options: any) {
            this.stream = stream;
            this.options = options;
            this.status = options?.status || 200;
        }
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200 };
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: '123', query: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should verify ownership when starting research', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = {
        _id: '123',
        messages: [],
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: '123', query: 'test' })
    }));

    expect(mockFindOne).toHaveBeenCalledWith({
        _id: '123',
        userId: 'user123'
    });
    expect(response.status).toBe(200);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: '123', query: 'test' })
    }));

    expect(response.status).toBe(404);
  });
});

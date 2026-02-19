
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

// Hoist mocks for model
const { mockFindById, mockFindOne, mockFindByIdAndUpdate, mockFindOneAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
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

        const request = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test', config: {} })
        });

        // Mock findById to find something so it doesn't fail with 404 if auth is skipped
        mockFindById.mockResolvedValue({
            _id: 'chat1',
            userId: 'user1',
            messages: [],
            save: mockSave
        });

        const response = await POST(request);

        // Expect 401 Unauthorized
        expect((response as any).status).toBe(401);
    });

    it('should return 404 if chat belongs to another user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

        // Setup mock to return a chat that belongs to user2
        // In vulnerable code, findById returns this chat.
        const mockChat = {
            _id: 'chat1',
            userId: 'user2', // Different user
            messages: [],
            save: mockSave
        };

        mockFindById.mockResolvedValue(mockChat);

        // In secure code, findOne({ _id: chat1, userId: user1 }) returns null
        mockFindOne.mockResolvedValue(null);

        const request = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test', config: {} })
        });

        const response = await POST(request);

        // Expect 404 Not Found (IDOR protection)
        expect((response as any).status).toBe(404);
    });
});

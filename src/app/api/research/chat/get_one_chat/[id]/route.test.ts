import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock Next.js server components
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
        },
    };
});

// Mock database connection
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Mock Auth
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock Mongoose Model
const mockFindOne = vi.fn();

vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findOne: (...args) => mockFindOne(...args),
        },
    };
});

describe('GET /api/research/chat/get_one_chat/[id]', () => {
    const mockChatId = 'chat-123';
    const mockUserId = 'user-456';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);
        const params = Promise.resolve({ id: mockChatId });
        const response = await GET({} as Request, { params });

        expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user (IDOR protection)', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        // Mock findOne to return null because the query { _id: id, userId: user._id } won't match
        mockFindOne.mockResolvedValue(null);

        const params = Promise.resolve({ id: mockChatId });
        const response = await GET({} as Request, { params });

        expect(response.status).toBe(404);
        expect(mockFindOne).toHaveBeenCalledWith({ _id: mockChatId, userId: mockUserId });
    });

    it('should return chat if owned by user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        mockFindOne.mockResolvedValue({ _id: mockChatId, userId: mockUserId });

        const params = Promise.resolve({ id: mockChatId });
        const response = await GET({} as Request, { params });

        expect(response.status).toBe(200);
        expect(mockFindOne).toHaveBeenCalledWith({ _id: mockChatId, userId: mockUserId });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
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
const mockFindOneAndDelete = vi.fn();

vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findOneAndDelete: (...args) => mockFindOneAndDelete(...args),
        },
    };
});

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    const mockChatId = 'chat-123';
    const mockUserId = 'user-456';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);
        const params = Promise.resolve({ id: mockChatId });
        const response = await DELETE({} as Request, { params });

        expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user or not found', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        // Mock findOneAndDelete to return null (not found or not owned)
        mockFindOneAndDelete.mockResolvedValue(null);

        const params = Promise.resolve({ id: mockChatId });
        const response = await DELETE({} as Request, { params });

        expect(response.status).toBe(404);
        expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: mockChatId, userId: mockUserId });
    });

    it('should delete chat if owned by user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        mockFindOneAndDelete.mockResolvedValue({ _id: mockChatId });

        const params = Promise.resolve({ id: mockChatId });
        const response = await DELETE({} as Request, { params });

        expect(response.status).toBe(200);
        expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: mockChatId, userId: mockUserId });
    });
});

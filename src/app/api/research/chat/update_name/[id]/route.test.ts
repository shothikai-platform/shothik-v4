import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
const mockFindOneAndUpdate = vi.fn();

vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findOneAndUpdate: (...args) => mockFindOneAndUpdate(...args),
        },
    };
});

describe('PUT /api/research/chat/update_name/[id]', () => {
    const mockChatId = 'chat-123';
    const mockUserId = 'user-456';
    const mockName = 'New Chat Name';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);
        const params = Promise.resolve({ id: mockChatId });
        const request = {
            json: async () => ({ name: mockName })
        } as Request;

        const response = await PUT(request, { params });

        expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user or not found', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        mockFindOneAndUpdate.mockResolvedValue(null);

        const params = Promise.resolve({ id: mockChatId });
        const request = {
            json: async () => ({ name: mockName })
        } as Request;

        const response = await PUT(request, { params });

        expect(response.status).toBe(404);
        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockChatId, userId: mockUserId },
            expect.anything(),
            expect.anything()
        );
    });

    it('should update chat name if owned by user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

        mockFindOneAndUpdate.mockResolvedValue({ _id: mockChatId, name: mockName });

        const params = Promise.resolve({ id: mockChatId });
        const request = {
            json: async () => ({ name: mockName })
        } as Request;

        const response = await PUT(request, { params });

        expect(response.status).toBe(200);
        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockChatId, userId: mockUserId },
            { name: mockName },
            { new: true }
        );
    });
});

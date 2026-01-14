
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';

// Mock NextResponse
vi.mock('next/server', () => {
    const json = vi.fn((data, options) => ({ data, options, status: options?.status || 200 }));
    return {
        NextResponse: {
            json: json,
        },
    };
});

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Mock ResearchChat model
vi.mock('@/models/ResearchChat', () => ({
    default: {
        findById: vi.fn(),
    },
}));

// Mock server-auth
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/research/chat/get_one_chat/[id]', () => {
    const mockChatId = 'chat-123';
    const mockUserId = 'user-456';
    const otherUserId = 'user-789';

    const mockChat = {
        _id: mockChatId,
        userId: mockUserId,
        name: 'Test Chat',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${mockChatId}`);
        const params = Promise.resolve({ id: mockChatId });

        const response = await GET(request, { params });

        expect(response.status).toBe(401);
        expect(response.data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404/403 if chat belongs to another user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: otherUserId });
        (ResearchChat.findById as any).mockResolvedValue(mockChat);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${mockChatId}`);
        const params = Promise.resolve({ id: mockChatId });

        const response = await GET(request, { params });

        // Ideally 404 to avoid leaking existence, or 403.
        // For now, let's assume we want to deny access.
        expect(response.status).toBe(404);
    });

    it('should return the chat if it belongs to the authenticated user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
        (ResearchChat.findById as any).mockResolvedValue(mockChat);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${mockChatId}`);
        const params = Promise.resolve({ id: mockChatId });

        const response = await GET(request, { params });

        expect(response.status).toBe(200);
        expect(response.data).toEqual(mockChat);
    });
});

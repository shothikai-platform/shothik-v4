import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

const mockSort = vi.hoisted(() => vi.fn().mockReturnThis());
const mockLean = vi.hoisted(() => vi.fn());
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort, lean: mockLean }));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should fetch chats scoped by userId if authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', email: 'test@test.com', name: 'Test' });

        const mockSessions = [{ _id: 'chat1', title: 'Chat 1' }];
        mockLean.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
        const data = await response.json();
        expect(data).toEqual(mockSessions);
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn(),
    },
}));

vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        status: number;
        constructor(body: any, init?: { status?: number }) {
            this.body = body;
            this.status = init?.status || 200;
        }
        static json(body: any, init?: { status?: number }) {
            return new MockNextResponse(body, init);
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request) as unknown as { status: number, body: any };

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Unauthorized' });
        expect(dbConnect).not.toHaveBeenCalled();
        expect(SheetSession.find).not.toHaveBeenCalled();
    });

    it('should fetch sessions scoped to the authenticated user ID and return 200', async () => {
        const mockUser = { id: 'user-123', _id: 'user-123' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);

        const mockSessions = [
            { _id: 'session1', userId: 'user-123', title: 'Chat 1' },
            { _id: 'session2', userId: 'user-123', title: 'Chat 2' },
        ];

        // Setup chainable mongoose mock: find().sort().lean()
        const mockLean = vi.fn().mockResolvedValue(mockSessions);
        const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
        vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request) as unknown as { status: number, body: any };

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(dbConnect).toHaveBeenCalled();

        // Assert scoped query
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockSessions);
    });

    it('should return 500 if an error occurs during database operations', async () => {
        const mockUser = { id: 'user-123', _id: 'user-123' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);

        vi.mocked(dbConnect).mockRejectedValue(new Error('DB Error'));

        // Suppress console.error for this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request) as unknown as { status: number, body: any };

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error' });

        console.error = originalConsoleError;
    });
});

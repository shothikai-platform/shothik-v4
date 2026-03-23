import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn(),
    },
}));

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => {
                return {
                    status: options?.status || 200,
                    json: async () => data,
                };
            }),
        },
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
        expect(dbConnect).not.toHaveBeenCalled();
        expect(SheetSession.find).not.toHaveBeenCalled();
    });

    it('should return sessions filtered by userId if authenticated', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Session 1', userId: 'user123' },
            { _id: 'session2', title: 'Session 2', userId: 'user123' },
        ];

        const mockSort = vi.fn().mockResolvedValue(mockSessions);
        vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockSessions);
        expect(dbConnect).toHaveBeenCalledTimes(1);
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    });

    it('should fallback to user.id if user._id is not available', async () => {
        const mockUser = { id: 'user456', email: 'test@example.com' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

        const mockSort = vi.fn().mockResolvedValue([]);
        vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        await GET(request);

        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user456' });
    });

    it('should return 500 on database error', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' });
        vi.mocked(dbConnect).mockRejectedValue(new Error('DB connection failed'));

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

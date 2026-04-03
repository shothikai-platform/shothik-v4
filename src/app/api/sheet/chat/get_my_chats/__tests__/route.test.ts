import { expect, describe, it, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn()
}));

const mockSort = vi.hoisted(() => vi.fn());
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(null);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return user sessions if authenticated', async () => {
        const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Chat 1' },
            { _id: 'session2', title: 'Chat 2' }
        ];
        mockSort.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data).toEqual(mockSessions);
        expect(dbConnect).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    });

    it('should handle missing _id and fallback to id', async () => {
        const mockUser = { id: 'user456', name: 'Test User', email: 'test@example.com' } as any;
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);
        mockSort.mockResolvedValueOnce([]);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        await GET(request);

        expect(mockFind).toHaveBeenCalledWith({ userId: 'user456' });
    });

    it('should return 500 on internal server error', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

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
    default: vi.fn(),
}));

// Mock the chained Mongoose methods
const mockSort = vi.fn();
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn().mockReturnValue({
            sort: (...args: any[]) => mockSort(...args)
        })
    }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should fetch and return chats sorted by updatedAt for authenticated user', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com', name: 'Test User' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Chat 1' },
            { _id: 'session2', title: 'Chat 2' }
        ];
        mockSort.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(200);
        const data = await response.json();

        expect(dbConnect).toHaveBeenCalled();
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(data).toEqual(mockSessions);
    });

    it('should return 500 Internal Server Error if an error occurs', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com', name: 'Test User' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);
        vi.mocked(dbConnect).mockRejectedValue(new Error('Database error'));

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

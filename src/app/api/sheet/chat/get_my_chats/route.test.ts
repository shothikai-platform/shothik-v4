import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock getAuthenticatedUser
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser,
}));

// Mock dbConnect
const mockDbConnect = vi.hoisted(() => vi.fn());
vi.mock('@/lib/dbConnect', () => ({
    default: mockDbConnect,
}));

// Mock SheetSession
const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

// Mock NextResponse
const mockJson = vi.hoisted(() => vi.fn());
vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson.mockImplementation((data, options) => ({
            ...options,
            json: async () => data,
        })),
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValue(null);

        const request = new Request('http://localhost');
        const response = await GET(request);
        const data = await response.json();

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 500 if there is an error fetching sessions', async () => {
        const mockUser = { _id: 'user123', name: 'Test User' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);
        mockDbConnect.mockRejectedValueOnce(new Error('Database error'));

        const request = new Request('http://localhost');
        const response = await GET(request);
        const data = await response.json();

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal Server Error' });
    });

    it('should fetch and return the user\'s sessions correctly formatted', async () => {
        const mockUser = { _id: 'user123', name: 'Test User' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);
        mockDbConnect.mockResolvedValueOnce(true);

        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', status: 'active' },
            { _id: 'session2', title: 'Chat 2', status: 'active' }
        ];

        mockLean.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost');
        const response = await GET(request);
        const data = await response.json();

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(mockDbConnect).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(data).toEqual([
            { _id: 'session1', title: 'Chat 1', status: 'active', id: 'session1' },
            { _id: 'session2', title: 'Chat 2', status: 'active', id: 'session2' }
        ]);

        // Assert json() does not have a status if options weren't provided in successful return
        expect(response.status).toBeUndefined();
    });
});

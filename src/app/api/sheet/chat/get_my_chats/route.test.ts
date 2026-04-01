import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET } from './route';

const mockJson = vi.hoisted(() => vi.fn().mockImplementation((data, init) => {
    return {
        data,
        status: init?.status || 200,
        json: async () => data
    };
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson
    }
}));

const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser
}));

const mockFind = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn());

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn()
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFind.mockReturnValue({ sort: mockSort });
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request) as any;

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(response.data).toEqual({ error: 'Unauthorized' });
    });

    it('should fetch chats filtered by authenticated user ID', async () => {
        const mockUser = { _id: 'user123', name: 'Test User' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

        const mockSessions = [{ id: 'session1', title: 'Chat 1' }, { id: 'session2', title: 'Chat 2' }];
        mockSort.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request) as any;

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(response.status).toBe(200);
        expect(response.data).toEqual(mockSessions);
    });
});

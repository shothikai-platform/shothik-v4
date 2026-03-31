import { test, expect, vi, describe, beforeEach } from 'vitest';
import { GET } from './route';

const mockUser = {
    _id: 'user123',
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com'
};

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
    const lean = vi.fn();
    const sort = vi.fn().mockReturnValue({ lean });
    const find = vi.fn().mockReturnValue({ sort });
    return { mockFind: find, mockSort: sort, mockLean: lean };
});

const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());
const mockDbConnect = vi.hoisted(() => vi.fn());
const mockNextResponseJson = vi.hoisted(() => vi.fn((data, options) => {
    return {
        ...options,
        json: async () => data
    };
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser
}));

vi.mock('@/lib/dbConnect', () => ({
    default: mockDbConnect
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockNextResponseJson
    }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns 401 if user is not authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    test('returns 500 if an error occurs during fetching', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);
        mockDbConnect.mockRejectedValueOnce(new Error('DB Error'));

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockNextResponseJson).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
    });

    test('returns sessions mapped with stringified id for the authenticated user', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', userId: 'user123' },
            { _id: 'session2', title: 'Chat 2', userId: 'user123' }
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(mockDbConnect).toHaveBeenCalled();

        expect(mockFind).toHaveBeenCalledWith({ userId: mockUser._id });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(mockNextResponseJson).toHaveBeenCalledWith([
            { _id: 'session1', id: 'session1', title: 'Chat 1', userId: 'user123' },
            { _id: 'session2', id: 'session2', title: 'Chat 2', userId: 'user123' }
        ]);
    });
});

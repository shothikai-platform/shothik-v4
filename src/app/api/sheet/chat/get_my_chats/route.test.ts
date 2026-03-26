import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Hoist mocks before module instantiation
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());
const mockJson = vi.hoisted(() => vi.fn());
const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser,
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson,
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is unauthorized', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(null);

        await GET({} as Request);

        expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    it('should fetch, lean, map, and return sessions for an authenticated user', async () => {
        const mockUser = { _id: 'user123' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Session 1' },
            { _id: 'session2', title: 'Session 2' },
        ];
        mockLean.mockResolvedValueOnce(mockSessions);

        await GET({} as Request);

        expect(mockFind).toHaveBeenCalledWith({ userId: mockUser._id });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(mockJson).toHaveBeenCalledWith([
            { _id: 'session1', title: 'Session 1', id: 'session1' },
            { _id: 'session2', title: 'Session 2', id: 'session2' },
        ]);
    });

    it('should handle internal server errors gracefully', async () => {
        const mockUser = { _id: 'user123' };
        mockGetAuthenticatedUser.mockResolvedValueOnce(mockUser);

        mockFind.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        await GET({} as Request);

        expect(mockJson).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
    });
});

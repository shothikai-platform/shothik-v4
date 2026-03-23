import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
const { mockJson, mockSort, mockFind } = vi.hoisted(() => {
    const mockJson = vi.fn((data, options) => ({
        json: async () => data,
        status: options?.status || 200,
    }));
    const mockSort = vi.fn();
    const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
    return { mockJson, mockSort, mockFind };
});

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson,
    },
}));

// Mock SheetSession query
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: (...args: any[]) => mockFind(...args),
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockJson.mockClear();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(mockJson).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        expect(response.status).toBe(401);
    });

    it('should fetch user-specific chats sorted by updatedAt -1', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', userId: 'user123' },
            { _id: 'session2', title: 'Chat 2', userId: 'user123' },
        ];
        mockSort.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(dbConnect).toHaveBeenCalled();
        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

        expect(mockJson).toHaveBeenCalledWith(mockSessions);
        const data = await response.json();
        expect(data).toEqual(mockSessions);
    });

    it('should return 500 on database error', async () => {
        (getAuthenticatedUser as any).mockRejectedValue(new Error('Database error'));

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockJson).toHaveBeenCalledWith(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        expect(response.status).toBe(500);
    });
});

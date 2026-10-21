import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSort } = vi.hoisted(() => {
    return {
        mockFind: vi.fn(),
        mockSort: vi.fn(),
    };
});

// Mock SheetSession model
vi.mock('@/models/SheetSession', () => {
    return {
        default: {
            find: mockFind,
        },
    };
});

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSort.mockResolvedValue([{ _id: 'session1', userId: 'user123', title: 'Sheet 1' }]);
        mockFind.mockReturnValue({ sort: mockSort });
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(401);
        expect((response as any).data).toEqual({ error: 'Unauthorized' });
    });

    it('should return sessions scoped to the authenticated user ID (IDOR protection)', async () => {
        const mockUser = { id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect((response as any).data).toEqual([{ _id: 'session1', userId: 'user123', title: 'Sheet 1' }]);
    });
});

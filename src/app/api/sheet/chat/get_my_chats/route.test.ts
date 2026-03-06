import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
    return {
        mockFind: vi.fn(),
        mockSort: vi.fn(),
        mockLean: vi.fn(),
    };
});

// Mock Mongoose model
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

        // Setup generic mock chain
        mockLean.mockResolvedValue([{ _id: '1', title: 'Session 1' }]);
        mockSort.mockReturnValue({ lean: mockLean });

        // Default behavior for find: return object with sort
        mockFind.mockReturnValue({
            sort: mockSort
        });
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(401);
    });

    it('should fetch sessions filtered by user ID and optimize with .lean()', async () => {
        const mockUser = { _id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        // Verify IDOR fix - ensures we are only fetching sessions for the authenticated user
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

        // Ensure sort is called
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

        // Verify performance optimization
        expect(mockLean).toHaveBeenCalled();
    });

    it('should handle alternative user id field correctly', async () => {
        const mockUser = { id: 'user456' }; // using .id instead of ._id
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(mockFind).toHaveBeenCalledWith({ userId: 'user456' });
    });

    it('should handle internal server errors correctly', async () => {
        const mockUser = { _id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        mockFind.mockImplementation(() => {
            throw new Error('Database error');
        });

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(500);
        expect((response as any).data.error).toBe('Internal Server Error');
    });
});

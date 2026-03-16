import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Setup chained mock for Mongoose find().sort().lean()
const mockLean = vi.fn();
const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn((...args) => mockFind(...args)),
    },
}));

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => {
            return {
                status: init?.status ?? 200,
                json: async () => data,
            } as any;
        }),
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should fetch chats for the authenticated user and return them', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        const mockChats = [
            { _id: 'chat1', title: 'Chat 1', userId: 'user123' },
            { _id: 'chat2', title: 'Chat 2', userId: 'user123' },
        ];
        mockLean.mockResolvedValue(mockChats);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(dbConnect).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockChats);
    });

    it('should handle db error and return 500', async () => {
        const mockUser = { _id: 'user123', email: 'test@example.com' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        mockLean.mockRejectedValue(new Error('DB Error'));

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

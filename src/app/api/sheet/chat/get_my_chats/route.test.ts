import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
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

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup chain for find().sort().lean()
        mockFind.mockReturnValue({
            sort: mockSort.mockReturnValue({
                lean: mockLean,
            }),
        });
    });

    it('should return successfully with mapped id when documents are found', async () => {
        const mockSessions = [
            { _id: 'session1', userId: 'user1', title: 'Session 1', status: 'active' },
            { _id: 'session2', userId: 'user1', title: 'Session 2', status: 'completed' },
        ];
        mockLean.mockResolvedValue(mockSessions);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(200);
        expect(response.data).toEqual([
            { _id: 'session1', userId: 'user1', title: 'Session 1', status: 'active', id: 'session1' },
            { _id: 'session2', userId: 'user1', title: 'Session 2', status: 'completed', id: 'session2' },
        ]);
        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();
    });

    it('should return an empty array if no sessions are found', async () => {
        mockLean.mockResolvedValue([]);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });

    it('should return 500 if an error occurs', async () => {
        mockLean.mockRejectedValue(new Error('Database error'));

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(500);
        expect(response.data).toEqual({ error: 'Internal Server Error' });
    });
});

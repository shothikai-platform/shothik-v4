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

// Setup chained mocks: find().sort().lean()
mockFind.mockReturnValue({ sort: mockSort });
mockSort.mockReturnValue({ lean: mockLean });

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
    });

    it('should return 500 if database fetch fails', async () => {
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database Error');
        });

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
        expect(response.status).toBe(500);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    });

    it('should fetch and map sessions correctly using .lean()', async () => {
        const mockSessions = [
            { _id: 'session1', title: 'Session 1', status: 'active' },
            { _id: 'session2', title: 'Session 2', status: 'completed' },
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(NextResponse.json).toHaveBeenCalledWith([
            { _id: 'session1', id: 'session1', title: 'Session 1', status: 'active' },
            { _id: 'session2', id: 'session2', title: 'Session 2', status: 'completed' },
        ]);
        expect(response.status).toBe(200);
    });
});

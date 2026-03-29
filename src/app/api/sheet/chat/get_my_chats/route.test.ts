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
const { mockJson } = vi.hoisted(() => {
    return {
        mockJson: vi.fn((data, options) => ({
            json: async () => data,
            status: options?.status || 200,
        })),
    };
});

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson,
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup generic mock chain
        mockLean.mockResolvedValue([
            { _id: { toString: () => '1' }, title: 'Session 1' },
            { _id: { toString: () => '2' }, title: 'Session 2' },
        ]);
        mockSort.mockReturnValue({ lean: mockLean });

        // Default behavior for find
        mockFind.mockReturnValue({
            sort: mockSort,
        });
    });

    it('should fetch sessions using .lean() for performance and map id correctly', async () => {
        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        // Assertions on the mock chain
        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        // Verify the response is processed properly
        const responseData = await response.json();

        // ensure virtual `id` mapping
        expect(responseData).toEqual([
            { _id: { toString: expect.any(Function) }, title: 'Session 1', id: '1' },
            { _id: { toString: expect.any(Function) }, title: 'Session 2', id: '2' },
        ]);

        expect(response.status).toBe(200);
    });

    it('should return 500 on internal error', async () => {
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
        const responseData = await response.json();

        expect(responseData).toEqual({ error: 'Internal Server Error' });
        expect(response.status).toBe(500);
    });
});

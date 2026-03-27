import { test, expect, vi, describe, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock NextResponse
const mockJson = vi.fn((data) => ({
    status: 200,
    json: async () => data,
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({
            ...data,
            ...options,
            json: async () => data
        })),
    },
}));

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

// Setup mock lean
const mockLean = vi.fn().mockResolvedValue([
    { _id: '123', title: 'Test Session 1', userId: 'user1' },
    { _id: '456', title: 'Test Session 2', userId: 'user2' }
]);

// Setup Mongoose mock chain
const mockSort = vi.fn().mockReturnValue({
    lean: mockLean
});

const mockFind = vi.fn().mockReturnValue({
    sort: mockSort
});

vi.mock('@/models/SheetSession', () => {
    return {
        default: {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue([
                        { _id: '123', title: 'Test Session 1', userId: 'user1' },
                        { _id: '456', title: 'Test Session 2', userId: 'user2' }
                    ])
                })
            })
        }
    }
});


describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should fetch and map sessions correctly using .lean()', async () => {
        const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(req);

        // Assert dbConnect was called
        expect(dbConnect).toHaveBeenCalled();

        // Assert SheetSession.find was called
        expect(SheetSession.find).toHaveBeenCalledWith({});

        // Check returned payload manually if mock logic allows it
        const json = await response.json();

        // It should include 'id' mapped from '_id'
        expect(json).toEqual([
            { _id: '123', id: '123', title: 'Test Session 1', userId: 'user1' },
            { _id: '456', id: '456', title: 'Test Session 2', userId: 'user2' }
        ]);
    });
});

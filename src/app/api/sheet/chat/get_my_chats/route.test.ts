import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn(),
    },
}));

vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, init) => {
                return {
                    json: async () => data,
                    status: init?.status || 200,
                };
            }),
        },
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should connect to the database and return sessions successfully using .lean()', async () => {
        const mockSessions = [
            { _id: '1', title: 'Chat 1', status: 'active', updatedAt: new Date() },
            { _id: '2', title: 'Chat 2', status: 'active', updatedAt: new Date() },
        ];

        // Setup the mock chain for Mongoose: find().sort().lean()
        const mockLean = vi.fn().mockResolvedValue(mockSessions);
        const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
        (SheetSession.find as any).mockReturnValue({ sort: mockSort });

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');

        const response = await GET(request);
        const data = await response.json();

        // Verify dbConnect was called
        expect(dbConnect).toHaveBeenCalledTimes(1);

        // Verify Mongoose query chain
        expect(SheetSession.find).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalledTimes(1);

        // Verify response
        expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
        expect(data).toEqual(mockSessions);
    });

    it('should handle errors and return a 500 status', async () => {
        // Setup mock to throw an error
        (SheetSession.find as any).mockImplementation(() => {
            throw new Error('Database Error');
        });

        // Suppress console.error for this test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');

        const response = await GET(request);
        const data = await response.json();

        expect(console.error).toHaveBeenCalled();
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        expect(data).toEqual({ error: 'Internal Server Error' });
        expect(response.status).toBe(500);

        // Restore console.error
        console.error = originalConsoleError;
    });
});

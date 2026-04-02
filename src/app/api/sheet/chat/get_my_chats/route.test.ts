import { test, expect, describe, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Hoist mocks to prevent ReferenceError
const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

const mockNextResponseJson = vi.hoisted(() => vi.fn().mockImplementation((data, options) => {
    return {
        json: async () => data,
        status: options?.status || 200
    };
}));

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

// Mock SheetSession model
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: mockNextResponseJson
    }
}));

describe('Sheet GET my chats API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return all sheet sessions mapped with id', async () => {
        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', status: 'active', updatedAt: new Date() },
            { _id: 'session2', title: 'Chat 2', status: 'active', updatedAt: new Date() }
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);
        const data = await response.json();

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(data).toHaveLength(2);
        expect(data[0]).toHaveProperty('id', 'session1');
        expect(data[0]).toHaveProperty('title', 'Chat 1');
        expect(data[1]).toHaveProperty('id', 'session2');
    });

    test('should return 500 on database error', async () => {
        mockFind.mockImplementationOnce(() => { throw new Error('DB Error'); });

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

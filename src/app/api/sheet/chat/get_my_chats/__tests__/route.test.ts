import { test, expect, vi, describe, beforeEach } from 'vitest';
import { GET } from '../route';

// Hoist mocks before module instantiation
const { mockLean, mockSort, mockFind } = vi.hoisted(() => {
    const lean = vi.fn();
    const sort = vi.fn().mockReturnValue({ lean });
    const find = vi.fn().mockReturnValue({ sort });
    return { mockLean: lean, mockSort: sort, mockFind: find };
});

const mockJson = vi.hoisted(() => vi.fn());

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson,
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should fetch sessions, use .lean() for performance, and map _id to id', async () => {
        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', updatedAt: new Date() },
            { _id: 'session2', title: 'Chat 2', updatedAt: new Date() },
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        // Define a mock response object to return from NextResponse.json
        const mockResponseObj = {
            status: 200,
            json: async () => [
                { _id: 'session1', title: 'Chat 1', updatedAt: mockSessions[0].updatedAt, id: 'session1' },
                { _id: 'session2', title: 'Chat 2', updatedAt: mockSessions[1].updatedAt, id: 'session2' }
            ]
        };
        mockJson.mockReturnValueOnce(mockResponseObj);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(mockJson).toHaveBeenCalledWith([
            { _id: 'session1', title: 'Chat 1', updatedAt: mockSessions[0].updatedAt, id: 'session1' },
            { _id: 'session2', title: 'Chat 2', updatedAt: mockSessions[1].updatedAt, id: 'session2' },
        ]);

        expect(response).toBe(mockResponseObj);
    });

    test('should handle database errors gracefully', async () => {
        mockLean.mockRejectedValueOnce(new Error('Database error'));

        const mockErrorResponseObj = {
            status: 500,
            json: async () => ({ error: 'Internal Server Error' })
        };
        mockJson.mockReturnValueOnce(mockErrorResponseObj);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockJson).toHaveBeenCalledWith(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        expect(response).toBe(mockErrorResponseObj);
    });
});

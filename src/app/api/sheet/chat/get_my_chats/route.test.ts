import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

const { mockLean, mockSort, mockFind } = vi.hoisted(() => {
    const lean = vi.fn();
    const sort = vi.fn().mockReturnValue({ lean });
    const find = vi.fn().mockReturnValue({ sort });
    return { mockLean: lean, mockSort: sort, mockFind: find };
});

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully fetch sessions and apply .lean() for performance optimization', async () => {
        const mockSessions = [
            { _id: 'session1', title: 'Chat 1', status: 'active' },
            { _id: 'session2', title: 'Chat 2', status: 'completed' },
        ];

        mockLean.mockResolvedValue(mockSessions);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled(); // Validates the performance optimization
        expect(response.status).toBe(200);
        expect((response as any).data).toEqual(mockSessions);
    });

    it('should handle internal server errors correctly', async () => {
        mockLean.mockRejectedValue(new Error('Database error'));

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

        expect(response.status).toBe(500);
        expect((response as any).data).toEqual({ error: 'Internal Server Error' });
    });
});

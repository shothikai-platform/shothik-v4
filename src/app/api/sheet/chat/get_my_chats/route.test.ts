import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn(() => ({ lean: mockLean })));
const mockFind = vi.hoisted(() => vi.fn(() => ({ sort: mockSort })));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

const mockJson = vi.hoisted(() => vi.fn((data, options) => {
    return {
        status: options?.status || 200,
        json: async () => data
    };
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

    it('should fetch sheet sessions using .lean() for optimization', async () => {
        const mockSessions = [
            { _id: '123', title: 'Session 1', status: 'active', updatedAt: new Date() },
            { _id: '456', title: 'Session 2', status: 'active', updatedAt: new Date() },
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        // Verify finding and sorting
        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        // Check if the response contains the 'id' field added after .lean()
        const data = await (response as any).json();
        expect(data).toHaveLength(2);
        expect(data[0].id).toBe('123');
        expect(data[0]._id).toBe('123');
        expect(data[1].id).toBe('456');
    });

    it('should return 500 on internal server error', async () => {
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockJson).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
        expect((response as any).status).toBe(500);
    });
});

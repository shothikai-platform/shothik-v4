import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
    const mockLean = vi.fn().mockResolvedValue([{ _id: '1', title: 'Test Chat' }]);
    const mockSort = vi.fn().mockReturnValue({
        lean: mockLean
    });
    const mockFind = vi.fn().mockReturnValue({
        sort: mockSort
    });
    return { mockFind, mockSort, mockLean };
});

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns sessions successfully', async () => {
        const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe('1'); // Test the virtual id mapper
    });
});

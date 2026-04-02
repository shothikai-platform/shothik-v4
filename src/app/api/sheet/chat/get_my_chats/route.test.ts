import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

const mockSort = vi.fn();
const mockLean = vi.fn();
const mockFind = vi.fn();

vi.mock('@/models/SheetSession', () => {
    return {
        default: {
            find: (...args: any[]) => mockFind(...args)
        }
    };
});

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Create the mock outside vi.mock
const mockJson = vi.fn();
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: (...args: any[]) => mockJson(...args)
        }
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockFind.mockReturnValue({
            sort: mockSort
        });
        mockSort.mockReturnValue({
            lean: mockLean
        });

        // Mock json method to return itself so we can await response.json()
        mockJson.mockImplementation((data: any) => ({
            json: async () => data
        }));
    });

    it('should return lean sessions', async () => {
        const mockSessions = [
            { _id: '123', title: 'Test 1' },
            { _id: '456', title: 'Test 2' }
        ];
        mockLean.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request) as any;

        const data = await response.json();

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(data).toHaveLength(2);
        expect(data[0].id).toBe('123'); // ensures mapping works
        expect(data[0].title).toBe('Test 1');
    });
});

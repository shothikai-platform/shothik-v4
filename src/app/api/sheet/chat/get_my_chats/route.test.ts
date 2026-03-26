import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Provide next/server mock compatible with the memory
const mockJson = vi.fn();
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn().mockImplementation((body, init) => {
            return {
                status: init?.status || 200,
                json: async () => body,
            };
        }),
    },
}));

const mockSort = vi.fn();
const mockFind = vi.fn().mockReturnValue({
    sort: mockSort,
});

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn(),
    },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
        expect(SheetSession.find).not.toHaveBeenCalled();
    });

    it('should fetch sessions for the authenticated user and return them', async () => {
        const mockUser = { _id: 'user123', name: 'Test', email: 'test@example.com' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

        const mockSessions = [{ id: 'session1', title: 'Chat 1' }];
        mockSort.mockResolvedValue(mockSessions);
        vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

        const request = new Request('http://localhost');
        const response = await GET(request);
        const data = await response.json();

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(response.status).toBe(200);
        expect(data).toEqual(mockSessions);
    });
});

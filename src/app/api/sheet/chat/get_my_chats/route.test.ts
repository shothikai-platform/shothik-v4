import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth');
vi.mock('@/lib/dbConnect');
vi.mock('@/models/SheetSession');

const mockJson = vi.hoisted(() => vi.fn().mockImplementation((data, options) => {
    return {
        status: options?.status || 200,
        json: async () => data,
    };
}));

vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: mockJson,
        },
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    const mockRequest = {} as Request;

    // Setup chained mongoose mock
    const mockLean = vi.hoisted(() => vi.fn());
    const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
    const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

    beforeEach(() => {
        vi.clearAllMocks();
        SheetSession.find = mockFind;
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(null);

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should fetch and return mapped sessions for authenticated user', async () => {
        const mockUser = { _id: 'user123' };
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(mockUser as any);

        const mockSessions = [
            { _id: 'session1', title: 'Test 1', updatedAt: '2023-01-02' },
            { _id: 'session2', title: 'Test 2', updatedAt: '2023-01-01' }
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(dbConnect).toHaveBeenCalled();
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(response.status).toBe(200);
        // Verify mapping of _id to id
        expect(data).toEqual([
            { _id: 'session1', id: 'session1', title: 'Test 1', updatedAt: '2023-01-02' },
            { _id: 'session2', id: 'session2', title: 'Test 2', updatedAt: '2023-01-01' }
        ]);
    });

    it('should use user.id if user._id is not available', async () => {
        const mockUser = { id: 'user456' };
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(mockUser as any);
        mockLean.mockResolvedValueOnce([]);

        await GET(mockRequest);

        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user456' });
    });

    it('should return 500 on internal errors', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce({ _id: 'user123' } as any);
        mockFind.mockImplementationOnce(() => {
            throw new Error('DB Error');
        });

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal Server Error');
    });
});

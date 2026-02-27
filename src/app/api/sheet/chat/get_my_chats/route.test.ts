import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth');
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));
vi.mock('@/models/SheetSession');
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
        },
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(401);
        expect(response.data).toEqual({ error: 'Unauthorized' });
    });

    it('should return users sessions if authenticated', async () => {
        const mockUser = { _id: 'user123', id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        const mockSessions = [{ title: 'Session 1' }, { title: 'Session 2' }];

        // Mock chainable Mongoose query
        const mockFind = {
            sort: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(mockSessions),
        };
        (SheetSession.find as any).mockReturnValue(mockFind);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(response.data).toEqual(mockSessions);

        // Verify query scoping
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(mockFind.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });

    it('should handle errors gracefully', async () => {
        const mockUser = { _id: 'user123', id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);

        (SheetSession.find as any).mockImplementation(() => {
            throw new Error('DB Error');
        });

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        expect(response.data).toEqual({ error: 'Internal Server Error' });
    });
});

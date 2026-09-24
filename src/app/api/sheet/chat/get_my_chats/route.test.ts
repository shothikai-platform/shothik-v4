import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn().mockReturnThis(),
        sort: vi.fn(),
    },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns user sheet sessions filtered by userId', async () => {
        const mockUser = { id: 'user-sheet-123' };
        vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);

        const mockSessions = [{ _id: 'session-1', title: 'Test Sheet' }];
        vi.mocked(SheetSession.sort).mockResolvedValue(mockSessions as any);

        const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockSessions);
        expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-sheet-123' });
    });
});

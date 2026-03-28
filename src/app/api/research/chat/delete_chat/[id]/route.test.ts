import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

const mockFindOneAndDelete = vi.hoisted(() => vi.fn());
const mockNextResponseJson = vi.hoisted(() => vi.fn((data, options) => ({ ...data, ...options, json: async () => data })));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: mockFindOneAndDelete,
    },
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockNextResponseJson,
    },
}));

describe('delete_chat API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const req = {} as any;
        const res = await DELETE(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(res.error).toBe('Unauthorized');
        expect(res.status).toBe(401);
    });

    it('should securely delete chat matching user id', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
        mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123' });

        const req = {} as any;
        const res = await DELETE(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(mockFindOneAndDelete).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' }
        );
        expect(res.success).toBe(true);
    });

    it('should return 404 if chat not found or does not belong to user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
        mockFindOneAndDelete.mockResolvedValue(null);

        const req = {} as any;
        const res = await DELETE(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(res.error).toBe('Chat not found');
        expect(res.status).toBe(404);
    });
});

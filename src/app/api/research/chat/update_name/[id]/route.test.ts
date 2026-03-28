import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

const mockFindOneAndUpdate = vi.hoisted(() => vi.fn());
const mockNextResponseJson = vi.hoisted(() => vi.fn((data, options) => ({ ...data, ...options, json: async () => data })));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndUpdate: mockFindOneAndUpdate,
    },
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockNextResponseJson,
    },
}));

describe('update_name API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const req = { json: async () => ({ name: 'New Name' }) } as any;
        const res = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(res.error).toBe('Unauthorized');
        expect(res.status).toBe(401);
    });

    it('should securely update chat matching user id', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
        mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat123', name: 'New Name' });

        const req = { json: async () => ({ name: 'New Name' }) } as any;
        const res = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' },
            { name: 'New Name' },
            { new: true }
        );
        expect(res._id).toBe('chat123');
    });

    it('should return 404 if chat not found or does not belong to user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
        mockFindOneAndUpdate.mockResolvedValue(null);

        const req = { json: async () => ({ name: 'New Name' }) } as any;
        const res = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

        expect(res.error).toBe('Chat not found');
        expect(res.status).toBe(404);
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

const { mockFindOneAndDelete } = vi.hoisted(() => {
    return {
        mockFindOneAndDelete: vi.fn(),
    };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findOneAndDelete: mockFindOneAndDelete,
        },
    };
});

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const response = await DELETE(
            new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }),
            { params: Promise.resolve({ id: 'chat123' }) }
        );

        expect(response.status).toBe(401);
        expect((response as any).data).toEqual({ error: 'Unauthorized' });
        expect(mockFindOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 404 if chat is not found or belongs to another user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        mockFindOneAndDelete.mockResolvedValue(null);

        const response = await DELETE(
            new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }),
            { params: Promise.resolve({ id: 'chat123' }) }
        );

        expect(mockFindOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
        expect(response.status).toBe(404);
        expect((response as any).data).toEqual({ error: 'Chat not found' });
    });

    it('should successfully delete chat if user owns it', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

        const response = await DELETE(
            new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }),
            { params: Promise.resolve({ id: 'chat123' }) }
        );

        expect(mockFindOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
        expect(response.status).toBe(200);
        expect((response as any).data).toEqual({ success: true });
    });
});

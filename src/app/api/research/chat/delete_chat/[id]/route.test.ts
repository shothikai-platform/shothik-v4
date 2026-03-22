import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: vi.fn(),
    },
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    const mockRequest = {} as Request;
    const mockParams = Promise.resolve({ id: 'chat123' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const response = await DELETE(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
        expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('should return 404 if chat is not found or not owned by user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

        const response = await DELETE(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Chat not found or unauthorized' });

        // Ensure IDOR protection is applied
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
    });

    it('should delete chat and return success if owned by user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({ _id: 'chat123' } as any);

        const response = await DELETE(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });

        // Ensure IDOR protection is applied, using user.id fallback
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
    });

    it('should handle database errors gracefully', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndDelete).mockRejectedValue(new Error('DB error'));

        const response = await DELETE(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete chat' });
    });
});

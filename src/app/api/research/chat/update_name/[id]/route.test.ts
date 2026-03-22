import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
        findOneAndUpdate: vi.fn(),
    },
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
    const mockRequest = {
        json: vi.fn().mockResolvedValue({ name: 'Updated Name' })
    } as unknown as Request;
    const mockParams = Promise.resolve({ id: 'chat123' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const response = await PUT(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
        expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if chat is not found or not owned by user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndUpdate).mockResolvedValue(null);
        // Reset the mock request for this test to ensure it resolves correctly
        mockRequest.json = vi.fn().mockResolvedValue({ name: 'Updated Name' });

        const response = await PUT(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Chat not found or unauthorized' });

        // Ensure IDOR protection is applied
        expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' },
            { title: 'Updated Name' },
            { new: true }
        );
    });

    it('should update chat name and return updated chat if owned by user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user123' } as any);
        const updatedChat = { _id: 'chat123', name: 'Updated Name', userId: 'user123' };
        vi.mocked(ResearchChat.findOneAndUpdate).mockResolvedValue(updatedChat as any);
        mockRequest.json = vi.fn().mockResolvedValue({ name: 'Updated Name' });

        const response = await PUT(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(updatedChat);

        // Ensure IDOR protection is applied, using user.id fallback
        expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' },
            { title: 'Updated Name' },
            { new: true }
        );
    });

    it('should handle database errors gracefully', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndUpdate).mockRejectedValue(new Error('DB error'));
        mockRequest.json = vi.fn().mockResolvedValue({ name: 'Updated Name' });

        const response = await PUT(mockRequest, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update chat' });
    });
});

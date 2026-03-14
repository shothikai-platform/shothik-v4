import { NextResponse } from 'next/server';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: vi.fn(),
    },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
        expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('returns 404 when chat is not found or user is not the owner', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Chat not found');
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
    });

    it('successfully deletes a chat when authorized', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123' });

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
    });
});

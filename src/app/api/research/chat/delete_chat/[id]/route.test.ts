import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
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

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: '123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should delete the chat if user is authenticated and owns the chat', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({ _id: '123', userId: 'user123' } as any);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: '123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user123' });
    });

    it('should return 404 if chat is not found or user does not own it', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' } as any);
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: '123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Chat not found');
    });
});

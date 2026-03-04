import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: vi.fn(),
    },
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 if chat is not found or user does not own it (IDOR protection)', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Chat not found' });
    });

    it('should return 200 and success true if deletion is successful', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123', title: 'Test' });

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response = await DELETE(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123',
        });
        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
    });

    it('should fall back to user.id if user._id is not present', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ id: 'user456' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123', title: 'Test' });

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response = await DELETE(request, { params });

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user456',
        });
        expect(response.status).toBe(200);
    });
});

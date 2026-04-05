import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/server-auth');
vi.mock('@/models/ResearchChat');
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(null),
}));

describe('Delete Chat API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
            method: 'DELETE',
        });

        const response = await DELETE(request, { params: Promise.resolve({ id: '123' }) });
        expect(response.status).toBe(401);
    });

    it('should verify ownership and delete chat', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: '123' });

        const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
            method: 'DELETE',
        });

        const response = await DELETE(request, { params: Promise.resolve({ id: '123' }) });

        expect(response.status).toBe(200);
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: '123',
            userId: 'user-123'
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/server-auth');
vi.mock('@/models/ResearchChat');
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(null),
}));

describe('Update Chat Name API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/research/chat/update_name/123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        });

        const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });
        expect(response.status).toBe(401);
    });

    it('should verify ownership and update name', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-123' });
        (ResearchChat.findOneAndUpdate as any).mockResolvedValue({ _id: '123', name: 'New Name' });

        const request = new Request('http://localhost/api/research/chat/update_name/123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        });

        const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });

        expect(response.status).toBe(200);
        expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: '123', userId: 'user-123' },
            { name: 'New Name' },
            { new: true }
        );
    });
});

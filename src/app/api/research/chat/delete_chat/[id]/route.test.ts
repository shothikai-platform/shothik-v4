import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';

const mockJson = vi.fn();
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: (...args: any[]) => {
                mockJson(...args);
                return { json: async () => args[0], status: args[1]?.status };
            }
        }
    };
});

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn()
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn()
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: vi.fn()
    }
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        await DELETE(request, { params });

        expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    it('returns 404 if chat is not found or does not belong to user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test', email: 'test@test.com' });
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        await DELETE(request, { params });

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
        expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
    });

    it('returns success if chat is deleted', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test', email: 'test@test.com' });
        vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({ _id: 'chat123' } as any);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        await DELETE(request, { params });

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
});

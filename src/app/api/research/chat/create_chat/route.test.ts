import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock dependencies
vi.mock('@/lib/server-auth');
vi.mock('@/models/ResearchChat');
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(null),
}));

describe('Create Chat API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if chat name is too long', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-123' });

        const longName = 'a'.repeat(101);
        const request = new Request('http://localhost/api/research/chat/create_chat', {
            method: 'POST',
            body: JSON.stringify({ name: longName }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Chat name too long (max 100 characters)');
        expect(ResearchChat.create).not.toHaveBeenCalled();
    });

    it('should create chat if name is within limit', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-123' });
        (ResearchChat.create as any).mockResolvedValue({ _id: 'chat-123', name: 'Valid Name' });

        const request = new Request('http://localhost/api/research/chat/create_chat', {
            method: 'POST',
            body: JSON.stringify({ name: 'Valid Name' }),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(ResearchChat.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Valid Name',
            userId: 'user-123'
        }));
    });
});

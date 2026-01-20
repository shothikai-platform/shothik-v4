import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/research/chat/get_one_chat/[id]/route';
import ResearchChat from '@/models/ResearchChat';
import * as serverAuth from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));
vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findById: vi.fn(),
            findOne: vi.fn(),
        }
    };
});

// Mock Next.js stuff
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
        }
    };
});

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
    const chatOwnerId = 'owner-123';
    const attackerId = 'attacker-456';
    const chatId = 'chat-789';

    const mockChat = {
        _id: chatId,
        userId: chatOwnerId,
        name: 'Secret Chat'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if not authenticated', async () => {
        (serverAuth.getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${chatId}`);
        const params = Promise.resolve({ id: chatId });
        const response = await GET(request, { params });

        expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user (IDOR protection)', async () => {
        // Authenticated as attacker
        (serverAuth.getAuthenticatedUser as any).mockResolvedValue({
            _id: attackerId,
            id: attackerId,
        });

        // findOne should return null because userId doesn't match
        (ResearchChat.findOne as any).mockResolvedValue(null);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${chatId}`);
        const params = Promise.resolve({ id: chatId });
        const response = await GET(request, { params });

        expect(response.status).toBe(404);

        // Verify findOne was called with correct filter
        expect(ResearchChat.findOne).toHaveBeenCalledWith({
            _id: chatId,
            userId: attackerId
        });
    });

    it('should return 200 and chat data if user is owner', async () => {
        // Authenticated as owner
        (serverAuth.getAuthenticatedUser as any).mockResolvedValue({
            _id: chatOwnerId,
            id: chatOwnerId,
        });

        // findOne returns the chat
        (ResearchChat.findOne as any).mockResolvedValue(mockChat);

        const request = new Request(`http://localhost/api/research/chat/get_one_chat/${chatId}`);
        const params = Promise.resolve({ id: chatId });
        const response = await GET(request, { params });

        expect(response.status).toBe(200);
        expect((response as any).data).toEqual(mockChat);

        // Verify findOne was called with correct filter
        expect(ResearchChat.findOne).toHaveBeenCalledWith({
            _id: chatId,
            userId: chatOwnerId
        });
    });
});

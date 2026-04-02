import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock the database connection
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

// Mock ResearchChat model
vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findOne: vi.fn(),
            findOneAndUpdate: vi.fn(),
            findById: vi.fn(),
            findByIdAndUpdate: vi.fn(),
        },
    };
});

// Mock getAuthenticatedUser
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('POST /api/research/research/create_research_queue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('returns 404 if chat is not found or does not belong to user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOne as any).mockResolvedValue(null);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe('Chat not found');

        // Ensure findOne was called with both _id and userId
        expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    });

    it('proceeds successfully if chat belongs to authenticated user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

        const mockChat = {
            _id: 'chat123',
            userId: 'user123',
            messages: [],
            save: vi.fn().mockResolvedValue(true)
        };

        (ResearchChat.findOne as any).mockResolvedValue(mockChat);

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/event-stream');

        // Verify chat message was pushed and saved
        expect(mockChat.messages.length).toBe(1);
        expect(mockChat.messages[0].role).toBe('user');
        expect(mockChat.messages[0].content).toBe('test query');
        expect(mockChat.save).toHaveBeenCalled();
    });
});

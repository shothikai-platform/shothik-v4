import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock dependencies
vi.mock('next/server', () => {
    return {
        NextResponse: class NextResponse {
            body: any;
            status: number;
            constructor(body: any, init?: any) {
                this.body = body;
                this.status = init?.status || 200;
            }
            static json(body: any, init?: any) {
                return { body, status: init?.status || 200 };
            }
        }
    };
});

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn()
    }
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn()
}));

// Mock globals for TextEncoder and ReadableStream if needed, though they exist in Node environments
// Node 18+ has TextEncoder and ReadableStream globally.

describe('POST /api/research/research/create_research_queue', () => {
    const mockRequest = (body: any) => ({
        json: vi.fn().mockResolvedValue(body)
    } as unknown as Request);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const req = mockRequest({ chat: 'chat-123', query: 'test query' });
        const response: any = await POST(req);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 if chat is not found or belongs to another user (IDOR prevention)', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user-123', name: 'Test', email: 'test@test.com' });
        vi.mocked(ResearchChat.findOne).mockResolvedValue(null);

        const req = mockRequest({ chat: 'chat-456', query: 'test query' });
        const response: any = await POST(req);

        expect(ResearchChat.findOne).toHaveBeenCalledWith({
            _id: 'chat-456',
            userId: 'user-123'
        });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Chat not found' });
    });

    it('should stream response successfully for valid authenticated request', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user-123', name: 'Test', email: 'test@test.com' });

        const mockChatSave = vi.fn().mockResolvedValue(true);
        const mockChat = {
            _id: 'chat-456',
            userId: 'user-123',
            messages: [],
            save: mockChatSave
        };
        vi.mocked(ResearchChat.findOne).mockResolvedValue(mockChat as any);

        const req = mockRequest({ chat: 'chat-456', query: 'test query' });
        const response: any = await POST(req);

        // Streams return a 200 by default in the custom NextResponse
        expect(response.status).toBe(200);
        expect(ResearchChat.findOne).toHaveBeenCalledWith({
            _id: 'chat-456',
            userId: 'user-123'
        });
        expect(mockChat.messages.length).toBe(1);
        expect(mockChat.messages[0].content).toBe('test query');
        expect(mockChatSave).toHaveBeenCalled();
        expect(response.body).toBeInstanceOf(ReadableStream);
    });

    it('should return 500 on internal server error', async () => {
        vi.mocked(getAuthenticatedUser).mockRejectedValue(new Error('Auth failed completely'));

        const req = mockRequest({ chat: 'chat-456', query: 'test query' });
        const response: any = await POST(req);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed' });
    });
});

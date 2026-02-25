import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body: any, init: any) {
                return { body, init, status: init?.status || 200 } as any;
            }
            static json(data: any, options: any) {
                return { data, options, status: options?.status || 200 };
            }
        }
    };
});

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findById: vi.fn(),
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('POST /api/research/research/create_research_queue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const req = {
            json: async () => ({ chat: 'chat-id', query: 'test query' }),
        } as unknown as Request;

        const response: any = await POST(req);

        expect(response.status).toBe(401);
        expect(response.data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 if chat is not found or does not belong to user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-id', id: 'user-id' });
        // Mock findOne to return null, simulating "not found for this user"
        (ResearchChat.findOne as any).mockResolvedValue(null);

        const req = {
            json: async () => ({ chat: 'chat-id', query: 'test query' }),
        } as unknown as Request;

        const response: any = await POST(req);

        expect(response.status).toBe(404);
        expect(response.data).toEqual({ error: 'Chat not found' });

        // Verify it called findOne with correct query
        // The implementation uses user._id || user.id. Since both are 'user-id', it should work.
        expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-id', userId: 'user-id' });
    });
});

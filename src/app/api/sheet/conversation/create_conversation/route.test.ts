
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';
import * as auth from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));

vi.mock('@/models/SheetSession', () => {
    return {
        default: {
            findById: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
        }
    };
});

vi.mock('@/models/SheetConversation', () => {
    return {
        default: {
            create: vi.fn(),
        }
    };
});

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', async () => {
    return {
        NextResponse: class {
            constructor(body, init) {
                this.body = body;
                this.init = init;
                this.headers = new Map(Object.entries(init?.headers || {}));
            }
            static json(data, init) {
                return { data, status: init?.status || 200, json: () => Promise.resolve(data) };
            }
        }
    };
});

describe('POST /api/sheet/conversation/create_conversation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Test Prompt' }),
        });

        const response = await POST(request);

        // Currently this will fail because the code doesn't check auth
        expect(response.status).toBe(401);
    });

    it('should create a session with the authenticated user ID', async () => {
        const mockUser = { _id: 'real-user-id', name: 'Test User', email: 'test@example.com' };
        vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

        const mockSession = { _id: 'session-123', userId: 'real-user-id', title: 'Test Prompt', save: vi.fn() };
        vi.mocked(SheetSession.create).mockResolvedValue(mockSession);

        const mockConversation = {
            _id: 'conv-123',
            status: 'generating',
            events: [],
            save: vi.fn()
        };
        vi.mocked(SheetConversation.create).mockResolvedValue(mockConversation);

        const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Test Prompt' }),
        });

        await POST(request);

        // Currently this will fail because it uses 'temp-user'
        expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'real-user-id'
        }));
    });

    it('should return 403/404 if trying to append to another users session', async () => {
        const mockUser = { _id: 'real-user-id', name: 'Test User', email: 'test@example.com' };
        vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

        // Mock findOne to return null, simulating that no session matches both chatId AND userId
        vi.mocked(SheetSession.findOne).mockResolvedValue(null);

        const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Follow up', chat: 'session-other' }),
        });

        const response = await POST(request);

        // Should return 404 as we can't find the chat for this user
        expect(response.status).toBe(404);
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';
import { NextResponse } from 'next/server';

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock('@/models/SheetConversation', () => ({
    default: {
        create: vi.fn(),
    },
}));

describe('POST /api/sheet/conversation/create_conversation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

        const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test' }),
        });
        const response = await POST(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should correctly scope session search by userId to prevent IDOR', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', email: 'test@test.com', name: 'Test' });

        // Mock a found session
        vi.mocked(SheetSession.findOne).mockResolvedValue({ _id: 'chat123', title: 'Old Title', save: vi.fn() });
        // Mock conversation creation
        vi.mocked(SheetConversation.create).mockResolvedValue({ _id: 'conv123', events: [], save: vi.fn() });

        const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test prompt', chat: 'chat123' }),
        });
        const response = await POST(request);

        // Should not be a generic JSON error
        expect(response.status).toBe(200);

        // Crucially, verify it searched using BOTH _id and userId
        expect(SheetSession.findOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    });

    it('should create new session with actual userId instead of temp-user', async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', email: 'test@test.com', name: 'Test' });

        // Mock no existing session
        vi.mocked(SheetSession.findOne).mockResolvedValue(null);
        // Mock session creation
        vi.mocked(SheetSession.create).mockResolvedValue({ _id: 'newchat123', title: 'test prompt' });
        // Mock conversation creation
        vi.mocked(SheetConversation.create).mockResolvedValue({ _id: 'conv123', events: [], save: vi.fn() });

        const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test prompt' }), // No chat ID, so it creates one
        });
        const response = await POST(request);

        expect(response.status).toBe(200);

        // Crucially, verify it created with the right userId
        expect(SheetSession.create).toHaveBeenCalledWith({
            userId: 'user123',
            title: 'test prompt'
        });
    });
});

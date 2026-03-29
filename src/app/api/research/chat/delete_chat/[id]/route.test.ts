import { test, expect, vi, describe, beforeEach } from 'vitest';
import { DELETE } from './route';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

const mockJson = vi.fn();
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: (...args: any[]) => {
                mockJson(...args);
                return { json: async () => args[0], status: args[1]?.status || 200 };
            }
        }
    };
});

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
    default: {
        findOneAndDelete: vi.fn(),
    },
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 404 if chat is not found or does not belong to user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123'
        });
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Chat not found' });
    });

    test('should return success if chat is deleted', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123' });

        const request = new Request('http://localhost');
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await DELETE(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat123',
            userId: 'user123'
        });
        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
    });
});

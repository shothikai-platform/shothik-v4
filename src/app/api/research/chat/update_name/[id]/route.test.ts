import { test, expect, vi, describe, beforeEach } from 'vitest';
import { PUT } from './route';
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
        findOneAndUpdate: vi.fn(),
    },
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        });
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await PUT(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 404 if chat is not found or does not belong to user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' }); // testing user.id instead of user._id
        (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

        const request = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        });
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await PUT(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' },
            { title: 'New Name' },
            { new: true }
        );
        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'Chat not found' });
    });

    test('should return the updated chat if successful', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
        const updatedChat = { _id: 'chat123', title: 'New Name', userId: 'user123' };
        (ResearchChat.findOneAndUpdate as any).mockResolvedValue(updatedChat);

        const request = new Request('http://localhost', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }) // Still payload {name: ...}
        });
        const params = Promise.resolve({ id: 'chat123' });

        const response: any = await PUT(request, { params });
        const data = await response.json();

        expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'chat123', userId: 'user123' },
            { title: 'New Name' },
            { new: true }
        );
        expect(response.status).toBe(200);
        expect(data).toEqual(updatedChat);
    });
});

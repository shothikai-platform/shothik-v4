import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('next/server', () => {
    const NextResponseMock = {
        json: vi.fn((data, init) => {
            return {
                ...data,
                status: init?.status ?? 200,
            };
        }),
    };
    return { NextResponse: NextResponseMock };
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
    const mockRequest = {} as Request;
    const mockParams = Promise.resolve({ id: 'chat-123' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const response = await DELETE(mockRequest, { params: mockParams }) as any;

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        expect(response.error).toBe('Unauthorized');
        expect(response.status).toBe(401);
    });

    it('should delete the chat if user is authenticated and is the owner', async () => {
        const mockUser = { _id: 'user-456' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat-123', userId: 'user-456' });

        const response = await DELETE(mockRequest, { params: mockParams }) as any;

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(dbConnect).toHaveBeenCalled();
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat-123',
            userId: 'user-456',
        });
        expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
        expect(response.success).toBe(true);
        expect(response.status).toBe(200);
    });

    it('should return 404 if chat is not found or user is not the owner', async () => {
        const mockUser = { _id: 'user-456' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

        const response = await DELETE(mockRequest, { params: mockParams }) as any;

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(dbConnect).toHaveBeenCalled();
        expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
            _id: 'chat-123',
            userId: 'user-456',
        });
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Chat not found or unauthorized' },
            { status: 404 }
        );
        expect(response.error).toBe('Chat not found or unauthorized');
        expect(response.status).toBe(404);
    });

    it('should return 500 on server error', async () => {
        const mockUser = { _id: 'user-456' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (ResearchChat.findOneAndDelete as any).mockRejectedValue(new Error('Database error'));

        const response = await DELETE(mockRequest, { params: mockParams }) as any;

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Failed' },
            { status: 500 }
        );
        expect(response.error).toBe('Failed');
        expect(response.status).toBe(500);
    });
});

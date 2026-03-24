import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

// Create hoisted mocks for chained Mongoose methods
const { mockLean, mockSort } = vi.hoisted(() => {
    const mockLeanFn = vi.fn();
    return {
        mockLean: mockLeanFn,
        mockSort: vi.fn().mockReturnValue({ lean: mockLeanFn }),
    };
});

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: vi.fn().mockReturnValue({ sort: mockSort }),
    },
}));

// Mock Next.js NextResponse
vi.mock('next/server', () => {
    const jsonMock = vi.fn().mockImplementation((data, options) => {
        return {
            status: options?.status || 200,
            json: async () => data,
        };
    });
    return {
        NextResponse: {
            json: jsonMock,
        },
    };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and return sheet sessions with lean optimization', async () => {
        const mockSessions = [
            {
                _id: new mongoose.Types.ObjectId(),
                userId: 'user1',
                title: 'Chat 1',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: new mongoose.Types.ObjectId(),
                userId: 'user1',
                title: 'Chat 2',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request as any);

        const data = await response.json();

        expect(SheetSession.find).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        // Check if virtual id was manually injected
        expect(data).toHaveLength(2);
        expect(data[0].id).toBe(mockSessions[0]._id.toString());
        expect(data[0]._id).toBeDefined();
        expect(data[1].id).toBe(mockSessions[1]._id.toString());
    });

    it('should handle internal server errors gracefully', async () => {
        mockLean.mockRejectedValueOnce(new Error('Database error'));

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request as any);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

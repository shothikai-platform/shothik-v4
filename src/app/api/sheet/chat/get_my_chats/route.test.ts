import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Create mock variables for chained functions
const mockLean = vi.hoisted(() => vi.fn().mockResolvedValue([
    {
        _id: 'mock-session-id',
        title: 'Mock Session',
        userId: 'mock-user-id',
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
    }
]));

const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

// Mock next/server
const mockJson = vi.hoisted(() => vi.fn((data: any, options?: any) => ({
    status: options?.status || 200,
    json: async () => data
})));

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson
    }
}));

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

// Mock auth
const mockGetAuthenticatedUser = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: mockGetAuthenticatedUser
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce(null);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(401);
        const data = await (response as any).json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return mapped sessions if user is authenticated', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce({ _id: 'mock-user-id', email: 'test@example.com' });

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockGetAuthenticatedUser).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalledWith({ userId: 'mock-user-id' });
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(response.status).toBe(200);
        const data = await (response as any).json();

        // Ensure that mapped data contains the correct properties, including 'id'
        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty('id', 'mock-session-id');
        expect(data[0]).toHaveProperty('title', 'Mock Session');
    });

    it('should return 500 on database error', async () => {
        mockGetAuthenticatedUser.mockResolvedValueOnce({ _id: 'mock-user-id' });
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database Error');
        });

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await (response as any).json();
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

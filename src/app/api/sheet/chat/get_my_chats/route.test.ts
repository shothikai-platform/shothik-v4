import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// 1. Hoist the mocks so they are available before the module is mocked
const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

// 2. Mock Mongoose model
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

// 3. Mock Next.js NextResponse
const mockJson = vi.hoisted(() =>
    vi.fn((data, init) => {
        return {
            status: init?.status || 200,
            json: async () => data,
        };
    })
);

vi.mock('next/server', () => ({
    NextResponse: {
        json: mockJson,
    },
}));

// 4. Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return successfully with mapped id when documents are found', async () => {
        // Arrange
        const mockSessions = [
            {
                _id: 'session_123',
                title: 'Test Session 1',
                userId: 'user_1',
                status: 'active',
                updatedAt: '2023-01-01T00:00:00Z',
                createdAt: '2023-01-01T00:00:00Z',
            },
            {
                _id: 'session_456',
                title: 'Test Session 2',
                userId: 'user_1',
                status: 'archived',
                updatedAt: '2023-01-02T00:00:00Z',
                createdAt: '2023-01-02T00:00:00Z',
            },
        ];

        mockLean.mockResolvedValueOnce(mockSessions);

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');

        // Act
        const response = await GET(request);
        const data = await response.json();

        // Assert
        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(2);

        // Verify the map transformation added 'id'
        expect(data[0].id).toBe('session_123');
        expect(data[0]._id).toBe('session_123');
        expect(data[0].title).toBe('Test Session 1');

        expect(data[1].id).toBe('session_456');
        expect(data[1]._id).toBe('session_456');
        expect(data[1].title).toBe('Test Session 2');
    });

    it('should return 500 when database operation fails', async () => {
        // Arrange
        mockFind.mockImplementationOnce(() => {
            throw new Error('Database connection failed');
        });

        const request = new Request('http://localhost/api/sheet/chat/get_my_chats');

        // Act
        const response = await GET(request);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal Server Error' });
    });
});

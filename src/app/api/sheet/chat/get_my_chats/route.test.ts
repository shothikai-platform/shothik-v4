import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

// Mock next/server
const mockJson = vi.hoisted(() => vi.fn().mockImplementation((data) => ({
    status: 200,
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

// Mock SheetSession
vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind
    }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and format sessions correctly', async () => {
        const mockDate = new Date();
        const mockObjectId1 = new mongoose.Types.ObjectId();
        const mockObjectId2 = new mongoose.Types.ObjectId();

        const mockSessions = [
            {
                _id: mockObjectId1,
                title: 'Session 1',
                updatedAt: mockDate,
                userId: 'user1'
            },
            {
                _id: mockObjectId2,
                title: 'Session 2',
                updatedAt: mockDate,
                userId: 'user1'
            }
        ];

        mockLean.mockResolvedValue(mockSessions);

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockFind).toHaveBeenCalledWith({});
        expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockLean).toHaveBeenCalled();

        const responseData = await response.json();

        expect(responseData).toBeDefined();
        expect(responseData.length).toBe(2);

        // Ensure formatting correctly mapped _id to id
        expect(responseData[0].id).toBe(mockObjectId1.toString());
        expect(responseData[0]._id).toBeDefined();
        expect(responseData[0].title).toBe('Session 1');

        expect(responseData[1].id).toBe(mockObjectId2.toString());
    });

    it('should handle internal server errors gracefully', async () => {
        mockLean.mockRejectedValue(new Error('Database failure'));

        mockJson.mockImplementationOnce((data, options) => ({
            status: options?.status || 200,
            json: async () => data
        }));

        const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
        const response = await GET(request);

        expect(mockFind).toHaveBeenCalled();

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Internal Server Error');
    });
});

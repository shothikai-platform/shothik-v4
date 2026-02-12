
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
    return {
        mockFindByIdAndUpdate: vi.fn(),
        mockFindOneAndUpdate: vi.fn(),
    };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
    return {
        default: {
            findByIdAndUpdate: mockFindByIdAndUpdate,
            findOneAndUpdate: mockFindOneAndUpdate,
        },
    };
});

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('PUT /api/research/chat/update_name/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        });

        const response = await PUT(
            request,
            { params: Promise.resolve({ id: 'chat1' }) }
        );

        expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

        // Mock findOneAndUpdate to return null to simulate "not found for this user"
        mockFindOneAndUpdate.mockResolvedValue(null);
        // Also mock findByIdAndUpdate to return something (which would be the insecure behavior)
        mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Old Name' });

        const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        });

        const response = await PUT(
            request,
            { params: Promise.resolve({ id: 'chat1' }) }
        );

        expect(response.status).toBe(404);
    });
});

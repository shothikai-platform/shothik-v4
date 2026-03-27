import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((body, init) => ({ body, init, status: init?.status || 200 })),
        },
    };
});

// Mock server-auth
vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

describe('POST /api/geolocation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';
        global.fetch = vi.fn();
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const response = await POST();

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(response.status).toBe(401);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should proceed to call fetch if user is authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue({ _id: '123' });

        // Mock fetch to return success
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                location: { lat: 1, lng: 1 },
                results: [{ types: ['country'], formatted_address: 'Test Country' }]
            }),
        });

        const response = await POST();

        expect(getAuthenticatedUser).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalled();
        expect(response.status).toBe(200);
    });
});

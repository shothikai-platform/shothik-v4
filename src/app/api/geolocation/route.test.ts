import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock getAuthenticatedUser
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('POST /api/geolocation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // Act
    const response = await POST();

    // Assert
    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should proceed if user is authenticated', async () => {
    // Arrange
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock successful fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ location: { lat: 10, lng: 20 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ types: ['country'], formatted_address: 'Testland' }] }),
      });

    // Act
    const response = await POST();

    // Assert
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

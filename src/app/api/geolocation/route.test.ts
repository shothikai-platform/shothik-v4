
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const { MockNextResponse } = vi.hoisted(() => {
  return {
    MockNextResponse: {
      json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    }
  };
});

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

global.fetch = vi.fn();

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it('should return 500 with generic error if API key is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    delete process.env.GOOGLE_GEOLOCATION_KEY;

    const response = await POST();

    expect(response.status).toBe(500);
    expect((response as any).data.error).toBe('Internal Server Error');
  });

  it('should return 500 with generic error if fetch fails', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const response = await POST();

    expect(response.status).toBe(500);
    expect((response as any).data.error).toBe('Internal Server Error');
  });
});

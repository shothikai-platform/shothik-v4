import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock Next.js Server Response
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => {
        return {
          status: init?.status ?? 200,
          json: async () => body,
        };
      }),
    },
  };
});

// Mock Authentication
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('Geolocation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await POST() as any;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 if API key is not configured', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user1', email: 'test@example.com', name: 'Test User' });

    // Temporarily delete the API key
    const originalApiKey = process.env.GOOGLE_GEOLOCATION_KEY;
    delete process.env.GOOGLE_GEOLOCATION_KEY;

    const response = await POST() as any;

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Google Geolocation API key is not configured');

    // Restore the API key
    if (originalApiKey) {
      process.env.GOOGLE_GEOLOCATION_KEY = originalApiKey;
    }
  });
});

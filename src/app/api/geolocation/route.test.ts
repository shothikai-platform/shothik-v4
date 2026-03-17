import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('Geolocation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 if API key is not configured', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user1' });
    process.env.GOOGLE_GEOLOCATION_KEY = '';

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Google Geolocation API key is not configured');
  });
});

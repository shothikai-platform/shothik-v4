import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextRequest } from 'next/server';

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('Geolocation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (headers = {}) => {
    return new NextRequest('http://localhost/api/geolocation', {
      method: 'POST',
      headers: new Headers(headers),
    });
  };

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = createRequest();
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 200 and country name on success using IP from headers', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock ipapi.co Response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ country_name: 'United States' }),
    });

    const req = createRequest({ 'x-forwarded-for': '1.1.1.1' });
    const response = await POST(req);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith('https://ipapi.co/1.1.1.1/json/');
    expect(response.status).toBe(200);
    expect(data.location).toBe('united states');
  });

  it('should return 500 and generic error message on API failure', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const req = createRequest();
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});

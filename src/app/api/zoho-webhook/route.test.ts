import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock axios
vi.mock('axios');

// Mock server-auth
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('Zoho Webhook API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthorized
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 500 if ZOHO_WEBHOOK_URL is not defined (even if auth)', async () => {
    // Mock authorized
    (getAuthenticatedUser as any).mockResolvedValue({ _id: '123' });
    delete process.env.ZOHO_WEBHOOK_URL;

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);

    // Check status
    expect(response.status).toBe(500);
  });

  it('should post to ZOHO_WEBHOOK_URL and return 200 on success', async () => {
    // Mock authorized
    (getAuthenticatedUser as any).mockResolvedValue({ _id: '123' });

    const mockUrl = 'https://mock-zoho.com/webhook';
    process.env.ZOHO_WEBHOOK_URL = mockUrl;

    (axios.post as any).mockResolvedValue({ data: { success: true } });

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);

    // This assertion ensures we are NOT using the hardcoded URL anymore
    expect(axios.post).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({ event: { some: 'data' } })
    );
    expect(response.status).toBe(200);
  });
});

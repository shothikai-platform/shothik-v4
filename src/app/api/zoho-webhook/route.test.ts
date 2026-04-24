import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock axios and server-auth
vi.mock('axios');
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
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if event data is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Event data is required');
  });

  it('should return 500 if ZOHO_WEBHOOK_URL is not defined', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    delete process.env.ZOHO_WEBHOOK_URL;

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to send to Zoho');
  });

  it('should post to ZOHO_WEBHOOK_URL and return 200 on success', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    const mockUrl = 'https://mock-zoho.com/webhook';
    process.env.ZOHO_WEBHOOK_URL = mockUrl;

    (axios.post as any).mockResolvedValue({ data: { success: true } });

    const request = new Request('http://localhost/api/zoho-webhook', {
      method: 'POST',
      body: JSON.stringify({ event: { some: 'data' } }),
    });

    const response = await POST(request);

    expect(axios.post).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({ event: { some: 'data' } })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { POST } from './route';

vi.mock('axios');

describe('POST /api/zoho-webhook', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should post to Zoho when ZOHO_WEBHOOK_URL is set', async () => {
    process.env.ZOHO_WEBHOOK_URL = 'https://mock-zoho.com';
    const mockEvent = { type: 'test' };
    const request = {
      json: vi.fn().mockResolvedValue({ event: mockEvent }),
    };

    axios.post.mockResolvedValue({});

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('https://mock-zoho.com', { event: mockEvent });
  });

  it('should return 500 when ZOHO_WEBHOOK_URL is missing', async () => {
    delete process.env.ZOHO_WEBHOOK_URL;
    const mockEvent = { type: 'test' };
    const request = {
      json: vi.fn().mockResolvedValue({ event: mockEvent }),
    };

    // Suppress console.error during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Configuration Error');
    expect(axios.post).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

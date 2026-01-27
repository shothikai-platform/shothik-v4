import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import axios from 'axios';

vi.mock('axios');

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

  it('should return 500 if ZOHO_FLOW_WEBHOOK_URL is missing', async () => {
    delete process.env.ZOHO_FLOW_WEBHOOK_URL;

    const request = {
      json: async () => ({ event: 'test_event' }),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Configuration error');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should post to Zoho and return 200 if env var is set', async () => {
    process.env.ZOHO_FLOW_WEBHOOK_URL = 'https://fake-zoho.com/webhook';
    axios.post.mockResolvedValue({});

    const request = {
      json: async () => ({ event: 'test_event' }),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith('https://fake-zoho.com/webhook', { event: 'test_event' });
  });

  it('should return 500 if axios fails', async () => {
    process.env.ZOHO_FLOW_WEBHOOK_URL = 'https://fake-zoho.com/webhook';
    axios.post.mockRejectedValue(new Error('Network error'));

    const request = {
      json: async () => ({ event: 'test_event' }),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send to Zoho');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({
          data,
          options,
          status: options?.status || 200,
          json: async () => data
      })),
    }
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_GEOLOCATION_KEY = 'mock-key';
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock Request object if needed (Vitest/JSDOM provides Request, but we can mock json())
// We'll create a simple mock for Request to avoid complications
class MockRequest {
  constructor(public url: string, public init: RequestInit = {}) {}
  async json() {
    if (this.init.body) {
      return JSON.parse(this.init.body as string);
    }
    return {};
  }
}

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent unauthenticated update (return 401)', async () => {
    // 1. Mock NO user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // 2. Mock DB would succeed if called insecurely
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'Hacked Name' });

    // 3. Call endpoint
    const req = new MockRequest('http://localhost/api', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacked Name' })
    });

    const response = await PUT(req as any, { params: Promise.resolve({ id: 'chat1' }) });

    // 4. Assert 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should prevent IDOR: user cannot update another user\'s chat (return 404)', async () => {
    // 1. Mock Authenticated User "Attacker"
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'attacker_id' });

    // 2. Mock insecure DB call (would succeed if used)
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'victim_chat', userId: 'victim_id', name: 'Hacked Name' });

    // 3. Mock secure DB call (should return null because userId doesn't match)
    mockFindOneAndUpdate.mockResolvedValue(null);

    // 4. Call endpoint
    const req = new MockRequest('http://localhost/api', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacked Name' })
    });

    const response = await PUT(req as any, { params: Promise.resolve({ id: 'victim_chat' }) });

    // 5. Assert 404 Not Found (because we search scoped to user)
    // If the code is insecure, it uses findByIdAndUpdate and returns 200 (mocked above)
    expect(response.status).toBe(404);
  });
});

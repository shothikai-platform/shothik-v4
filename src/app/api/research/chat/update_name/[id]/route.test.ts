
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

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
        }
    }
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated update', async () => {
    // Current behavior: allows update even if user is null
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', title: 'New Name' });

    const request = {
        json: async () => ({ name: 'New Name' })
    } as any;

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    // Expect 401 (Secure)
    expect(response.status).toBe(401);
  });

  it('should prevent IDOR (users cannot update others chats)', async () => {
    // Authenticated as user2, but updating user1's chat
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // The DB finds the chat (belonging to user1) and updates it because findById doesn't check owner
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', title: 'New Name' });

    // If we use findOneAndUpdate in the fix, we should mock that returning null (not found for this user)
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = {
        json: async () => ({ name: 'New Name' })
    } as any;

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    // Vulnerable behavior: 200 (Current) -> Expect 404 (Secure)
    expect(response.status).toBe(404);
  });
});

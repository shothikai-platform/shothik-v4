import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/research/chat/get_one_chat/[id]/route';
import { NextResponse } from 'next/server';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));

// Hoist variables for mocks
const mockChat = {
  _id: 'chat-123',
  userId: 'user-owner',
  name: 'Secret Research',
  toObject: () => ({ _id: 'chat-123', userId: 'user-owner', name: 'Secret Research' })
};

const mockFindById = vi.fn();
const mockFindOne = vi.fn();

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: vi.fn((id) => mockFindById(id)),
      findOne: vi.fn((query) => mockFindOne(query)),
      schema: { obj: {} },
      modelName: 'ResearchChat'
    }
  };
});

// Mock server-auth
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser()
}));

describe('Research Chat Security - IDOR Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SECURITY CHECK: GET /get_one_chat/[id] returns 401 without authentication', async () => {
    // Setup: Chat exists, but user is NOT authenticated
    mockGetAuthenticatedUser.mockResolvedValue(null);
    // findOne shouldn't be reached, but mock it just in case
    mockFindOne.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const params = Promise.resolve({ id: 'chat-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error', 'Unauthorized');
  });

  it('SECURITY CHECK: GET /get_one_chat/[id] returns 404 for wrong user', async () => {
    // Setup: Chat belongs to 'user-owner', but 'user-attacker' is requesting
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-attacker', id: 'user-attacker' });

    // Simulate DB returning null because query condition { userId: 'user-attacker' } will not match the chat
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const params = Promise.resolve({ id: 'chat-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error', 'Chat not found');

    // Verify that findOne was called with correct parameters
    expect(mockFindOne).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'chat-123',
        userId: 'user-attacker' // Should be the requester's ID
    }));
  });

  it('SUCCESS: GET /get_one_chat/[id] returns chat for owner', async () => {
    // Setup: Chat belongs to 'user-owner', and 'user-owner' is requesting
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-owner', id: 'user-owner' });
    mockFindOne.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const params = Promise.resolve({ id: 'chat-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('_id', 'chat-123');
     // Verify that findOne was called with correct parameters
    expect(mockFindOne).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'chat-123',
        userId: 'user-owner'
    }));
  });
});

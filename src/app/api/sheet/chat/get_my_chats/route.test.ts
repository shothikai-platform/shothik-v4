import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Hoist mocks
const mockLean = vi.hoisted(() => vi.fn());
const mockSort = vi.hoisted(() => vi.fn().mockReturnValue({ lean: mockLean }));
const mockFind = vi.hoisted(() => vi.fn().mockReturnValue({ sort: mockSort }));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({ json: data })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lean sessions with correctly mapped id property', async () => {
    // Mock the chained query: find({}).sort({ updatedAt: -1 }).lean()
    const mockDbSessions = [
      { _id: 'session1', title: 'Session 1', status: 'active' },
      { _id: 'session2', title: 'Session 2', status: 'archived' },
    ];

    mockLean.mockResolvedValueOnce(mockDbSessions);

    const request = new Request('http://localhost');
    const response = await GET(request);

    // Verify query chain execution
    expect(SheetSession.find).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Verify the response format matches our mapping
    expect(NextResponse.json).toHaveBeenCalledWith([
      { _id: 'session1', id: 'session1', title: 'Session 1', status: 'active' },
      { _id: 'session2', id: 'session2', title: 'Session 2', status: 'archived' },
    ]);
  });
});

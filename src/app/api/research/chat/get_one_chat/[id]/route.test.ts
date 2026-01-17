import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
    const request = new Request('http://localhost/api/research/chat/get_one_chat/123');
    const params = Promise.resolve({ id: '123' });

    const response = await GET(request, { params });
    // @ts-ignore
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    const mockUser = { _id: 'user1', name: 'Test', email: 'test@example.com' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    // We expect the implementation to switch to findOne with userId check.
    // If it uses findById (vulnerable), it wouldn't pass the userId check implicitly unless we rely on findOne mocking behavior.
    // Here we mock findOne to return null, simulating that the chat wasn't found FOR THIS USER.
    vi.mocked(ResearchChat.findOne).mockResolvedValue(null);

    // If the code still uses findById (vulnerable), we mock that too to see what happens?
    // If vulnerable code runs: it calls findById, gets result (if we mocked it), returns 200.
    // So to verify fix, we want 404.

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat1');
    const params = Promise.resolve({ id: 'chat1' });

    const response = await GET(request, { params });
    // @ts-ignore
    expect(response.status).toBe(404);
  });

  it('should return 200 and chat if user owns it', async () => {
    const mockUser = { _id: 'user1', name: 'Test', email: 'test@example.com' };
    const mockChat = { _id: 'chat1', userId: 'user1', name: 'Test Chat' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);
    vi.mocked(ResearchChat.findOne).mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat1');
    const params = Promise.resolve({ id: 'chat1' });

    const response = await GET(request, { params });
    // @ts-ignore
    expect(response.status).toBe(200);
    // @ts-ignore
    const data = await response.json();
    expect(data).toEqual(mockChat);
  });
});

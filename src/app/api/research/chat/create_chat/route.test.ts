import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('POST /api/research/chat/create_chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/create_chat', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Chat' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 if name is longer than 100 characters', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const longName = 'a'.repeat(101);
    const req = new Request('http://localhost/api/research/chat/create_chat', {
      method: 'POST',
      body: JSON.stringify({ name: longName }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((response as any).data.error).toBe('Name must be a string up to 100 characters long');
  });

  it('should return 400 if name is not a string', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const req = new Request('http://localhost/api/research/chat/create_chat', {
      method: 'POST',
      body: JSON.stringify({ name: 12345 }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((response as any).data.error).toBe('Name must be a string up to 100 characters long');
  });

  it('should successfully create a chat with default name if name is omitted', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.create as any).mockResolvedValue({
      _id: 'chat123',
      userId: 'user123',
      name: 'New Research',
      messages: [],
    });

    const req = new Request('http://localhost/api/research/chat/create_chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(ResearchChat.create).toHaveBeenCalledWith({
      userId: 'user123',
      name: 'New Research',
      messages: [],
    });
  });

  it('should successfully create a chat with valid custom name', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.create as any).mockResolvedValue({
      _id: 'chat123',
      userId: 'user123',
      name: 'My Valid Chat',
      messages: [],
    });

    const req = new Request('http://localhost/api/research/chat/create_chat', {
      method: 'POST',
      body: JSON.stringify({ name: '  My Valid Chat  ' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(ResearchChat.create).toHaveBeenCalledWith({
      userId: 'user123',
      name: 'My Valid Chat',
      messages: [],
    });
  });
});

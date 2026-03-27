import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

const mockJson = vi.hoisted(() => vi.fn().mockReturnValue({}));
vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    await PUT(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should call findOneAndUpdate with id and userId', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue({ _id: 'chat123', name: 'New Name' });

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    await PUT(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
    expect(mockJson).toHaveBeenCalledWith({ _id: 'chat123', name: 'New Name' });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    await PUT(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });
});

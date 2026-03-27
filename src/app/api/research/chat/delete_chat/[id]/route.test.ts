import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
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
    findOneAndDelete: vi.fn(),
  },
}));

const mockJson = vi.hoisted(() => vi.fn().mockReturnValue({}));
vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should call findOneAndDelete with id and userId', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: 'chat123' });

    const request = new Request('http://localhost');
    await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123',
    });
    expect(mockJson).toHaveBeenCalledWith({ success: true });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });
});

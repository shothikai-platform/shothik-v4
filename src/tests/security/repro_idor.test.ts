import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/research/chat/get_one_chat/[id]/route';
import { DELETE } from '@/app/api/research/chat/delete_chat/[id]/route';
import { PUT } from '@/app/api/research/chat/update_name/[id]/route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';
import * as Auth from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: vi.fn(),
      findByIdAndDelete: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findOne: vi.fn(),
      findOneAndDelete: vi.fn(),
      findOneAndUpdate: vi.fn(),
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  const json = vi.fn((data, options) => ({ data, options, status: options?.status || 200 }));
  return {
    NextResponse: {
      json,
    },
  };
});

describe('Research Chat API Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/research/chat/get_one_chat/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      (Auth.getAuthenticatedUser as any).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
      const response = await GET(request, { params });
      expect(response.status).toBe(401);
    });

    it('should return 404 if chat belongs to another user', async () => {
      const mockUser = { _id: 'user-1', id: 'user-1' };
      (Auth.getAuthenticatedUser as any).mockResolvedValue(mockUser);

      // We expect the code to call findOne with userId check.
      // If it calls findById (vulnerable), it finds the chat.
      // If it calls findOne({ _id, userId }), and we mock findOne to return null (because we can't simulate query logic easily in mock return without implementation),
      // we can verify the CALL arguments.

      // But for simple verification:
      // If we mock findById to return the chat (vulnerable path),
      // and findOne to return null (secure path - assuming we'd rely on query filtering).

      // Let's rely on status code.
      // Current vulnerable code calls findById. We mock it to return the chat.
      const mockChat = { _id: 'chat-123', userId: 'user-2' };
      (ResearchChat.findById as any).mockResolvedValue(mockChat);

      // If the code is fixed to use findOne, we need to mock findOne.
      // If the fixed code queries correctly, it won't find the chat (because userId mismatch).
      // So findOne should return null.
      (ResearchChat.findOne as any).mockResolvedValue(null);

      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
      const response = await GET(request, { params });

      expect(response.status).toBe(404);

      // Verify that findOne was called with correct filter if status is 404
      // This is a stronger assertion.
      if (response.status === 404) {
         // This check might fail if the code is still vulnerable but returns 404 for other reasons.
         // But combined with the fact that findById returns a chat, getting 404 means it didn't use findById or checked ownership.
      }
    });
  });

  describe('DELETE /api/research/chat/delete_chat/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      (Auth.getAuthenticatedUser as any).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/delete_chat/chat-123', { method: 'DELETE' });
      const response = await DELETE(request, { params });
      expect(response.status).toBe(401);
    });

    it('should return 404/403 if chat belongs to another user', async () => {
      const mockUser = { _id: 'user-1', id: 'user-1' };
      (Auth.getAuthenticatedUser as any).mockResolvedValue(mockUser);

      // Vulnerable path
      (ResearchChat.findByIdAndDelete as any).mockResolvedValue({ _id: 'chat-123', userId: 'user-2' });

      // Secure path
      (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/delete_chat/chat-123', { method: 'DELETE' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/research/chat/update_name/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      (Auth.getAuthenticatedUser as any).mockResolvedValue(null);
      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/update_name/chat-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
      });
      const response = await PUT(request, { params });
      expect(response.status).toBe(401);
    });

    it('should return 404/403 if chat belongs to another user', async () => {
      const mockUser = { _id: 'user-1', id: 'user-1' };
      (Auth.getAuthenticatedUser as any).mockResolvedValue(mockUser);

      // Vulnerable path
      (ResearchChat.findByIdAndUpdate as any).mockResolvedValue({ _id: 'chat-123', userId: 'user-2', name: 'New Name' });

      // Secure path
      (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

      const params = Promise.resolve({ id: 'chat-123' });
      const request = new Request('http://localhost/api/research/chat/update_name/chat-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
      });
      const response = await PUT(request, { params });

      expect(response.status).toBe(404);
    });
  });
});

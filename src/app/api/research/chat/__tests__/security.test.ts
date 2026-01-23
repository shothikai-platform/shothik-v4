import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../delete_chat/[id]/route';
import { GET } from '../get_one_chat/[id]/route';
import { PUT } from '../update_name/[id]/route';
import * as serverAuth from '@/lib/server-auth';

// Define mocks using vi.hoisted so they can be used in vi.mock
const {
  mockFindOneAndDelete,
  mockFindOne,
  mockFindOneAndUpdate,
  mockFindByIdAndDelete,
  mockFindById,
  mockFindByIdAndUpdate
} = vi.hoisted(() => ({
  mockFindOneAndDelete: vi.fn(),
  mockFindOne: vi.fn(),
  mockFindOneAndUpdate: vi.fn(),
  mockFindByIdAndDelete: vi.fn(),
  mockFindById: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
}));

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({ default: vi.fn() }));

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOneAndDelete: mockFindOneAndDelete,
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
      findByIdAndDelete: mockFindByIdAndDelete,
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    }
  };
});

vi.mock('@/lib/server-auth');

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init: any) => ({ body, init }),
  },
}));

describe('Research Chat API Security', () => {
    const mockUserId = 'user-123';
    const mockUser = { _id: mockUserId, name: 'Test User', email: 'test@example.com' };
    const mockChatId = 'chat-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('DELETE /api/research/chat/delete_chat/[id]', () => {
        it('should return 401 if not authenticated', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(null);
            const request = new Request('http://localhost');
            const params = Promise.resolve({ id: mockChatId });

            const response = await DELETE(request, { params }) as any;

            // Check for 401 status
            // If the code returns a normal NextResponse, our mock returns { body, init }
            // If the code uses helper function or something else, it might differ
            // But based on read files, it returns NextResponse.json({...}, { status: ... })

            // In current vulnerable code, it proceeds to delete, so status is likely undefined (200) or 500
            expect(response.init?.status).toBe(401);
            expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
            expect(mockFindOneAndDelete).not.toHaveBeenCalled();
        });

        it('should verify ownership when deleting', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);
            mockFindOneAndDelete.mockResolvedValue({ _id: mockChatId });

            const request = new Request('http://localhost');
            const params = Promise.resolve({ id: mockChatId });

            await DELETE(request, { params });

            expect(mockFindOneAndDelete).toHaveBeenCalledWith({
                _id: mockChatId,
                userId: mockUserId
            });
            expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/research/chat/get_one_chat/[id]', () => {
        it('should return 401 if not authenticated', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(null);
            const request = new Request('http://localhost');
            const params = Promise.resolve({ id: mockChatId });

            const response = await GET(request, { params }) as any;

            expect(response.init?.status).toBe(401);
            expect(mockFindById).not.toHaveBeenCalled();
            expect(mockFindOne).not.toHaveBeenCalled();
        });

        it('should verify ownership when fetching', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);
            mockFindOne.mockResolvedValue({ _id: mockChatId });

            const request = new Request('http://localhost');
            const params = Promise.resolve({ id: mockChatId });

            await GET(request, { params });

            expect(mockFindOne).toHaveBeenCalledWith({
                _id: mockChatId,
                userId: mockUserId
            });
            expect(mockFindById).not.toHaveBeenCalled();
        });
    });

    describe('PUT /api/research/chat/update_name/[id]', () => {
        it('should return 401 if not authenticated', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(null);
            const request = new Request('http://localhost', {
                method: 'PUT',
                body: JSON.stringify({ name: 'New Name' })
            });
            const params = Promise.resolve({ id: mockChatId });

            const response = await PUT(request, { params }) as any;

            expect(response.init?.status).toBe(401);
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
        });

        it('should verify ownership when updating', async () => {
            vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);
            mockFindOneAndUpdate.mockResolvedValue({ _id: mockChatId });

            const request = new Request('http://localhost', {
                method: 'PUT',
                body: JSON.stringify({ name: 'New Name' })
            });
            const params = Promise.resolve({ id: mockChatId });

            await PUT(request, { params });

            expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
                { _id: mockChatId, userId: mockUserId },
                { name: 'New Name' },
                { new: true }
            );
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });
    });
});

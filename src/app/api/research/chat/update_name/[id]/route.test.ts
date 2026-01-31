import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

// Use vi.hoisted to ensure mocks are available for the hoisted vi.mock calls
const {
  mockDbConnect,
  mockFindByIdAndUpdate,
  mockFindOneAndUpdate,
  mockGetAuthenticatedUser
} = vi.hoisted(() => ({
  mockDbConnect: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
  mockFindOneAndUpdate: vi.fn(),
  mockGetAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndUpdate: (...args: any[]) => mockFindByIdAndUpdate(...args),
    findOneAndUpdate: (...args: any[]) => mockFindOneAndUpdate(...args),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
        ...data,
        status: options?.status || 200,
        ok: (options?.status || 200) < 300
    })),
  },
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Secure: returns 401 if user is not authenticated', async () => {
    const params = Promise.resolve({ id: 'chat-123' });
    const request = {
      json: async () => ({ name: 'New Name' }),
    } as unknown as Request;

    mockGetAuthenticatedUser.mockResolvedValue(null);

    const response = await PUT(request, { params });

    expect(mockGetAuthenticatedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('Secure & Bug Fixed: updates name for authorized user with correct query and field', async () => {
    const params = Promise.resolve({ id: 'chat-123' });
    const request = {
      json: async () => ({ name: 'New Name' }),
    } as unknown as Request;

    const mockUser = { _id: 'user-789' };
    mockGetAuthenticatedUser.mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat-123', name: 'New Name' });

    const response = await PUT(request, { params });

    expect(mockGetAuthenticatedUser).toHaveBeenCalled();

    // Verify we used findOneAndUpdate (not findByIdAndUpdate) with userId check
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat-123', userId: 'user-789' },
        { name: 'New Name' }, // Correct field 'name'
        { new: true }
    );

    expect(response.status).toBe(200);
  });
});

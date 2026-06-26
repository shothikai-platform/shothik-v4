
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
      create: mockCreate,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: vi.fn().mockImplementation((data) => ({
        ...data,
        _id: 'conv123',
        save: mockSave,
      })),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        stream: any;
        init: any;
        status: number;
        constructor(stream: any, init: any) {
            this.stream = stream;
            this.init = init;
            this.status = init?.status || 200;
        }
        static json(data: any, options: any) {
            return {
                data,
                options,
                status: options?.status || 200,
                json: async () => data
            };
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});


import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Create a spreadsheet' })
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'Create a spreadsheet'
    }));
  });

  it('should use existing session if chatId is provided and belongs to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = { _id: 'session123', title: 'old', save: mockSave };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'update', chat: 'session123' })
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
    expect(mockSave).toHaveBeenCalled();
  });

  it('should create a new session if provided chatId does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null); // Not found for this user
    mockCreate.mockResolvedValue({ _id: 'newSession', title: 'new', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'malicious', chat: 'otherUsersSession' })
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherUsersSession', userId: 'user123' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});

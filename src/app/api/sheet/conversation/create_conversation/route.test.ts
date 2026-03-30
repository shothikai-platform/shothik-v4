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
            create: vi.fn().mockResolvedValue({
                _id: 'conv123',
                events: [],
                save: mockSave,
            }),
        },
    };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        data: any;
        options: any;
        status: number;
        constructor(body: any, options: any) {
            this.data = body;
            this.options = options;
            this.status = options?.status || 200;
        }
        static json(data: any, options: any) {
            return new MockNextResponse(data, options);
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('POST /api/sheet/conversation/create_conversation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);
        const request = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'test' }),
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
        expect((response as any).data).toEqual({ error: 'Unauthorized' });
    });

    it('should create a new session with the authenticated user ID if no chatId is provided', async () => {
        const mockUser = { _id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

        const request = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Test Prompt' }),
        });

        await POST(request);

        expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'user123',
            title: 'Test Prompt',
        }));
    });

    it('should securely fetch session with ownership check if chatId is provided', async () => {
        const mockUser = { _id: 'user123' };
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        const mockSession = { _id: 'session123', title: 'test', save: mockSave };
        mockFindOne.mockResolvedValue(mockSession);

        const request = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'Update', chat: 'session123' }),
        });

        await POST(request);

        expect(SheetSession.findOne).toHaveBeenCalledWith({
            _id: 'session123',
            userId: 'user123',
        });
        expect(mockSave).toHaveBeenCalled();
    });
});

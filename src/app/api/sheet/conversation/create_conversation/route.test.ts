import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
const mockUser = { _id: 'user123', id: 'user123' };

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

// Mock DB Connect
vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

// Mock Models
const mockSession = {
    _id: 'session123',
    userId: 'user123',
    title: 'Test Session',
    save: vi.fn(),
};

const mockConversation = {
    _id: 'conv123',
    response: {},
    status: 'generating',
    events: [],
    save: vi.fn(),
};

vi.mock('@/models/SheetSession', () => {
    return {
        default: {
            findById: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
        }
    };
});

vi.mock('@/models/SheetConversation', () => {
    return {
        default: {
            create: vi.fn(),
        }
    };
});

// Mock Next Response
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body: any, init: any) {
                (this as any).status = init?.status || 200;
                (this as any).body = body;
            }
            static json(body: any, init: any) {
                return { status: init?.status || 200, json: async () => body };
            }
        }
    };
});

// Import mocks after hoisting/mocking
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';

describe('Sheet Conversation API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (SheetSession.create as any).mockResolvedValue(mockSession);
        (SheetConversation.create as any).mockResolvedValue(mockConversation);
        // Mock ReadableStream for response
        global.ReadableStream = classMockReadableStream as any;
        global.TextEncoder = classMockTextEncoder as any;
    });

    const createMockRequest = (body: any) => {
        return {
            json: async () => body,
        } as unknown as Request;
    };

    it('should return 401 if user is not authenticated', async () => {
        (getAuthenticatedUser as any).mockResolvedValue(null);

        const request = createMockRequest({ prompt: 'test' });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should create a new session with correct userId if no chatId provided', async () => {
        const request = createMockRequest({ prompt: 'test' });

        await POST(request);

        expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
            userId: mockUser.id, // Should use the authenticated user ID
        }));
    });

    it('should verify ownership when chatId is provided', async () => {
        // Simulate session not found for this user (because ownership check filters it out)
        (SheetSession.findOne as any).mockResolvedValue(null);

        const request = createMockRequest({ prompt: 'test', chat: 'session123' });

        const response = await POST(request);

        expect(response.status).toBe(404);

        expect(SheetSession.findOne).toHaveBeenCalledWith(expect.objectContaining({
            _id: 'session123',
            userId: mockUser.id
        }));
    });
});

// Mock Helper Classes
class classMockReadableStream {
    constructor() {}
}
class classMockTextEncoder {
    encode(str: string) { return str; }
}

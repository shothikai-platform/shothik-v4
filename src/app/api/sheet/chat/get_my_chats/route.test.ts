import { expect, test, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

const { mockJson } = vi.hoisted(() => ({ mockJson: vi.fn() }));
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((data, options) => {
                const response = { ...options, data };
                response.json = async () => data;
                mockJson(data, options);
                return response;
            }),
        },
    };
});

vi.mock('@/lib/server-auth', () => ({
    getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
    default: vi.fn(),
}));

const { mockLean, mockSort, mockFind } = vi.hoisted(() => {
    const mockLean = vi.fn();
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
    return { mockLean, mockSort, mockFind };
});

vi.mock('@/models/SheetSession', () => ({
    default: {
        find: mockFind,
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

test('GET /api/sheet/chat/get_my_chats returns 401 when unauthorized', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
});

test('GET /api/sheet/chat/get_my_chats returns chats for authenticated user', async () => {
    const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    const mockSessions = [
        { _id: { toString: () => 'chat1' }, title: 'Chat 1', status: 'active' },
        { _id: { toString: () => 'chat2' }, title: 'Chat 2', status: 'active' },
    ];
    mockLean.mockResolvedValue(mockSessions);

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(dbConnect).toHaveBeenCalled();
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(mockJson).toHaveBeenCalledWith([
        { _id: mockSessions[0]._id, title: 'Chat 1', status: 'active', id: 'chat1' },
        { _id: mockSessions[1]._id, title: 'Chat 2', status: 'active', id: 'chat2' },
    ], undefined);
});

test('GET /api/sheet/chat/get_my_chats returns 500 on server error', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
    vi.mocked(dbConnect).mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(mockJson).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
});

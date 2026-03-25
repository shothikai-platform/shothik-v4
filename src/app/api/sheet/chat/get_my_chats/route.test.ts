import { test, expect, vi } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const mockNextResponseJson = vi.hoisted(() => vi.fn().mockImplementation((data, init) => {
    return {
        status: init?.status || 200,
        json: async () => data,
    };
}));

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: mockNextResponseJson
        },
    };
});

const mockLean = vi.hoisted(() => vi.fn().mockResolvedValue([
    { _id: '123', title: 'Test Session', updatedAt: new Date() }
]));

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: mockLean
        })
      })
    }
  };
});

test('GET returns mapped sheet sessions correctly', async () => {
  const req = new Request('http://localhost/api');

  const response = await GET(req);
  const data = await response.json();

  expect(dbConnect).toHaveBeenCalled();
  expect(SheetSession.find).toHaveBeenCalledWith({});

  // Verify that the id virtual is mapped correctly
  expect(data).toHaveLength(1);
  expect(data[0].id).toBe('123');
  expect(data[0].title).toBe('Test Session');
  expect(data[0]._id).toBe('123');
});

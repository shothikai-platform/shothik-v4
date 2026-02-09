import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useGeolocation from '../useGeolocation';
import { getUserLocation } from '@/utils/getUserLocation';

// Mock the getUserLocation module
vi.mock('@/utils/getUserLocation', () => ({
  getUserLocation: vi.fn(),
}));

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return location when getUserLocation succeeds', async () => {
    // Mock implementation
    vi.mocked(getUserLocation).mockResolvedValue({
      country: 'Bangladesh',
      countryCode: 'BD',
      region: 'Dhaka',
      city: 'Dhaka'
    });

    const { result } = renderHook(() => useGeolocation());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.location).toBe(null);

    // Wait for update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.location).toBe('bangladesh');
    expect(result.current.error).toBe(null);
  });

  it('should handle error when getUserLocation fails', async () => {
    vi.mocked(getUserLocation).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.location).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle null return from getUserLocation', async () => {
    vi.mocked(getUserLocation).mockResolvedValue(null);

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.location).toBe(null);
    expect(result.current.error).toBe('Could not determine location');
  });
});

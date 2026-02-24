import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useGeolocation from './useGeolocation';
import * as useUserLocationModule from '@/hooks/utils/useUserLocation';

// Mock the hook
vi.mock('@/hooks/utils/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}));

describe('useGeolocation', () => {
  it('should return location and loading state from useUserLocation', () => {
    // Mock return value
    vi.mocked(useUserLocationModule.useUserLocation).mockReturnValue({
      country: 'Bangladesh',
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.location).toBe('bangladesh');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle null location', () => {
     vi.mocked(useUserLocationModule.useUserLocation).mockReturnValue({
      country: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.location).toBe(null);
    expect(result.current.isLoading).toBe(true);
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useGeolocation from './useGeolocation';
import React from 'react';

describe('useGeolocation', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return location when API call succeeds', async () => {
    const mockData = { country_name: 'Bangladesh' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useGeolocation());

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Wait for update
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.location).toBe('bangladesh');
    expect(result.current.error).toBe(null);
  });

  it('should handle API failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.location).toBe(null);
    expect(result.current.error).toBe('Failed to fetch location from ipapi.co');
  });

  it('should handle network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.location).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
});

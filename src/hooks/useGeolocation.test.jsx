import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useGeolocation from './useGeolocation';

describe('useGeolocation', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should try ipwho.is first and return country', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, country: 'Canada' }),
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.location).toBe('canada');
    });

    expect(global.fetch).toHaveBeenCalledWith('https://ipwho.is/');
  });

  it('should fallback to ipapi.co if ipwho.is fails', async () => {
    // ipwho.is fails
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    // ipapi.co succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ country_name: 'France' }),
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.location).toBe('france');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://ipwho.is/');
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://ipapi.co/json/');
  });

  it('should handle errors if both fail', async () => {
    global.fetch.mockRejectedValue(new Error('All failed'));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });
});

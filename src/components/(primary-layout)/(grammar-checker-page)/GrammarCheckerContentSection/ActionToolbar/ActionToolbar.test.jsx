import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionToolbar from './index';
import { expect, test, describe, vi } from 'vitest';

describe('ActionToolbar', () => {
  test('renders with aria-labels', () => {
    const handleCopy = vi.fn();
    const handleClear = vi.fn();
    render(<ActionToolbar text="Hello world" handleCopy={handleCopy} handleClear={handleClear} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy/i })).toBeTruthy();
  });
});

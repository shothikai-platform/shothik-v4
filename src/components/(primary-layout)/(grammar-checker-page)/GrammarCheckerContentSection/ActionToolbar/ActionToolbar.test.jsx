import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActionToolbar from './index';

describe('ActionToolbar', () => {
  it('renders with correct aria-labels and focus classes', () => {
    render(<ActionToolbar text="Test text" handleCopy={() => {}} handleClear={() => {}} />);

    const deleteButton = screen.getByLabelText('Delete');
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.className).toContain('focus-visible:ring-ring');
    expect(deleteButton.className).toContain('focus-visible:outline-none');
    expect(deleteButton.className).toContain('focus-visible:ring-2');

    const copyButton = screen.getByLabelText('Copy');
    expect(copyButton).toBeTruthy();
    expect(copyButton.className).toContain('focus-visible:ring-ring');
    expect(copyButton.className).toContain('focus-visible:outline-none');
    expect(copyButton.className).toContain('focus-visible:ring-2');
  });
});

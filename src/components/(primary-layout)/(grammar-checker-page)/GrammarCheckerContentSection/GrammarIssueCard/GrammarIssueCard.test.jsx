import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrammarIssueCard from './index.jsx';

describe('GrammarIssueCard', () => {
  it('renders accessible accept and ignore icon buttons', () => {
    const issue = { error: 'bad', correct: 'good', sentence: 'This is bad.', type: 'grammar' };
    render(<GrammarIssueCard issue={issue} handleAccept={vi.fn()} handleIgnore={vi.fn()} />);

    // Check for the icon-only buttons via accessible name
    expect(screen.getByRole('button', { name: 'Accept suggestion' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Ignore suggestion' })).toBeDefined();
  });
});

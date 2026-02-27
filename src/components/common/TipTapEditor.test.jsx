import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import TipTapEditor from './TipTapEditor';

test('renders editor with buttons having title and aria-label', () => {
  render(<TipTapEditor content="" onChange={() => {}} />);

  const boldButton = screen.getByRole('button', { name: /Bold/i });
  expect(boldButton).toBeDefined();
  expect(boldButton.getAttribute('title')).toBe('Bold');
  expect(boldButton.getAttribute('aria-label')).toBe('Bold');

  const italicButton = screen.getByRole('button', { name: /Italic/i });
  expect(italicButton).toBeDefined();
  expect(italicButton.getAttribute('title')).toBe('Italic');
  expect(italicButton.getAttribute('aria-label')).toBe('Italic');

  // Verify a few more to be safe
  const underlineButton = screen.getByRole('button', { name: /Underline/i });
  expect(underlineButton).toBeDefined();

  const h2Button = screen.getByRole('button', { name: /Heading 2/i });
  expect(h2Button).toBeDefined();
});

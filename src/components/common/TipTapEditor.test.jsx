import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TipTapEditor from './TipTapEditor';

afterEach(() => {
  cleanup();
});

// Mock TipTap dependencies to avoid JSDOM errors related to document body / prosemirror
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    getHTML: () => '<p>test content</p>',
    commands: {
      setContent: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleUnderline: vi.fn(),
      setParagraph: vi.fn(),
      setHeading: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleBlockquote: vi.fn(),
      setHorizontalRule: vi.fn(),
    },
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}));

describe('TipTapEditor', () => {
  it('renders toolbar buttons with correct aria-labels', () => {
    render(<TipTapEditor content="<p>test</p>" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Underline' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Paragraph' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Heading 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Heading 3' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Heading 4' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ordered List' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bullet List' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Blockquote' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Horizontal Rule' })).toBeTruthy();
  });
});

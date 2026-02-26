import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import ButtonInsertDocumentText from '../ButtonInsertDocumentText';

// Mock dependencies
vi.mock('mammoth', () => ({
  default: {
    convertToHtml: vi.fn(),
  },
}));

// Mock react-pdf for dynamic import
vi.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: {},
    getDocument: vi.fn(),
    version: '1.0.0',
  },
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  buttonVariants: () => 'mock-button-class',
}));
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
}));
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div>Loading...</div>,
}));
vi.mock('lucide-react', () => ({
  Upload: () => <span>Upload Icon</span>,
}));

afterEach(() => {
  cleanup();
});

describe('ButtonInsertDocumentText', () => {
  it('renders correctly', () => {
    render(<ButtonInsertDocumentText />);
    expect(screen.getByText('Upload Document')).toBeTruthy();
  });

  it('renders a file input inside the label', () => {
    render(<ButtonInsertDocumentText />);
    const input = screen.getByLabelText(/upload document/i);
    expect(input).toBeTruthy();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('file');
  });

  it('has correct accessibility attributes', () => {
    render(<ButtonInsertDocumentText />);
    const input = screen.getByLabelText(/upload document/i);
    expect(input.className).toContain('opacity-0');
    expect(input.getAttribute('accept')).toBe('application/pdf, .docx');
  });
});

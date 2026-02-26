import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ButtonInsertDocumentText from '../ButtonInsertDocumentText';

afterEach(() => {
  cleanup();
});

// Mock imports
vi.mock('mammoth', () => ({
  default: {
    convertToHtml: vi.fn(),
  },
  convertToHtml: vi.fn(),
}));

vi.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    getDocument: vi.fn(),
  },
}));

// Mock Tooltip UI component
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
  Spinner: () => <span data-testid="icon-spinner" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  buttonVariants: () => 'mock-button-class',
}));
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

describe('ButtonInsertDocumentText', () => {
  it('renders correctly', () => {
    render(<ButtonInsertDocumentText />);
    const buttonLabel = screen.getByText('Upload Document');
    expect(buttonLabel).toBeTruthy();
  });

  it('contains a file input', () => {
    const { container } = render(<ButtonInsertDocumentText />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });

  it('applies focus-within class for keyboard accessibility', () => {
    // This test verifies that the focus-within classes are present in the code structure
    // Since we are mocking buttonVariants, we check the explicit class props passed to label
    // The component structure is Tooltip > TooltipTrigger > label
    // However, since TooltipTrigger uses asChild, it might render the label directly or clone it.
    // Our mock for TooltipTrigger renders a div wrapping children.

    render(<ButtonInsertDocumentText />);
    const label = screen.getByText('Upload Document').closest('label');
    expect(label).toBeTruthy();
    expect(label.className).toContain('focus-within:ring-2');
    expect(label.className).toContain('focus-within:ring-ring');
  });
});

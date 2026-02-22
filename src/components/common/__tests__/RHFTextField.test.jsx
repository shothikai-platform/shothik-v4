import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useFormContext, Controller } from 'react-hook-form';
import RHFTextField from '../RHFTextField';

// Mock components
vi.mock('@/components/ui/input', () => ({
  Input: (props) => <input data-testid="input" {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
  Controller: vi.fn(),
}));

describe('RHFTextField', () => {
  const mockControl = {};

  beforeEach(() => {
    useFormContext.mockReturnValue({ control: mockControl });

    // Default implementation for Controller
    Controller.mockImplementation(({ render }) => render({
      field: { value: '', onChange: vi.fn() },
      fieldState: { error: null },
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders input and label correctly', () => {
    render(<RHFTextField name="test" label="Test Label" />);

    expect(screen.getByText('Test Label')).toBeTruthy();
    const input = screen.getByTestId('input');
    expect(input).toBeTruthy();
    expect(input.id).toBe('test');
  });

  it('associates helper text with input via aria-describedby', () => {
    render(<RHFTextField name="test" label="Test Label" helperText="Help text" />);

    const helperText = screen.getByText('Help text');
    const input = screen.getByTestId('input');

    expect(helperText).toBeTruthy();
    // These assertions should fail currently
    expect(helperText.id).toBe('test-description');
    expect(input.getAttribute('aria-describedby')).toBe('test-description');
  });

  it('associates error message with input via aria-describedby and sets aria-invalid', () => {
    // Override Controller mock to simulate error
    Controller.mockImplementation(({ render }) => render({
      field: { value: '', onChange: vi.fn() },
      fieldState: { error: { message: 'Error message' } },
    }));

    render(<RHFTextField name="test" label="Test Label" />);

    const errorMessage = screen.getByText('Error message');
    const input = screen.getByTestId('input');

    expect(errorMessage).toBeTruthy();
    // These assertions should fail currently
    expect(errorMessage.id).toBe('test-description');
    expect(input.getAttribute('aria-describedby')).toBe('test-description');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

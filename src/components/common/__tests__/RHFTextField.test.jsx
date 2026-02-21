import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RHFTextField from '../RHFTextField';

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  return {
    useFormContext: () => ({
      control: {},
    }),
    Controller: ({ render, name }) => {
      // Simulate field state based on name
      const error = name === 'errorField' ? { message: 'Error message' } : undefined;
      return render({
        field: { name, value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() },
        fieldState: { error },
      });
    },
  };
});

describe('RHFTextField Accessibility', () => {
  it('renders with correct aria attributes when no error', () => {
    render(<RHFTextField name="testField" label="Test Label" helperText="Helper text" />);

    const input = screen.getByLabelText('Test Label');
    expect(input).toBeTruthy();

    // Check aria-describedby
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('testField-description');

    // Check aria-invalid
    const invalid = input.getAttribute('aria-invalid');
    // It should be 'false' or not present depending on implementation,
    // but our goal is to make it explicitly false if valid
    expect(invalid).toBe('false');
  });

  it('renders with correct aria attributes when error exists', () => {
    render(<RHFTextField name="errorField" label="Error Label" />);

    const input = screen.getByLabelText('Error Label');
    expect(input).toBeTruthy();

    // Check aria-describedby
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('errorField-description');

    // Check aria-invalid
    const invalid = input.getAttribute('aria-invalid');
    expect(invalid).toBe('true');

    // Check role="alert" on error message
    const errorMessage = screen.getByText('Error message');
    expect(errorMessage.getAttribute('role')).toBe('alert');
    expect(errorMessage.getAttribute('id')).toBe('errorField-description');
  });
});

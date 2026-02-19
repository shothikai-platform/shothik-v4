import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import RHFTextField from '../RHFTextField';

// Mock dependencies if needed, but trying integration first
// Radix UI Label might need a mock if it misbehaves in JSDOM, but usually it's fine.

afterEach(() => {
  cleanup();
});

const Wrapper = ({ children, defaultValues = { test: '' } }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('RHFTextField', () => {
  it('renders label and input', () => {
    render(
      <Wrapper>
        <RHFTextField name="test" label="Test Label" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toBeTruthy();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders helper text', () => {
    render(
      <Wrapper>
        <RHFTextField name="test" label="Test Label" helperText="Help me" />
      </Wrapper>
    );

    const helper = screen.getByText('Help me');
    expect(helper).toBeTruthy();
  });

  it('connects label to input with generated id', () => {
    render(
      <Wrapper>
        <RHFTextField name="test" label="Test Label" />
      </Wrapper>
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByLabelText('Test Label');

    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('connects label to input with provided id', () => {
    render(
      <Wrapper>
        <RHFTextField name="test" label="Test Label" id="custom-id" />
      </Wrapper>
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByLabelText('Test Label');

    expect(input.id).toBe('custom-id');
    expect(label.getAttribute('for')).toBe('custom-id');
  });

  // This test is expected to fail or be updated after the fix
  it('has accessibility attributes when error is present', () => {
    // We need to simulate an error state.
    // Since it's hard to trigger validation in a simple render, we can mock useFormContext or force error via props if possible.
    // But RHFTextField gets error from context.

    // Let's create a wrapper that forces an error state
    const ErrorWrapper = ({ children }) => {
      const methods = useForm({
        defaultValues: { test: '' },
        errors: { test: { type: 'required', message: 'Required field' } } // This doesn't work directly with useForm, need to setError
      });

      React.useEffect(() => {
        methods.setError('test', { type: 'required', message: 'Required field' });
      }, [methods]);

      return <FormProvider {...methods}>{children}</FormProvider>;
    };

    render(
      <ErrorWrapper>
        <RHFTextField name="test" label="Test Label" />
      </ErrorWrapper>
    );

    // Wait for error to appear
    const errorMsg = screen.getByText('Required field');
    expect(errorMsg).toBeTruthy();

    const input = screen.getByLabelText('Test Label');

    // These assertions check for the improvements we WANT to make
    // Currently they might fail or simply check for absence if we were testing for bugs

    // Check if aria-invalid is set (currently it's not)
    expect(input.getAttribute('aria-invalid')).toBe('true');

    // Check if aria-describedby points to the error message (currently it's not)
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toBe(errorMsg.id);

    // Verify error message has role="alert" or is linked
    // expect(errorMsg.getAttribute('role')).toBe('alert');
  });
});

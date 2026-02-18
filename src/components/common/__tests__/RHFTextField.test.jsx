import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import RHFTextField from '../RHFTextField';

afterEach(() => {
  cleanup();
});

const Wrapper = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      testField: '',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const ErrorWrapper = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      testField: '',
    },
  });

  React.useEffect(() => {
     methods.setError('testField', { type: 'custom', message: 'Error message' });
  }, [methods]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('RHFTextField Accessibility', () => {
  it('renders without accessibility attributes by default', () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Test Label" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toBeTruthy();
    // These assertions are expected to FAIL after the fix is implemented,
    // but initially they might pass if attributes are missing.
    // However, to verify the FIX, we want to check for their PRESENCE.
    // So initially, let's check that they are NOT present or incorrect.

    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('renders with aria-describedby when helperText is provided', () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Test Label" helperText="Helper text" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Test Label');
    const helperText = screen.getByText('Helper text');

    // This is what we WANT to happen after the fix
    expect(input.getAttribute('aria-describedby')).toBe(helperText.id);
  });

  it('renders with aria-invalid and aria-describedby when error is present', () => {
    render(
      <ErrorWrapper>
        <RHFTextField name="testField" label="Test Label" />
      </ErrorWrapper>
    );

    const input = screen.getByLabelText('Test Label');
    const errorMessage = screen.getByText('Error message');

    // This is what we WANT to happen after the fix
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(errorMessage.id);
    expect(errorMessage.getAttribute('role')).toBe('alert');
  });
});

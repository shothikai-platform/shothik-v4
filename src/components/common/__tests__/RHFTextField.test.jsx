import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { describe, it, expect, afterEach } from 'vitest';
import RHFTextField from '../RHFTextField';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

const Wrapper = ({ children, defaultValues = { testField: '' } }) => {
  const methods = useForm({
    defaultValues,
    mode: 'onChange'
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const ErrorTrigger = ({ name, message }) => {
  const { setError } = useFormContext();
  React.useEffect(() => {
    setError(name, { type: 'custom', message });
  }, [setError, name, message]);
  return null;
};

describe('RHFTextField', () => {
  it('renders correctly', () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Test Label" />
      </Wrapper>
    );
    expect(screen.getByLabelText('Test Label')).toBeTruthy();
  });

  it('has aria-invalid and aria-describedby when there is an error', async () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Test Label" />
        <ErrorTrigger name="testField" message="This field is required" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Test Label');
    const errorMessage = await screen.findByText('This field is required');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(errorMessage.id);
    expect(errorMessage.getAttribute('role')).toBe('alert');
  });

  it('links helper text via aria-describedby', () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Test Label" helperText="Helper text" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Test Label');
    const helper = screen.getByText('Helper text');

    expect(input.getAttribute('aria-describedby')).toBe(helper.id);
    // Helper text should NOT have role="alert"
    expect(helper.getAttribute('role')).toBeNull();
  });
});

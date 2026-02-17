import React, { useEffect } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import RHFTextField from '../RHFTextField';

// Wrapper component to provide the form context
const TestWrapper = ({ children, defaultValues = {} }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Wrapper that forces an error state
const ErrorWrapper = ({ name, errorMessage }) => {
  const methods = useForm({
    defaultValues: { [name]: '' },
    mode: 'onChange'
  });

  useEffect(() => {
    methods.setError(name, { type: 'custom', message: errorMessage });
  }, [errorMessage, methods, name]);

  return (
    <FormProvider {...methods}>
      <RHFTextField name={name} label="Test Label" />
    </FormProvider>
  );
};

describe('RHFTextField', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with label and input', () => {
    render(
      <TestWrapper defaultValues={{ testField: '' }}>
        <RHFTextField name="testField" label="Test Label" />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Test Label')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('renders error message and links to input', () => {
    const errorMessage = "Invalid email";
    render(<ErrorWrapper name="email" errorMessage={errorMessage} />);

    const input = screen.getByLabelText('Test Label');
    const errorElement = screen.getByText(errorMessage);

    // Check if aria-invalid is set correctly
    expect(input.getAttribute('aria-invalid')).toBe('true');

    // Check if the error message has an ID
    const errorId = errorElement.getAttribute('id');
    expect(errorId).toBeTruthy();

    // Check if aria-describedby points to the error message ID
    expect(input.getAttribute('aria-describedby')).toBe(errorId);

    // Check if the error message has role="alert"
    expect(errorElement.getAttribute('role')).toBe('alert');
  });
});

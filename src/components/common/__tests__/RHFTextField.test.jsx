import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import RHFTextField from '../RHFTextField';
import { describe, test, expect, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Wrapper component to simulate form context with an error
const TestFormWithError = () => {
  const methods = useForm({
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  React.useEffect(() => {
    // Set an error manually after mount
    methods.setError('email', {
      type: 'manual',
      message: 'Invalid email address'
    });
  }, [methods]);

  return (
    <FormProvider {...methods}>
      <form>
        <RHFTextField name="email" label="Email Address" />
      </form>
    </FormProvider>
  );
};

describe('RHFTextField Accessibility', () => {
  test('renders with aria-invalid="true" when there is an error', async () => {
    render(<TestFormWithError />);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText('Invalid email address');
    expect(errorMessage).toBeTruthy();

    const input = screen.getByLabelText('Email Address');

    // Check for aria-invalid attribute
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  test('renders with aria-describedby pointing to error message', async () => {
    render(<TestFormWithError />);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText('Invalid email address');
    expect(errorMessage).toBeTruthy();

    const input = screen.getByLabelText('Email Address');
    const descriptionId = input.getAttribute('aria-describedby');

    // Check that aria-describedby is present and points to an existing element
    expect(descriptionId).toBeTruthy();
    const descriptionElement = document.getElementById(descriptionId);
    expect(descriptionElement).toBeTruthy();
    expect(descriptionElement.textContent).toBe('Invalid email address');
  });
});

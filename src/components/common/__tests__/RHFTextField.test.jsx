import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import RHFTextField from '../RHFTextField';
import { FormProvider, useForm } from 'react-hook-form';

const Wrapper = ({ children, defaultValues = { testField: '' } }) => {
  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('RHFTextField', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default props', () => {
    render(
      <Wrapper>
        <RHFTextField name="testField" label="Default Label" />
      </Wrapper>
    );

    const input = screen.getByLabelText('Default Label');
    expect(input).toBeDefined();
    // Default aria-invalid should be false
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('renders helper text associated with input via aria-describedby', () => {
    render(
      <Wrapper>
        <RHFTextField
          name="testField"
          label="Helper Label"
          helperText="Helper text content"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText('Helper Label');
    const helperText = screen.getByText('Helper text content');

    expect(input.getAttribute('aria-describedby')).toBe('testField-description');
    expect(helperText.getAttribute('id')).toBe('testField-description');
  });

  it('renders aria-invalid="true" and role="alert" when error is present', async () => {
    const TestComponent = () => {
       const methods = useForm({ mode: 'onChange' });
       // Set error immediately
       React.useEffect(() => {
         methods.setError('testField', { type: 'custom', message: 'Error occurred' });
       }, [methods]);

       return (
         <FormProvider {...methods}>
            <RHFTextField name="testField" label="Error Label" />
         </FormProvider>
       );
    };

    render(<TestComponent />);

    // Wait for the error to appear
    const errorMessage = await screen.findByText('Error occurred');
    const input = screen.getByLabelText('Error Label');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(errorMessage.getAttribute('role')).toBe('alert');
    expect(input.getAttribute('aria-describedby')).toBe('testField-description');
    expect(errorMessage.getAttribute('id')).toBe('testField-description');
  });
});

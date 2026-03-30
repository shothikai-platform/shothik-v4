import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AccountPopover from '@/components/partials/header/AccountPopover';
import authReducer from '@/redux/slices/auth';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  HelpCircle: () => <div data-testid="HelpCircle" />,
  LogIn: () => <div data-testid="LogIn" />,
  Mail: () => <div data-testid="Mail" />,
  User: () => <div data-testid="User" />,
}));

// Mock Radix UI Popover (simplify for testing)
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children, asChild }) => {
    // We need to pass the onClick to trigger state change if we weren't mocking so heavily,
    // but here we just render it. We'll simulate the state being open.
    return <div data-testid="popover-trigger">{children}</div>;
  },
  PopoverContent: ({ children }) => <div data-testid="popover-content">{children}</div>,
}));

// Mock Avatar
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }) => <div>{children}</div>,
  AvatarImage: () => <div>Image</div>,
  AvatarFallback: ({ children }) => <div>{children}</div>,
}));

const renderWithStore = (initialState) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: initialState,
    },
  });

  return render(
    <Provider store={store}>
      <AccountPopover />
    </Provider>
  );
};

describe('AccountPopover Accessibility', () => {
  it('renders trigger button with aria-label="Account"', () => {
    renderWithStore({ user: null, accessToken: null });
    const triggerBtn = screen.getByRole('button', { name: 'Account' });
    expect(triggerBtn).toBeDefined();
  });

  it('renders internal buttons with explicit aria-labels when logged OUT', () => {
    renderWithStore({ user: null, accessToken: null });
    // Note: Since we mocked Popover to always render children, we can just find them
    const loginBtn = screen.getByRole('button', { name: 'Login or Sign up' });
    expect(loginBtn).toBeDefined();
  });

  it('renders internal buttons with explicit aria-labels when logged IN', () => {
    renderWithStore({
      user: { email: 'test@example.com', name: 'Test User' },
      accessToken: 'token'
    });

    const profileBtn = screen.getByRole('button', { name: 'View my profile' });
    expect(profileBtn).toBeDefined();

    const logoutBtn = screen.getByRole('button', { name: 'Log out' });
    expect(logoutBtn).toBeDefined();
  });
});

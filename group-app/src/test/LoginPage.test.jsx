/**
 * Component tests for LoginPage.jsx
 *
 * Verifies the UI renders correctly, calls loginUser on submit,
 * and displays backend error messages to the user.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';

// Mock the authAPI module so tests never make real HTTP calls
vi.mock('../api/authAPI', () => ({
  loginUser: vi.fn(),
}));

// Mock the auth context so the component can call login()
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

import { loginUser } from '../api/authAPI';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders email and password fields and a submit button', () => {
    render(<LoginPage onShowRegister={() => {}} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls loginUser with the entered email and password on submit', async () => {
    loginUser.mockResolvedValue({
      token: 'jwt-abc',
      email: 'alice@ul.ie',
      role: 'STUDENT',
    });

    render(<LoginPage onShowRegister={() => {}} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@ul.ie' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'pass1word' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: 'alice@ul.ie',
        password: 'pass1word',
      });
    });
  });

  it('displays the error message returned by the backend', async () => {
    loginUser.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage onShowRegister={() => {}} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@ul.ie' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls onShowRegister when "Register here" is clicked', () => {
    const onShowRegister = vi.fn();
    render(<LoginPage onShowRegister={onShowRegister} />);

    fireEvent.click(screen.getByRole('button', { name: /register here/i }));

    expect(onShowRegister).toHaveBeenCalledTimes(1);
  });
});

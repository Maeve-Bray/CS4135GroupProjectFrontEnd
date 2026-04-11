/**
 * Contract tests for authAPI.js
 *
 * These tests verify that the frontend API module sends the correct HTTP
 * requests and correctly handles the backend's response contract.
 * fetch is mocked so no real backend is needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser } from '../api/authAPI';

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── registerUser ─────────────────────────────────────────────────────────────

describe('registerUser', () => {
  it('sends POST to /api/auth/register with JSON body', async () => {
    const mockResponse = {
      token: 'jwt-token-abc',
      email: 'alice@ul.ie',
      role: 'STUDENT',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const result = await registerUser({
      email: 'alice@ul.ie',
      password: 'pass1word',
      role: 'STUDENT',
    });

    // Verify fetch was called with correct endpoint and method
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Verify the returned data matches the mock contract
    expect(result.token).toBe('jwt-token-abc');
    expect(result.email).toBe('alice@ul.ie');
    expect(result.role).toBe('STUDENT');
  });

  it('throws an error when the backend responds with 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Email already exists' }),
    }));

    await expect(
      registerUser({ email: 'existing@ul.ie', password: 'pass1word', role: 'STUDENT' })
    ).rejects.toThrow('Email already exists');
  });

  it('throws a default message when backend provides no message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }));

    await expect(
      registerUser({ email: 'x@ul.ie', password: 'pass1word', role: 'STUDENT' })
    ).rejects.toThrow('Registration failed');
  });
});

// ── loginUser ────────────────────────────────────────────────────────────────

describe('loginUser', () => {
  it('sends POST to /api/auth/login with JSON body', async () => {
    const mockResponse = {
      token: 'jwt-token-xyz',
      email: 'alice@ul.ie',
      role: 'STUDENT',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const result = await loginUser({ email: 'alice@ul.ie', password: 'pass1word' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(result.token).toBe('jwt-token-xyz');
  });

  it('throws an error when the backend responds with 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    }));

    await expect(
      loginUser({ email: 'alice@ul.ie', password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('throws a default message when backend provides no message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }));

    await expect(
      loginUser({ email: 'x@ul.ie', password: 'wrong' })
    ).rejects.toThrow('Login failed');
  });
});

// Simple mock authentication for local development
// In production, this would use proper OAuth providers

export async function signIn(email: string, password?: string) {
  // For local development, we'll accept any email that exists in the database
  // No password validation since the schema doesn't have password fields

  try {
    const response = await fetch('/api/auth/mock-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();

      // Store the mock session
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return { success: true, user: data.user };
    } else {
      return { success: false, error: 'Invalid email or user not found' };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function signUp(email: string, name: string) {
  try {
    const response = await fetch('/api/auth/mock-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (response.ok) {
      const data = await response.json();

      // Store the mock session
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return { success: true, user: data.user };
    } else {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to create account' };
    }
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export function signOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/';
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}
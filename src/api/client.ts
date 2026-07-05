const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface FetchOptions extends RequestInit {
  userId?: string;
  userRole?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  let userId = options.userId;
  let userRole = options.userRole;

  // Retrieve selected user session credentials from local storage
  if (typeof window !== 'undefined') {
    if (!userId) userId = localStorage.getItem('x-user-id') || undefined;
    if (!userRole) userRole = localStorage.getItem('x-user-role') || undefined;
  }

  const headers = new Headers(options.headers);
  if (userId) headers.set('x-user-id', userId);
  if (userRole) headers.set('x-user-role', userRole);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errBody = await response.json();
      errorMessage = errBody.error || errorMessage;
    } catch {
      // ignore JSON parse failures on raw text error responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

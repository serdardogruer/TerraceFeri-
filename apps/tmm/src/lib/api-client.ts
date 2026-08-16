export class ApiClient {
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') return '';
    const port = process.env.PORT || '3000';
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      `http://127.0.0.1:${port}`
    );
  }

  static async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const baseUrl = this.getBaseUrl();
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    try {
      return await response.json();
    } catch {
      return null as unknown as T;
    }
  }

  static get<T>(endpoint: string, options?: Omit<RequestInit, 'method'>) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'>) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'>) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string, options?: Omit<RequestInit, 'method'>) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

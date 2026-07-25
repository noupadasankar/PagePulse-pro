export class AuditApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuditApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = '/api/v1';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    '[PagePulse] NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:3001. ' +
    'Set this environment variable to your deployed backend URL.'
  );
}

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    // Network-level failure (no internet, CORS, backend unreachable)
    const msg =
      err instanceof TypeError
        ? `Cannot reach the backend at ${API_URL}. Make sure NEXT_PUBLIC_API_URL is set to your deployed backend URL.`
        : 'Network error. Please check your connection and try again.';
    throw new AuditApiError(0, msg);
  }
}

export const apiClient = {
  async submitAudit(url: string) {
    const response = await safeFetch(`${API_URL}${API_VERSION}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Failed to submit audit' } }));
      throw new AuditApiError(response.status, error.error?.message || 'Failed to submit audit');
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async getAuditById(id: string) {
    const response = await safeFetch(`${API_URL}${API_VERSION}/audit/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Failed to fetch audit' } }));
      throw new AuditApiError(response.status, error.error?.message || 'Failed to fetch audit');
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async checkHealth() {
    const response = await safeFetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new AuditApiError(response.status, 'API is unhealthy');
    }
    return response.json();
  }
};


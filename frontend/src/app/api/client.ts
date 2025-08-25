// frontend/src/app/api/client.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

let getToken: () => string | null = () => localStorage.getItem('access_token')

export function setTokenProvider(provider: () => string | null) {
  getToken = provider
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000'
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const resp = await fetch(url, { ...init, headers })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(text || `Request failed (${resp.status})`)
  }
  if (resp.status === 204) return undefined as unknown as T
  return (await resp.json()) as T
}

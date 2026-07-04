import { supabase } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Titles
  async searchTitles(q: string, type?: string) {
    const params = new URLSearchParams({ q })
    if (type) params.set('type', type)
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/titles/search?${params}`, { headers })
    return handleResponse(res)
  },

  async syncTitle(tmdbId: number, type: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/titles/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tmdbId, type }),
    })
    return handleResponse(res)
  },

  async getTitle(id: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/titles/${id}`, { headers })
    return handleResponse(res)
  },

  // Watch Logs
  async getWatchLogs(page = 1, limit = 20) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlog?page=${page}&limit=${limit}`, { headers })
    return handleResponse(res)
  },

  async createWatchLog(data: Record<string, any>) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlog`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async updateWatchLog(id: string, data: Record<string, any>) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlog/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async deleteWatchLog(id: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlog/${id}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse(res)
  },

  // Watchlist
  async getWatchlist() {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlist`, { headers })
    return handleResponse(res)
  },

  async addToWatchlist(titleId: string, priority?: number) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ titleId, priority }),
    })
    return handleResponse(res)
  },

  async removeFromWatchlist(titleId: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/watchlist/${titleId}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse(res)
  },

  // Collections
  async getCollections() {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections`, { headers })
    return handleResponse(res)
  },

  async createCollection(data: Record<string, any>) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async getCollection(id: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections/${id}`, { headers })
    return handleResponse(res)
  },

  async addCollectionItem(collectionId: string, titleId: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections/${collectionId}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ titleId }),
    })
    return handleResponse(res)
  },

  async removeCollectionItem(collectionId: string, itemId: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse(res)
  },

  async deleteCollection(id: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse(res)
  },

  // User
  async getProfile() {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/users/me`, { headers })
    return handleResponse(res)
  },

  async updateProfile(data: Record<string, any>) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // Stats
  async getDashboardStats() {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/stats/dashboard`, { headers })
    return handleResponse(res)
  },
}

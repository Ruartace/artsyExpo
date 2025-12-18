export interface HttpResponse<T> {
  code: number
  message: string
  data: T
}

import { getAuthToken, clearUserStorage } from '@/utils/storage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://c697294a.natappfree.cc'

function joinUrl(base: string, path: string) {
  if (!base) return path
  if (!path) return base
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return ''
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function request<T>(
  method: 'GET' | 'POST',
  url: string,
  opts: {
    params?: Record<string, unknown>
    body?: unknown
    headers?: Record<string, string>
    timeout?: number
    skipAuth?: boolean
  } = {},
): Promise<HttpResponse<T>> {
  const fullUrl = joinUrl(BASE_URL, url) + (method === 'GET' ? toQuery(opts.params) : '')
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers || {}),
  }

  if (!opts.skipAuth) {
    const token = getAuthToken()
    if (token && !('Authorization' in headers)) headers.Authorization = `Token ${token}`
  }

  const controller = new AbortController()
  const timeout = opts.timeout ?? 15000
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    console.debug('[HTTP]', method, fullUrl)
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: method === 'POST' && opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timer)
    const rawText = await res.text()
    console.debug('[HTTP RESP]', res.status, rawText.slice(0, 120))
    let parsed: unknown
    try {
      parsed = rawText ? JSON.parse(rawText) : null
    } catch {
      parsed = rawText
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      'code' in (parsed as Record<string, unknown>) &&
      'message' in (parsed as Record<string, unknown>)
    ) {
      const p = parsed as HttpResponse<T>
      return { code: p.code, message: String(p.message), data: p.data }
    }
    if (res.status === 401) {
      console.warn('[HTTP] 401 Unauthorized - clearing storage')
      clearUserStorage()
      // 如果不是在登录页，则刷新页面以触发路由守卫跳转
      if (!window.location.pathname.includes('/login')) {
        window.location.reload()
      }
    }
    if (res.ok) {
      return { code: res.status, message: 'ok', data: parsed as T }
    }
    return { code: res.status || -1, message: res.statusText || 'error', data: {} as unknown as T }
  } catch (e) {
    clearTimeout(timer)
    const msg = e instanceof Error ? e.message : 'network error'
    console.error('[HTTP ERR]', fullUrl, msg)
    return { code: -1, message: msg, data: {} as unknown as T }
  }
}

export async function httpGet<T>(
  url: string,
  params?: Record<string, unknown>,
  opts?: { skipAuth?: boolean },
): Promise<HttpResponse<T>> {
  return request<T>('GET', url, { params, ...opts })
}

export async function httpPost<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
  opts?: { skipAuth?: boolean },
): Promise<HttpResponse<T>> {
  return request<T>('POST', url, { body, headers, ...opts })
}

export async function checkTunnel(path: string = '/') {
  const url = joinUrl(BASE_URL, path)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    console.info('[TunnelCheck] start', url)
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
    })
    clearTimeout(timer)
    const text = await res.text()
    const notFound = /Tunnel.*not found/i.test(text)
    if (notFound) {
      console.warn('[TunnelCheck] Tunnel not found')
      return { ok: false, status: res.status, message: 'Tunnel not found' }
    }
    console.info('[TunnelCheck] ok', res.status)
    return { ok: true, status: res.status, message: 'ok' }
  } catch (e) {
    clearTimeout(timer)
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[TunnelCheck] error', url, msg)
    return { ok: false, status: -1, message: msg }
  }
}

if (typeof window !== 'undefined') {
  interface CustomWindow extends Window {
    __checkTunnel?: typeof checkTunnel
  }
  ;(window as CustomWindow).__checkTunnel = checkTunnel
}

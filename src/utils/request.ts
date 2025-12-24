export interface HttpResponse<T> {
  code: number
  message: string
  data: T
}

import { getAuthToken } from '@/utils/storage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://h7b7466f.natappfree.cc'

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
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
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
    ...(method !== 'GET' && !(opts.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(opts.headers || {}),
  }

  if (!opts.skipAuth) {
    const token = getAuthToken()
    if (token) {
      if (!('Authorization' in headers)) {
        // 尝试自动判断或默认使用 Token 前缀，但后端可能接受 Bearer
        // 此处逻辑：如果 token 看起来像 JWT (通常包含两个点)，使用 Bearer，否则使用 Token
        // 或者简单地，根据后端约定。既然用户提示既可以是 token 也可以是 bearer，
        // 我们可以尝试一种通用的策略，或者在失败时重试（较复杂）。
        // 鉴于 DRF 通常用 Token，而 JWT 用 Bearer。
        // 我们这里修改为：优先使用 Token，但如果后端需要 Bearer，可以手动在调用时覆盖 headers
        // 或者，我们可以将前缀改为 Bearer (JWT标准) 或保持 Token (DRF标准)

        // 根据用户 "既可以是token也可以是bearer" 的提示，最稳妥的方式可能是：
        // 1. 如果 token 字符串本身已经包含前缀（如 "Bearer xxx"），直接使用
        // 2. 否则，默认添加 "Token " 前缀（兼容旧逻辑）
        // 3. 但为了解决当前问题，我们可能需要一种机制来支持 Bearer。

        // 让我们采用更智能的策略：
        if (token.startsWith('Bearer ') || token.startsWith('Token ')) {
          headers.Authorization = token
        } else {
          // 默认行为：保持 Token 前缀，但如果后端期望 Bearer，这里可能需要改为 Bearer
          // 用户说 "既可以是token也可以是bearer"，可能意味着后端两种都认，或者不同接口要求不同
          // 我们这里先保持 Token，但允许 token 值本身自带前缀
          headers.Authorization = `Token ${token}`
        }
      }
    }
  }

  const controller = new AbortController()
  const timeout = opts.timeout ?? 15000
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    console.debug('[HTTP]', method, fullUrl)
    const res = await fetch(fullUrl, {
      method,
      headers,
      body:
        method !== 'GET' && opts.body !== undefined
          ? opts.body instanceof FormData
            ? opts.body
            : JSON.stringify(opts.body)
          : undefined,
      signal: controller.signal,
      redirect: 'manual',
    })
    clearTimeout(timer)

    if (
      res.type === 'opaqueredirect' ||
      res.status === 0 ||
      res.status === 302 ||
      res.status === 301
    ) {
      console.warn(
        '[HTTP] Backend is redirecting. This might indicate an Auth failure or URL configuration issue.',
      )
      return { code: 401, message: 'Unauthorized (Redirect)', data: {} as unknown as T }
    }

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
      console.warn('[HTTP] 401 Unauthorized')
      // clearUserStorage()
      // if (!window.location.pathname.includes('/login')) {
      //   window.location.reload()
      // }
      return { code: 401, message: 'Unauthorized', data: {} as unknown as T }
    }
    if (res.ok) {
      // Treat 201 Created as success too
      if (res.status === 201) {
        return { code: 201, message: 'created', data: parsed as T }
      }
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

export async function httpPut<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
  opts?: { skipAuth?: boolean },
): Promise<HttpResponse<T>> {
  return request<T>('PUT', url, { body, headers, ...opts })
}

export async function httpPatch<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
  opts?: { skipAuth?: boolean },
): Promise<HttpResponse<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return request<T>('PATCH' as any, url, { body, headers, ...opts })
}

export async function httpDelete<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
  opts?: { skipAuth?: boolean },
): Promise<HttpResponse<T>> {
  return request<T>('DELETE', url, { body, headers, ...opts })
}

export async function downloadFile(url: string, filename: string): Promise<boolean> {
  const fullUrl = joinUrl(BASE_URL, url)
  const headers: Record<string, string> = {}
  const token = getAuthToken()
  if (token) headers.Authorization = `Token ${token}`

  try {
    const res = await fetch(fullUrl, { method: 'GET', headers })
    if (res.ok) {
      const blob = await res.blob()
      const u = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(u)
      return true
    }
    console.error('Download failed', res.status, res.statusText)
    return false
  } catch (e) {
    console.error('Download failed', e)
    return false
  }
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

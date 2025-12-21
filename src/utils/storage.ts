// 本地存储工具函数
// Local Storage Utilities

import type { UserRole } from '@/types'
import { STORAGE_KEYS } from '@/constants'

/**
 * 设置本地存储项
 * @param key 键名
 * @param value 值
 */
export function setStorageItem(key: string, value: unknown): void {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('设置本地存储失败:', error)
  }
}

/**
 * 获取本地存储项
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    
    // Attempt to parse JSON. If it fails, return the raw string if T allows string
    try {
        return JSON.parse(item)
    } catch {
        // If parsing fails, it might be a raw string stored directly
        // Check if T can be a string, or just return as is if type assertion allows
        return item as unknown as T
    }
  } catch (error) {
    console.error('获取本地存储失败:', error)
    return defaultValue
  }
}

/**
 * 移除本地存储项
 * @param key 键名
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('移除本地存储失败:', error)
  }
}

/**
 * 清空本地存储
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('清空本地存储失败:', error)
  }
}

/**
 * 检查本地存储项是否存在
 * @param key 键名
 * @returns 是否存在
 */
export function hasStorageItem(key: string): boolean {
  return localStorage.getItem(key) !== null
}

/**
 * 获取存储项大小（字节）
 * @param key 键名
 * @returns 大小
 */
export function getStorageItemSize(key: string): number {
  const item = localStorage.getItem(key)
  return item ? new Blob([item]).size : 0
}

/**
 * 获取所有存储项
 * @returns 存储项对象
 */
export function getAllStorageItems(): Record<string, unknown> {
  const items: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      items[key] = getStorageItem(key, null)
    }
  }
  return items
}

// 用户相关存储操作

/**
 * 设置用户ID
 * @param userId 用户ID
 */
export function setUserId(userId: string): void {
  setStorageItem(STORAGE_KEYS.USER_ID, userId)
}

/**
 * 获取用户ID
 * @returns 用户ID
 */
export function getUserId(): string | null {
  return getStorageItem(STORAGE_KEYS.USER_ID, null)
}

/**
 * 设置用户角色
 * @param role 用户角色
 */
export function setUserRole(role: UserRole): void {
  setStorageItem(STORAGE_KEYS.USER_ROLE, role)
}

/**
 * 获取用户角色
 * @returns 用户角色
 */
export function getUserRole(): UserRole | null {
  return getStorageItem(STORAGE_KEYS.USER_ROLE, null)
}

/**
 * 设置用户令牌
 * @param token 令牌
 */
export function setUserToken(token: string): void {
  setStorageItem(STORAGE_KEYS.USER_TOKEN, token)
}

/**
 * 获取用户令牌
 * @returns 令牌
 */
export function getUserToken(): string | null {
  return getStorageItem(STORAGE_KEYS.USER_TOKEN, null)
}

export function setAuthToken(token: string, ttlMs?: number): void {
  setUserToken(token)
  if (ttlMs && ttlMs > 0) {
    setStorageItemWithExpire(STORAGE_KEYS.USER_TOKEN_EXPIRE, token, ttlMs)
  }
}

export function getAuthToken(): string | null {
  const t = getStorageItemWithExpire<string | null>(STORAGE_KEYS.USER_TOKEN_EXPIRE, null)
  if (t) return t
  return getUserToken()
}

export function clearAuthToken(): void {
  removeStorageItem(STORAGE_KEYS.USER_TOKEN_EXPIRE)
  removeStorageItem(STORAGE_KEYS.USER_TOKEN)
}

/**
 * 设置用户权限
 * @param permissions 权限数组
 */
export function setUserPermissions(permissions: string[]): void {
  setStorageItem(STORAGE_KEYS.USER_PERMISSIONS, permissions)
}

/**
 * 获取用户权限
 * @returns 权限数组
 */
export function getUserPermissions(): string[] {
  return getStorageItem(STORAGE_KEYS.USER_PERMISSIONS, [])
}

/**
 * 清除用户相关存储
 */
export function clearUserStorage(): void {
  removeStorageItem(STORAGE_KEYS.USER_ID)
  removeStorageItem(STORAGE_KEYS.USER_ROLE)
  removeStorageItem(STORAGE_KEYS.USER_TOKEN)
  removeStorageItem(STORAGE_KEYS.USER_PERMISSIONS)
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export function isUserLoggedIn(): boolean {
  return !!(getUserId() && getUserRole() && getUserToken())
}

/**
 * 获取存储使用情况
 * @returns 存储使用情况
 */
export function getStorageUsage(): {
  used: number
  available: number
  percentage: number
} {
  let used = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      used += getStorageItemSize(key)
    }
  }
  
  // 大多数浏览器的localStorage限制是5-10MB
  const available = 5 * 1024 * 1024 // 5MB
  const percentage = (used / available) * 100
  
  return {
    used,
    available,
    percentage: Math.min(percentage, 100)
  }
}

/**
 * 设置带过期时间的存储项
 * @param key 键名
 * @param value 值
 * @param expireTime 过期时间（毫秒）
 */
export function setStorageItemWithExpire(key: string, value: unknown, expireTime: number): void {
  const item = {
    value,
    expireTime: Date.now() + expireTime
  }
  setStorageItem(key, item)
}

/**
 * 获取带过期的存储项
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getStorageItemWithExpire<T>(key: string, defaultValue: T): T {
  try {
    const item = getStorageItem<{ value: T; expireTime: number } | null>(key, null)
    if (!item) return defaultValue
    
    if (item.expireTime && Date.now() > item.expireTime) {
      removeStorageItem(key)
      return defaultValue
    }
    
    return item.value || defaultValue
  } catch (error) {
    console.error('获取带过期的存储项失败:', error)
    return defaultValue
  }
}

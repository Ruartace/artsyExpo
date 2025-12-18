import { defineStore } from 'pinia'
import type { User, UserRole } from '@/types'
import {
  setUserId,
  setUserRole,
  setUserToken,
  setUserPermissions,
  getUserId,
  getUserRole,
  getUserToken,
  getUserPermissions,
  clearUserStorage
} from '@/utils/storage'

interface UserState {
	userId: string | null
	role: UserRole | null
	token: string | null
	permissions: string[]
}

export const useUserStore = defineStore('user', {
	state: (): UserState => ({
		userId: getUserId(),
		role: getUserRole(),
		token: getUserToken(),
		permissions: getUserPermissions(),
	}),
	actions: {
		login(payload: { userId: string; role: UserRole; token?: string; permissions?: string[] }) {
			this.userId = payload.userId
			this.role = payload.role
			this.token = payload.token || null
			this.permissions = payload.permissions ?? []

			// 使用封装的存储函数
			setUserId(payload.userId)
			setUserRole(payload.role)
			setUserToken(this.token!)
			setUserPermissions(this.permissions)
		},
		logout() {
			this.userId = null
			this.role = null
			this.token = null
			this.permissions = []

			// 使用封装的存储函数
			clearUserStorage()
		},
		// 获取完整用户信息
		getUser(): User | null {
			if (!this.userId || !this.role || !this.token) return null
			return {
				userId: this.userId,
				role: this.role,
				token: this.token,
				permissions: this.permissions
			}
		},
		// 检查是否有特定权限
		hasPermission(permission: string): boolean {
			return this.permissions.includes(permission)
		},
		// 检查是否有特定角色
		hasRole(roles: UserRole[]): boolean {
			return this.role ? roles.includes(this.role) : false
		}
	},
})



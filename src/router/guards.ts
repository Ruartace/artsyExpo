import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

const whiteList: string[] = ['/login']

export function setupRouterGuards(router: Router) {
	router.beforeEach((to) => {
		const userStore = useUserStore()
		if (whiteList.includes(to.path)) return true
		if (!userStore.role) return { path: '/login', query: { redirect: to.fullPath } }
		const needRoles = (to.meta?.roles as string[] | undefined) ?? []
		if (needRoles.length === 0) return true
		if (userStore.role && needRoles.includes(userStore.role)) return true
		return { path: '/403' }
	})
}



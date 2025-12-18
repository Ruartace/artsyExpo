import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

const whiteList: string[] = ['/login']

export function setupRouterGuards(router: Router) {
	router.beforeEach((to) => {
		const userStore = useUserStore()
		if (whiteList.includes(to.path)) return true
		if (!userStore.role) return { path: '/login', query: { redirect: to.fullPath } }
		
		// 检查路由匹配链中是否包含角色限制
		const needRoles = to.matched.reduce((roles, route) => {
			const routeRoles = (route.meta?.roles as string[] | undefined) ?? []
			return [...roles, ...routeRoles]
		}, [] as string[])

		if (needRoles.length === 0) return true
		if (userStore.role && needRoles.includes(userStore.role)) return true
		return { path: '/403' }
	})
}



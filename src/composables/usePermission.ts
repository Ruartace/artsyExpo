import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
	const userStore = useUserStore()
	const role = computed(() => userStore.role)
	const hasRole = (roles?: string[]) => {
		if (!roles || roles.length === 0) return true
		return !!role.value && roles.includes(role.value)
	}
	return { role, hasRole }
}



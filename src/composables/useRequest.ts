import { ref } from 'vue'

export function useRequest<T>(fn: () => Promise<T>) {
	const loading = ref(false)
	const data = ref<T | null>(null)
	const error = ref<unknown>(null)

	async function run() {
		loading.value = true
		error.value = null
		try {
			data.value = await fn()
		} catch (e) {
			error.value = e
		} finally {
			loading.value = false
		}
	}

	return { loading, data, error, run }
}



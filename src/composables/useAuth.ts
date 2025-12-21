// 认证相关组合式函数
// Authentication Composable

import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginForm, ChangePasswordForm, UserRole } from '@/types'
import { login as loginApi } from '@/services/auth'
import { setAuthToken } from '@/utils/storage'

/**
 * 认证相关组合式函数
 * @returns 认证相关的方法和状态
 */
export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  // 登录状态
  const loading = ref(false)
  const loginForm = reactive<LoginForm>({ account: '', password: '' })

  // 修改密码状态
  const changePasswordVisible = ref(false)
  const changePasswordForm = ref<ChangePasswordForm>({
    oldPwd: '',
    newPwd: '',
    confirmPwd: '',
  })

  // 计算属性
  const isLoggedIn = computed(() => !!userStore.role)
  const currentUser = computed(() => ({
    userId: userStore.userId,
    role: userStore.role,
    permissions: userStore.permissions,
  }))

  /**
   * 登录
   * @param form 登录表单
   * @param rememberMe 是否记住登录
   */
  const login = async (form: LoginForm, rememberMe: boolean = false) => {
    if (!form.account?.trim() || !form.password?.trim()) {
      ElMessage.warning('请输入账号和密码')
      return false
    }

    loading.value = true
    try {
      // 1. 调用 API 获取响应
      const resp = await loginApi(form.account, form.password)

      // 2. 检查响应数据
      // resp: { code: 200, message: "...", data: { token: "...", user: { ... } } }
      // 注意：axios 响应会被拦截器处理，直接返回 data 字段的内容（即 LoginResponse）
      // 或者如果拦截器返回的是整个 axios response，则需要 resp.data

      // 假设请求工具（httpPost）直接返回响应体数据 (LoginResponse)
      // 根据 services/auth.ts 的定义：
      // export async function login(...) { return httpPost<LoginResponse>(...) }

      // 我们需要处理两种情况：
      // 1. 请求成功，code === 200
      // 2. 请求业务失败，code !== 200 (但 http 状态码可能为 200)

      if (resp && resp.code === 200 && resp.data?.token) {
        const token = resp.data.token
        const userId = resp.data.user?.account || form.account

        // 简单逻辑：如果账号是 'admin'，则角色为 'admin'，否则为 'user'
        // 后续应由后端直接返回 role 字段
        const role: UserRole = userId === 'admin' ? 'admin' : 'user'

        // 3. 更新状态
        userStore.login({ userId, role, token })

        // 计算过期时间：记住登录为7天，否则为2小时
        const expireTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000
        setAuthToken(token, expireTime)

        ElMessage.success(resp.message || '登录成功')

        return true
      }

      // 处理业务逻辑错误（如账号密码错误）
      const msg = resp?.message || '账号或密码错误'
      ElMessage.error(msg)
      return false
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      // 处理网络错误或拦截器抛出的错误
      // 尝试从错误对象中提取有用的信息
      let msg = '登录失败，请稍后再试'

      if (error.response && error.response.data) {
        // 如果是 HTTP 错误响应 (如 400, 401, 500)
        msg = error.response.data.message || error.response.data.detail || msg
      } else if (error.message) {
        // 其他错误
        msg = error.message
      }

      ElMessage.error(msg)
      console.error('Login error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = () => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.replace('/login')
  }

  /**
   * 打开修改密码弹窗
   */
  const openChangePassword = () => {
    changePasswordVisible.value = true
    changePasswordForm.value = {
      oldPwd: '',
      newPwd: '',
      confirmPwd: '',
    }
  }

  /**
   * 关闭修改密码弹窗
   */
  const closeChangePassword = () => {
    changePasswordVisible.value = false
  }

  /**
   * 提交修改密码
   */
  const submitChangePassword = async () => {
    const { oldPwd, newPwd, confirmPwd } = changePasswordForm.value

    if (!oldPwd || !newPwd || !confirmPwd) {
      ElMessage.warning('请填写完整信息')
      return
    }

    if (newPwd !== confirmPwd) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    if (newPwd.length < 6) {
      ElMessage.error('新密码长度不能少于6位')
      return
    }

    try {
      // 这里应该调用实际的API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟API调用
      ElMessage.success('密码修改成功')
      closeChangePassword()
    } catch (error) {
      ElMessage.error('密码修改失败，请稍后再试')
      console.error('Change password error:', error)
    }
  }

  /**
   * 检查权限
   * @param permission 权限
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    return userStore.permissions.includes(permission)
  }

  /**
   * 检查角色
   * @param roles 角色数组
   * @returns 是否有角色
   */
  const hasRole = (roles: UserRole[]): boolean => {
    return userStore.role ? roles.includes(userStore.role) : false
  }

  /**
   * 重置登录表单
   */
  const resetLoginForm = () => {
    loginForm.account = ''
    loginForm.password = ''
  }

  return {
    // 状态
    loading,
    loginForm,
    changePasswordVisible,
    changePasswordForm,

    // 计算属性
    isLoggedIn,
    currentUser,

    // 方法
    login,
    logout,
    openChangePassword,
    closeChangePassword,
    submitChangePassword,
    hasPermission,
    hasRole,
    resetLoginForm,
  }
}

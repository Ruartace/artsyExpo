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
    confirmPwd: ''
  })

  // 计算属性
  const isLoggedIn = computed(() => !!userStore.role)
  const currentUser = computed(() => ({
    userId: userStore.userId,
    role: userStore.role,
    permissions: userStore.permissions
  }))

  /**
   * 登录
   * @param form 登录表单
   */
  const login = async (form: LoginForm) => {
    if (!form.account?.trim() || !form.password?.trim()) {
      ElMessage.warning('请输入账号和密码')
      return false
    }

    loading.value = true
    try {
      const resp = await loginApi(form.account, form.password)
      const payload = (resp.data ?? {}) as Record<string, unknown>
      const token = (payload as { token?: string; accessToken?: string; data?: { token?: string } })?.token
        ?? (payload as { token?: string; accessToken?: string; data?: { token?: string } })?.accessToken
        ?? (payload as { token?: string; accessToken?: string; data?: { token?: string } })?.data?.token
      const role = (payload as { role?: string; data?: { role?: string } })?.role
        ?? (payload as { role?: string; data?: { role?: string } })?.data?.role
        ?? 'user'
      const userId = (payload as { userId?: string; data?: { userId?: string } })?.userId
        ?? (payload as { userId?: string; data?: { userId?: string } })?.data?.userId
        ?? form.account
      if ((resp.code === 0 || resp.code === 200) && token) {
        userStore.login({ userId, role: role as UserRole, token })
        setAuthToken(token, 2 * 60 * 60 * 1000)
        ElMessage.success('登录成功')
        router.replace(`/${role}`)
        return true
      }
      ElMessage.error(resp.message || '账号或密码错误')
      return false
    } catch (error) {
      ElMessage.error('登录失败，请稍后再试')
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
      confirmPwd: ''
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
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
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
    resetLoginForm
  }
}

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useForm } from '@/composables/useForm'
import { commonRules } from '@/composables/useForm'
import { useTabs } from '@/composables/useTabs'
import { useUserStore } from '@/stores/user'
import type { ChangePasswordForm } from '@/types'
import { ElMessage } from 'element-plus'
import { logout as logoutApi } from '@/services/auth'
import { getAuthToken } from '@/utils/storage'

const route = useRoute()
const userStore = useUserStore()

// 使用封装的认证组合式函数
const { logout, openChangePassword, closeChangePassword, changePasswordVisible } = useAuth()

// 使用封装的标签页组合式函数
const { tabs, activeTab, handleTabClick, handleTabRemove } = useTabs()

// 使用封装的表单组合式函数
const {
  formData: pwdForm,
  submitForm: submitPwdForm,
  resetForm: resetPwdForm,
} = useForm<ChangePasswordForm>(
  {
    oldPwd: '',
    newPwd: '',
    confirmPwd: '',
  },
  {
    oldPwd: [commonRules.required('请输入原密码')],
    newPwd: commonRules.password(6),
    confirmPwd: commonRules.confirmPassword(''),
  },
)

// 处理修改密码
const handleChangePassword = async () => {
  // 更新确认密码的验证规则
  pwdForm.confirmPwd = pwdForm.newPwd

  const success = await submitPwdForm(async () => {
    // 这里应该调用实际的API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  })

  if (success) {
    closeChangePassword()
    resetPwdForm()
  }
}

// 退出登录（调用后端接口后再清理本地状态）
const handleLogout = async () => {
  const token = getAuthToken() ?? ''
  const resp = await logoutApi(token)
  if (resp.code === 0 || resp.code === 200) {
    logout()
  } else {
    ElMessage.error(resp.message || '退出失败')
  }
}

// 账号信息弹窗
const profileVisible = ref(false)
const profileForm = reactive<{ account: string; schoolName: string; modifierName: string; modifierPhone: string }>({
  account: userStore.userId || '',
  schoolName: '',
  modifierName: '',
  modifierPhone: ''
})
const openProfileDialog = () => { profileVisible.value = true }
const closeProfileDialog = () => { profileVisible.value = false }
</script>

<template>
  <div class="layout">
    <el-container>
      <el-aside width="220px" class="aside">
        <div class="brand">中艺展报名系统</div>
        <el-menu router :default-active="route.path">
          <template v-if="userStore.role === 'user'">
            <div class="menu-section">—— 用户首页 ——</div>
            <el-menu-item index="/user">用户首页</el-menu-item>
            <div class="menu-section">—— 作品报名 ——</div>
            <el-menu-item index="/user/VocalMusic">声乐作品</el-menu-item>
            <el-menu-item index="/user/DanceWork">舞蹈作品</el-menu-item>
            <el-menu-item index="/user/artwork-submission">绘画作品</el-menu-item>
            <el-menu-item index="/user/instrumental-works">器乐作品</el-menu-item>
            <el-menu-item index="/user/opera-works">戏曲作品</el-menu-item>
            <el-menu-item index="/user/Film-Television">影视作品</el-menu-item>
            <el-menu-item index="/user/recitation-works">朗诵作品</el-menu-item>
            <el-menu-item index="/user/handwriting-works">书法、篆刻作品</el-menu-item>
            <el-menu-item index="/user/handicraft-production">手工艺制作</el-menu-item>
            <div class="menu-section">—— 其他报名 ——</div>
            <el-menu-item index="/user/art-practice-works">艺术实践工作</el-menu-item>
            <el-menu-item index="/user/schools-works">中小学美育改革创新成果</el-menu-item>
          </template>

          <!-- 审核端 -->
          <template v-else-if="userStore.role === 'approval'">
            <div class="menu-section">—— 审核首页 ——</div>
            <el-menu-item index="/approval">审核首页</el-menu-item>
            <div class="menu-section">—— 审核功能 ——</div>
            <el-menu-item index="/approval/approval">审批中心</el-menu-item>
            <el-menu-item index="/approval/statistics">报名统计</el-menu-item>
            <el-menu-item index="/approval/account">账号管理</el-menu-item>
          </template>

          <!-- 管理端 -->
          <template v-else-if="userStore.role === 'admin'">
            <div class="menu-section">—— 管理首页 ——</div>
            <el-menu-item index="/admin">管理员</el-menu-item>
            <div class="menu-section">—— 管理功能 ——</div>
            <el-menu-item index="/admin/approval">审核报名</el-menu-item>
            <el-menu-item index="/admin/statistics">报名统计</el-menu-item>
            <el-menu-item index="/admin/account">账号管理</el-menu-item>
            <el-menu-item index="/admin/tips">提示管理</el-menu-item>
            <el-menu-item index="/admin/category">类型管理</el-menu-item>
          </template>

          <!-- 审计端 -->
          <template v-else-if="userStore.role === 'logaudit'">
            <div class="menu-section">—— 审计首页 ——</div>
            <el-menu-item index="/logaudit">日志记录</el-menu-item>
            <div class="menu-section">—— 审计功能 ——</div>
            <el-menu-item index="/logaudit/logs">操作日志</el-menu-item>
            <el-menu-item index="/logaudit/audit">审计记录</el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="actions">
            <span class="username" v-if="userStore.userId" @click="openProfileDialog">{{ userStore.userId }}</span>
            <el-button type="primary" link @click="openChangePassword">修改密码</el-button>
            <el-button type="danger" link @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>
        <div class="tabs-wrapper">
          <div class="tabs-container">
            <el-tabs
              v-model="activeTab"
              type="card"
              closable
              @tab-click="handleTabClick"
              @tab-remove="handleTabRemove"
              class="custom-tabs"
            >
              <el-tab-pane
                v-for="tab in tabs"
                :key="tab.path"
                :label="tab.title"
                :name="tab.path"
                :closable="tab.closable"
              >
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <!-- 修改密码弹窗 -->
    <el-dialog v-model="changePasswordVisible" title="修改密码" width="420px">
      <el-form label-width="100">
        <el-form-item label="原密码">
          <el-input
            v-model="pwdForm.oldPwd"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="pwdForm.newPwd"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="pwdForm.confirmPwd"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeChangePassword">取 消</el-button>
          <el-button type="primary" @click="handleChangePassword">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="profileVisible" title="账号信息" width="420px">
      <el-form label-width="120">
        <el-form-item label="账号">
          <el-input v-model="profileForm.account" placeholder="请输入账号" disabled />
        </el-form-item>
        <el-form-item label="学校名称">
          <el-input v-model="profileForm.schoolName" placeholder="联系管理员输入学校名称" disabled />
        </el-form-item>
        <el-form-item label="上次修改者名称">
          <el-input v-model="profileForm.modifierName" placeholder="上一次修改者名称" disabled />
        </el-form-item>
        <el-form-item label="修改者电话号">
          <el-input v-model="profileForm.modifierPhone" placeholder="上一次修改者电话号" disabled />
        </el-form-item>
      </el-form>
      <div class="profile-tip">若有疑问，请及时联系管理员</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="closeProfileDialog">确认关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/layout.scss';
.username { cursor: pointer; }
.profile-tip { color: #909399; font-size: 12px; margin-top: 8px; }
</style>

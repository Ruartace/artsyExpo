<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'

// 账号类型定义
type Account = {
  id: string
  username: string
  universityName: string
  role: 'user' | 'approval' | 'admin' | 'logaudit'
  status: 'active' | 'disabled' | 'locked'  // active: 正常, disabled: 停用, locked: 锁定
  email?: string
  phone?: string
  createTime?: string
}

// 账号列表数据
const accountList = ref<Account[]>([
  {
    id: '1',
    username: 'user001',
    universityName: 'A大学',
    role: 'user',
    status: 'active',
    email: 'user001@example.com',
    phone: '13800138000',
    createTime: '2024-01-01'
  },
  {
    id: '2',
    username: 'user002',
    universityName: 'B大学',
    role: 'user',
    status: 'active',
    email: 'user002@example.com',
    phone: '13900139000',
    createTime: '2024-01-02'
  },
  {
    id: '3',
    username: 'reviewer001',
    universityName: 'C大学',
    role: 'approval',
    status: 'locked',
    email: 'reviewer001@example.com',
    phone: '13700137000',
    createTime: '2024-01-03'
  },
  {
    id: '4',
    username: 'user003',
    universityName: 'D大学',
    role: 'user',
    status: 'disabled',
    email: 'user003@example.com',
    phone: '13600136000',
    createTime: '2024-01-04'
  },
  {
    id: '5',
    username: 'admin001',
    universityName: '系统管理员',
    role: 'admin',
    status: 'active',
    email: 'admin001@example.com',
    phone: '13500135000',
    createTime: '2024-01-05'
  },
])

const multipleSelection = ref<Account[]>([])

// 搜索和筛选
const keyword = ref('')
const filterRole = ref<string>('')
const filterStatus = ref<string>('')

// 角色选项
const roleOptions = [
  { label: '全部', value: '' },
  { label: '用户', value: 'user' },
  { label: '审核员', value: 'approval' },
  { label: '管理员', value: 'admin' },
  { label: '日志审计员', value: 'logaudit' }
]

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '锁定', value: 'locked' }
]

// 筛选后的账号列表
const filteredAccountList = computed(() => {
  return accountList.value.filter(account => {
    const keywordMatch = !keyword.value ||
      account.username.includes(keyword.value) ||
      account.universityName.includes(keyword.value) ||
      account.email?.includes(keyword.value) ||
      account.phone?.includes(keyword.value)
    const roleMatch = !filterRole.value || account.role === filterRole.value
    const statusMatch = !filterStatus.value || account.status === filterStatus.value
    return keywordMatch && roleMatch && statusMatch
  })
})

// 获取角色显示文本
function getRoleText(role: string) {
  const roleMap: Record<string, string> = {
    user: '用户',
    approval: '审核员',
    admin: '管理员',
    logaudit: '日志审计员'
  }
  return roleMap[role] || role
}

// 获取状态显示文本和类型
function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    active: '正常',
    disabled: '停用',
    locked: '锁定'
  }
  return statusMap[status] || status
}

function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    disabled: 'warning',
    locked: 'danger'
  }
  return typeMap[status] || 'info'
}

function handleSelectionChange(rows: Account[]) {
  multipleSelection.value = rows
}

// 创建账号
const createAccountDialogVisible = ref(false)
const createAccountFormRef = ref<FormInstance>()
const createAccountForm = reactive({
  username: '',
  universityName: '',
  role: 'user' as Account['role'],
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const createAccountRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  universityName: [
    { required: true, message: '请输入大学名称', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validatePassword(rule: any, value: string, callback: (error?: string | Error) => void) {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
    return
  }
  let typeCount = 0
  if (/\d/.test(value)) typeCount++
  if (/[a-z]/.test(value)) typeCount++
  if (/[A-Z]/.test(value)) typeCount++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) typeCount++
  if (typeCount < 3) {
    callback(new Error('密码必须包含三种字符类型（数字、大写字母、小写字母、特殊字符中的任意三种）'))
    return
  }
  callback()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateConfirmPassword(rule: any, value: string, callback: (error?: string | Error) => void) {
  if (!value) {
    callback(new Error('请确认密码'))
    return
  }
  if (value !== createAccountForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

function openCreateAccountDialog() {
  createAccountDialogVisible.value = true
  resetCreateAccountForm()
}

function resetCreateAccountForm() {
  createAccountForm.username = ''
  createAccountForm.universityName = ''
  createAccountForm.role = 'user'
  createAccountForm.email = ''
  createAccountForm.phone = ''
  createAccountForm.password = ''
  createAccountForm.confirmPassword = ''
  createAccountFormRef.value?.clearValidate()
}

function submitCreateAccount() {
  if (!createAccountFormRef.value) return

  createAccountFormRef.value.validate((valid) => {
    if (valid) {
      // 检查用户名是否已存在
      if (accountList.value.some(acc => acc.username === createAccountForm.username)) {
        ElMessage.warning('用户名已存在')
        return
      }

      const newAccount: Account = {
        id: String(accountList.value.length + 1),
        username: createAccountForm.username,
        universityName: createAccountForm.universityName,
        role: createAccountForm.role,
        status: 'active',
        email: createAccountForm.email || undefined,
        phone: createAccountForm.phone || undefined,
        createTime: new Date().toISOString().split('T')[0]
      }

      accountList.value.push(newAccount)
      ElMessage.success('账号创建成功')
      createAccountDialogVisible.value = false
      resetCreateAccountForm()
    }
  })
}

// 批量导入账号
const importAccountDialogVisible = ref(false)
const importFileList = ref<UploadFile[]>([])

function openImportAccountDialog() {
  importAccountDialogVisible.value = true
  importFileList.value = []
}

function handleImportFile(file: UploadFile) {
  // 这里应该解析文件并导入账号
  console.log('导入文件:', file.name)
  ElMessage.info('正在解析文件...')
  // 模拟导入
  setTimeout(() => {
    ElMessage.success('账号导入成功，共导入 10 个账号')
    importAccountDialogVisible.value = false
    importFileList.value = []
  }, 1000)
  return false // 阻止自动上传
}

function removeImportFile() {
  importFileList.value = []
}

// 下载Excel模版
function downloadTemplate() {
  // 创建Excel模版数据（CSV格式，Excel可以打开）
  const headers = ['用户名', '大学名称', '角色', '邮箱', '手机号']
  const exampleRow = ['user001', '示例大学', 'user', 'example@example.com', '13800138000']

  // 创建CSV内容
  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
    '', // 空行作为说明
    '说明：',
    '1. 角色可选值：user（用户）、approval（审核员）、admin（管理员）、logaudit（日志审计员）',
    '2. 邮箱和手机号为可选字段',
    '3. 用户名必须唯一',
    '4. 系统会自动为每个账号生成初始密码'
  ].join('\n')

  // 添加BOM以支持中文显示
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = '账号导入模版.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('模版下载成功')
}

// 修改账号密码
const changePasswordDialogVisible = ref(false)
const changePasswordFormRef = ref<FormInstance>()
const currentChangeAccount = ref<Account | null>(null)
const changePasswordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const changePasswordRules = reactive<FormRules>({
  newPassword: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (rule: any, value: string, callback: (error?: string | Error) => void) => {
        if (!value) {
          callback(new Error('请确认密码'))
          return
        }
        if (value !== changePasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

function openChangePasswordDialog(row: Account) {
  currentChangeAccount.value = row
  changePasswordForm.newPassword = ''
  changePasswordForm.confirmPassword = ''
  changePasswordDialogVisible.value = true
  changePasswordFormRef.value?.clearValidate()
}

function submitChangePassword() {
  if (!changePasswordFormRef.value) return

  changePasswordFormRef.value.validate((valid) => {
    if (valid && currentChangeAccount.value) {
      ElMessage.success(`已修改账号 ${currentChangeAccount.value.username} 的密码`)
      changePasswordDialogVisible.value = false
      changePasswordForm.newPassword = ''
      changePasswordForm.confirmPassword = ''
      currentChangeAccount.value = null
    }
  })
}

// 停用账号
function disableAccount(row: Account) {
  ElMessageBox.confirm(
    `确定要停用账号 "${row.username}" (${row.universityName}) 吗？`,
    '停用账号',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    accountList.value = accountList.value.map(acc =>
      acc.id === row.id ? { ...acc, status: 'disabled' as const } : acc
    )
    ElMessage.success('账号已停用')
  }).catch(() => {})
}

// 批量停用账号
function batchDisableAccount() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要停用的账号')
    return
  }

  const usernames = multipleSelection.value.map(acc => acc.username).join('、')
  ElMessageBox.confirm(
    `确定要停用以下 ${multipleSelection.value.length} 个账号吗？\n${usernames}`,
    '批量停用账号',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const ids = new Set(multipleSelection.value.map(acc => acc.id))
    accountList.value = accountList.value.map(acc =>
      ids.has(acc.id) ? { ...acc, status: 'disabled' as const } : acc
    )
    ElMessage.success(`已批量停用 ${ids.size} 个账号`)
    multipleSelection.value = []
  }).catch(() => {})
}

// 解锁账号
function unlockAccount(row: Account) {
  ElMessageBox.confirm(
    `确定要解锁账号 "${row.username}" (${row.universityName}) 吗？`,
    '解锁账号',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    accountList.value = accountList.value.map(acc =>
      acc.id === row.id ? { ...acc, status: 'active' as const } : acc
    )
    ElMessage.success('账号已解锁')
  }).catch(() => {})
}

// 批量解锁账号
function batchUnlockAccount() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要解锁的账号')
    return
  }

  const usernames = multipleSelection.value.map(acc => acc.username).join('、')
  ElMessageBox.confirm(
    `确定要解锁以下 ${multipleSelection.value.length} 个账号吗？\n${usernames}`,
    '批量解锁账号',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const ids = new Set(multipleSelection.value.map(acc => acc.id))
    accountList.value = accountList.value.map(acc =>
      ids.has(acc.id) && acc.status === 'locked' ? { ...acc, status: 'active' as const } : acc
    )
    ElMessage.success(`已批量解锁 ${ids.size} 个账号`)
    multipleSelection.value = []
  }).catch(() => {})
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账号管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="openCreateAccountDialog">
              创建账号
            </el-button>
            <el-button type="success" :icon="Upload" @click="openImportAccountDialog">
              批量导入
            </el-button>
            <el-button type="warning" @click="batchDisableAccount">
              批量停用
            </el-button>
            <el-button type="info" @click="batchUnlockAccount">
              批量解锁
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filters">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名、大学名称、邮箱或手机号"
          clearable
          style="max-width: 300px"
        />
        <el-select v-model="filterRole" clearable placeholder="请选择角色（全部）" style="width: 180px">
          <el-option
            v-for="option in roleOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select v-model="filterStatus" clearable placeholder="请选择状态（全部）" style="width: 180px">
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <!-- 账号列表表格 -->
      <el-table
        :data="filteredAccountList"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
        style="margin-top: 16px"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="universityName" label="大学名称" min-width="180" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            {{ getRoleText(row.role) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="openChangePasswordDialog(row)"
            >
              修改密码
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              size="small"
              type="warning"
              @click="disableAccount(row)"
            >
              停用
            </el-button>
            <el-button
              v-if="row.status === 'locked'"
              size="small"
              type="success"
              @click="unlockAccount(row)"
            >
              解锁
            </el-button>
            <el-button
              v-if="row.status === 'disabled'"
              size="small"
              type="success"
              @click="accountList = accountList.map(acc => acc.id === row.id ? { ...acc, status: 'active' } : acc)"
            >
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建账号对话框 -->
    <el-dialog
      v-model="createAccountDialogVisible"
      title="创建账号"
      width="600px"
      @close="resetCreateAccountForm"
    >
      <el-form
        ref="createAccountFormRef"
        :model="createAccountForm"
        :rules="createAccountRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="createAccountForm.username"
            placeholder="请输入用户名（3-20个字符）"
            clearable
          />
        </el-form-item>
        <el-form-item label="大学名称" prop="universityName">
          <el-input
            v-model="createAccountForm.universityName"
            placeholder="请输入大学名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="createAccountForm.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option label="用户" value="user" />
            <el-option label="审核员" value="approval" />
            <el-option label="管理员" value="admin" />
            <el-option label="日志审计员" value="logaudit" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="createAccountForm.email"
            type="email"
            placeholder="请输入邮箱（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="createAccountForm.phone"
            placeholder="请输入手机号（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createAccountForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="createAccountForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>
        <div class="password-hint">
          <p><strong>密码要求：</strong></p>
          <ul>
            <li>密码长度至少6位</li>
            <li>必须包含三种字符类型：</li>
            <li style="list-style: none; margin-left: 20px;">
              - 数字（0-9）<br>
              - 大写字母（A-Z）<br>
              - 小写字母（a-z）<br>
              - 特殊字符（!@#$%^&*等）
            </li>
          </ul>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="createAccountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateAccount">确定创建</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入账号对话框 -->
    <el-dialog
      v-model="importAccountDialogVisible"
      title="批量导入账号"
      width="600px"
    >
      <div class="import-description">
        <p><strong>导入说明：</strong></p>
        <ul>
          <li>支持导入 Excel 文件（.xlsx, .xls）或 CSV 文件</li>
          <li>文件格式要求：第一行为表头，包含：用户名、大学名称、角色、邮箱、手机号</li>
          <li>角色可选值：user（用户）、approval（审核员）、admin（管理员）、logaudit（日志审计员）</li>
          <li>系统会自动为每个账号生成初始密码（需首次登录后修改）</li>
        </ul>
        <div style="margin-top: 12px">
          <el-button type="primary" :icon="Download" @click="downloadTemplate">
            下载模版
          </el-button>
        </div>
      </div>
      <el-upload
        v-model:file-list="importFileList"
        :auto-upload="false"
        :on-change="handleImportFile"
        :on-remove="removeImportFile"
        :limit="1"
        accept=".xlsx,.xls,.csv"
        drag
        style="margin-top: 20px"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 Excel 文件，且不超过 10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importAccountDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordDialogVisible"
      title="修改账号密码"
      width="500px"
      @close="currentChangeAccount = null"
    >
      <div v-if="currentChangeAccount" class="account-info">
        <p><strong>账号信息：</strong></p>
        <p>用户名：{{ currentChangeAccount.username }}</p>
        <p>大学名称：{{ currentChangeAccount.universityName }}</p>
      </div>
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        :rules="changePasswordRules"
        label-width="100px"
        style="margin-top: 20px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="changePasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="changePasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </el-form-item>
        <div class="password-hint">
          <p><strong>密码要求：</strong></p>
          <ul>
            <li>密码长度至少6位</li>
            <li>必须包含三种字符类型：</li>
            <li style="list-style: none; margin-left: 20px;">
              - 数字（0-9）<br>
              - 大写字母（A-Z）<br>
              - 小写字母（a-z）<br>
              - 特殊字符（!@#$%^&*等）
            </li>
          </ul>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitChangePassword">确定修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.account-info {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;

  p {
    margin: 4px 0;
    font-size: 14px;
  }
}

.password-hint {
  margin-top: 8px;
  padding: 12px;
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;

  p {
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
      line-height: 1.6;
    }
  }
}

.import-description {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;

  p {
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
      line-height: 1.6;
    }
  }
}
</style>

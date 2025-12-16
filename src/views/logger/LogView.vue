<template>
  <div class="log-view">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon><Document /></el-icon>
            <span>操作日志查看</span>
          </div>
          <div class="header-actions">
            <el-button
              type="primary"
              @click="openExportDialog"
            >
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
            <el-button
              type="danger"
              @click="openDeleteDialog"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 导出对话框 -->
      <el-dialog
        v-model="exportDialogVisible"
        title="导出日志"
        width="500px"
      >
        <el-form
          ref="exportFormRef"
          :model="exportForm"
          :rules="exportRules"
          label-width="100px"
        >
          <el-form-item label="选择日期" prop="date">
            <el-date-picker
              v-model="exportForm.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="用户类型" prop="userType">
            <el-select
              v-model="exportForm.userType"
              placeholder="选择用户类型"
              clearable
              style="width: 100%"
            >
              <el-option label="全部" value="" />
              <el-option label="用户端" value="user" />
              <el-option label="审核端" value="approval" />
              <el-option label="管理员端" value="admin" />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="exportDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="exporting"
              @click="handleExport"
            >
              确定导出
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 批量删除对话框 -->
      <el-dialog
        v-model="deleteDialogVisible"
        title="批量删除日志"
        width="500px"
      >
        <el-form
          ref="deleteFormRef"
          :model="deleteForm"
          :rules="deleteRules"
          label-width="100px"
        >
          <el-form-item label="选择月份" prop="month">
            <el-date-picker
              v-model="deleteForm.month"
              type="month"
              placeholder="选择月份"
              format="YYYY-MM"
              value-format="YYYY-MM"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="将删除的日志数">
            <span style="color: #f56c6c; font-weight: 600;">{{ deleteLogsCount }} 条</span>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button
              type="danger"
              :loading="deleting"
              @click="handleBatchDelete"
            >
              确定删除
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 筛选表单 -->
      <div class="filter-section">
        <el-form :model="filterForm" inline>
          <el-form-item label="时间筛选">
            <el-date-picker
              v-model="filterForm.month"
              type="month"
              placeholder="选择月份"
              format="YYYY-MM"
              value-format="YYYY-MM"
              clearable
              @change="handleFilterChange"
            />
          </el-form-item>
          <el-form-item label="用户类型">
            <el-select
              v-model="filterForm.userType"
              placeholder="选择用户类型"
              clearable
              style="width: 150px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="用户端" value="user" />
              <el-option label="审核端" value="approval" />
              <el-option label="管理员端" value="admin" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="loading"
        :data="logs"
        border
        stripe
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="timestamp" label="操作时间" width="180" align="center" />
        <el-table-column prop="userName" label="操作人" width="120" align="center" />
        <el-table-column prop="module" label="模块" width="150" align="center" />
        <el-table-column prop="action" label="操作类型" width="120" align="center" />
        <el-table-column prop="description" label="操作描述" min-width="200" />
        <el-table-column prop="ip" label="IP地址" width="150" align="center" />
        <el-table-column prop="result" label="操作结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadLogs"
          @current-change="loadLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup name="LogView">
import { ref, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download } from '@element-plus/icons-vue'
import type { OperationLog } from '@/types'
import { fetchOperationLogs, deleteLogs } from '@/services/mock'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const logs = ref<OperationLog[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const allLogs = ref<OperationLog[]>([])
const exporting = ref(false)
const filteredLogs = ref<OperationLog[]>([])
const deleting = ref(false)

// 筛选表单
const filterForm = ref({
  month: '', // YYYY-MM 格式
  userType: '' // user, approval, admin, logaudit
})

// 导出对话框
const exportDialogVisible = ref(false)
const exportFormRef = ref<FormInstance>()
const exportForm = ref({
  date: '', // YYYY-MM-DD 格式
  userType: '' // user, approval, admin
})

// 导出表单验证规则
const exportRules: FormRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 批量删除对话框
const deleteDialogVisible = ref(false)
const deleteFormRef = ref<FormInstance>()
const deleteForm = ref({
  month: '' // YYYY-MM 格式
})

// 计算将要删除的日志数量
const deleteLogsCount = computed(() => {
  if (!deleteForm.value.month) return 0

  return filteredLogs.value.filter(log => {
    const logDate = new Date(log.timestamp)
    const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`
    return logMonth === deleteForm.value.month
  }).length
})

// 批量删除表单验证规则
const deleteRules: FormRules = {
  month: [
    { required: true, message: '请选择月份', trigger: 'change' }
  ]
}

// 根据用户ID推断用户类型
const getUserType = (userId: string): string => {
  if (userId.startsWith('user')) return 'user'
  if (userId.startsWith('reviewer')) return 'approval'
  if (userId.startsWith('admin')) return 'admin'
  if (userId.startsWith('logger')) return 'logaudit'
  return ''
}

// 应用筛选条件
const applyFilters = (logsData: OperationLog[]): OperationLog[] => {
  let filtered = [...logsData]

  // 按月份筛选
  if (filterForm.value.month) {
    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp)
      const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`
      return logMonth === filterForm.value.month
    })
  }

  // 按用户类型筛选
  if (filterForm.value.userType) {
    filtered = filtered.filter(log => {
      const logUserType = getUserType(log.userId)
      return logUserType === filterForm.value.userType
    })
  }

  return filtered
}

// 加载日志
const loadLogs = async () => {
  loading.value = true
  try {
    const fetchedLogs = await fetchOperationLogs()
    allLogs.value = fetchedLogs

    // 应用筛选
    const filtered = applyFilters(fetchedLogs)
    filteredLogs.value = filtered
    total.value = filtered.length

    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    logs.value = filtered.slice(start, end)
  } catch (error) {
    ElMessage.error('加载日志失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1 // 重置到第一页
  loadLogs()
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.value = {
    month: '',
    userType: ''
  }
  currentPage.value = 1
  loadLogs()
}

// 打开导出对话框
const openExportDialog = () => {
  exportForm.value = {
    date: '',
    userType: ''
  }
  exportDialogVisible.value = true
}

// 导出日志
const handleExport = async () => {
  if (!exportFormRef.value) return

  // 验证表单
  await exportFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('请填写完整信息')
      return
    }
  })

  if (!exportForm.value.date) {
    ElMessage.warning('请选择日期')
    return
  }

  exporting.value = true
  try {
    // 获取所有日志
    const allLogsData = await fetchOperationLogs()

    // 按日期筛选
    const selectedDate = exportForm.value.date
    let exportLogs = allLogsData.filter(log => {
      const logDate = new Date(log.timestamp)
      const logDateStr = logDate.toISOString().slice(0, 10)
      return logDateStr === selectedDate
    })

    // 按用户类型筛选
    if (exportForm.value.userType) {
      exportLogs = exportLogs.filter(log => {
        const logUserType = getUserType(log.userId)
        return logUserType === exportForm.value.userType
      })
    }

    if (exportLogs.length === 0) {
      ElMessage.warning('所选条件下没有可导出的日志')
      exporting.value = false
      return
    }

    // 构建导出内容
    let content = '操作日志导出\n'
    content += '='.repeat(80) + '\n'
    content += `导出时间：${new Date().toLocaleString('zh-CN')}\n`
    content += `筛选条件：\n`
    content += `  日期：${exportForm.value.date}\n`

    if (exportForm.value.userType) {
      const typeMap: Record<string, string> = {
        'user': '用户端',
        'approval': '审核端',
        'admin': '管理员端'
      }
      content += `  用户类型：${typeMap[exportForm.value.userType] || exportForm.value.userType}\n`
    } else {
      content += `  用户类型：全部\n`
    }

    content += `总记录数：${exportLogs.length} 条\n`
    content += '='.repeat(80) + '\n\n'

    // 表头
    content += '序号\t操作时间\t\t操作人\t模块\t\t操作类型\t操作描述\t\t\t\tIP地址\t\t操作结果\n'
    content += '-'.repeat(120) + '\n'

    // 数据行
    exportLogs.forEach((log, index) => {
      const row = [
        (index + 1).toString(),
        log.timestamp || '',
        log.userName || '',
        log.module || '',
        log.action || '',
        log.description || '',
        log.ip || '',
        log.result === 'success' ? '成功' : '失败'
      ]
      content += row.join('\t') + '\n'
    })

    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 生成文件名
    const dateStr = exportForm.value.date.replace(/-/g, '')
    let fileName = `操作日志_${dateStr}`
    if (exportForm.value.userType) {
      const typeMap: Record<string, string> = {
        'user': '用户端',
        'approval': '审核端',
        'admin': '管理员端'
      }
      fileName += `_${typeMap[exportForm.value.userType] || exportForm.value.userType}`
    }
    fileName += '.txt'

    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success(`成功导出 ${exportLogs.length} 条日志`)
    exportDialogVisible.value = false
  } catch (error) {
    ElMessage.error('导出失败')
    console.error(error)
  } finally {
    exporting.value = false
  }
}

// 打开批量删除对话框
const openDeleteDialog = () => {
  deleteForm.value = {
    month: ''
  }
  deleteDialogVisible.value = true
}

// 批量删除
const handleBatchDelete = async () => {
  if (!deleteFormRef.value) return

  // 验证表单
  await deleteFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('请选择月份')
      return
    }
  })

  if (!deleteForm.value.month) {
    ElMessage.warning('请选择月份')
    return
  }

  if (deleteLogsCount.value === 0) {
    ElMessage.warning('所选月份没有可删除的日志')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除 ${deleteForm.value.month} 月份的 ${deleteLogsCount.value} 条日志吗？此操作将记录到审计记录中，且不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleting.value = true

    // 获取该月份的所有日志ID
    const monthLogs = filteredLogs.value.filter(log => {
      const logDate = new Date(log.timestamp)
      const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`
      return logMonth === deleteForm.value.month
    })

    const logIds = monthLogs.map(log => log.id)

    if (logIds.length === 0) {
      ElMessage.warning('该月份没有可删除的日志')
      deleting.value = false
      return
    }

    const success = await deleteLogs(
      logIds,
      userStore.userId || '',
      userStore.userId || '未知用户'
    )

    if (success) {
      ElMessage.success(`成功删除 ${logIds.length} 条日志`)
      deleteDialogVisible.value = false
      await loadLogs()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    ElMessage.error('删除失败')
    // 用户取消
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style lang="scss" scoped>
.log-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .filter-section {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
  }
}
</style>


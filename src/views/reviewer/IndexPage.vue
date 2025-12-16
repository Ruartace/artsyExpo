<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'

// 按大学统计的数据
type UniversityStats = {
  university: string  // 大学名称
  accountId: string    // 账号ID
  total: number        // 总报名数
  passed: number       // 已通过
  rejected: number     // 已驳回
  pending: number      // 待审核
  rejectReason?: string // 驳回理由（如果有）
  status: '已通过' | '已驳回' | '待审核'  // 整体状态
}

// 根据审核逻辑：一个大学通过就是整体所有通过，驳回就是整体所有驳回
// 所以根据状态来计算各数量
const universityStats = computed(() => {
  // 这里应该从实际的报名数据中统计，暂时使用示例数据
  // 实际应该从 ApprovalPage 或 API 获取数据
  const rawData = [
    {
      university: 'A大学',
      accountId: 'account001',
      total: 45,
      status: '已通过' as const,
    },
    {
      university: 'B大学',
      accountId: 'account002',
      total: 32,
      status: '已驳回' as const,
      rejectReason: '报名材料不完整，缺少必要文件',
    },
    {
      university: 'C大学',
      accountId: 'account003',
      total: 28,
      status: '待审核' as const,
    },
    {
      university: 'D大学',
      accountId: 'account004',
      total: 55,
      status: '已通过' as const,
    },
    {
      university: 'E大学',
      accountId: 'account005',
      total: 38,
      status: '已驳回' as const,
      rejectReason: '提交材料不符合要求，请重新提交',
    },
  ]

  return rawData.map(item => ({
    university: item.university,
    accountId: item.accountId,
    total: item.total,
    // 根据状态计算：通过就是全部通过，驳回就是全部驳回，待审核就是全部待审核
    passed: item.status === '已通过' ? item.total : 0,
    rejected: item.status === '已驳回' ? item.total : 0,
    pending: item.status === '待审核' ? item.total : 0,
    status: item.status,
    rejectReason: item.rejectReason,
  }))
})

// 整体统计数据
const summaryStats = computed(() => {
  const total = universityStats.value.reduce((sum, u) => sum + u.total, 0)
  const passed = universityStats.value.reduce((sum, u) => sum + u.passed, 0)
  const rejected = universityStats.value.reduce((sum, u) => sum + u.rejected, 0)
  const pending = universityStats.value.reduce((sum, u) => sum + u.pending, 0)

  return {
    total,
    passed,
    rejected,
    pending,
  }
})

// 信息汇总统计数据（用于表格）
const summaryTableData = computed(() => [
  {
    category: '总计',
    total: summaryStats.value.total,
    passed: summaryStats.value.passed,
    rejected: summaryStats.value.rejected,
    pending: summaryStats.value.pending,
  },
])

const keyword = ref('')
const filteredUniversities = computed(() => {
  return universityStats.value.filter(u =>
    u.university.includes(keyword.value)
  )
})

// 查看驳回理由
function viewRejectReason(row: UniversityStats) {
  if (row.status === '已驳回' && row.rejectReason) {
    ElMessageBox.alert(row.rejectReason, '驳回理由', {
      confirmButtonText: '确定',
      type: 'warning',
    })
  } else if (row.status === '已驳回') {
    ElMessageBox.alert('该大学的报名已驳回，但未填写具体理由', '驳回状态', {
      confirmButtonText: '确定',
      type: 'warning',
    })
  }
}

// 获取状态标签类型
function getStatusType(status: '已通过' | '已驳回' | '待审核') {
  switch (status) {
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    case '待审核':
      return 'warning'
    default:
      return 'info'
  }
}

// 导出报名表相关
const selectedCategory = ref('')
// 节目类型选项（用户端的12个类型）
const categoryOptions = [
  { label: '全部', value: '' },
  { label: '声乐报名', value: '声乐报名' },
  { label: '器乐报名', value: '器乐报名' },
  { label: '舞蹈报名', value: '舞蹈报名' },
  { label: '戏曲报名', value: '戏曲报名' },
  { label: '朗诵报名', value: '朗诵报名' },
  { label: '书法作品', value: '书法作品' },
  { label: '绘画作品', value: '绘画作品' },
  { label: '设计作品', value: '设计作品' },
  { label: '摄影作品', value: '摄影作品' },
  { label: '微电影作品', value: '微电影作品' },
  { label: '艺术实践工作坊报名', value: '艺术实践工作坊报名' },
  { label: '美育改革创新优秀案例申报', value: '美育改革创新优秀案例申报' }
]

// 导出盖章报名表对话框
type StampedFormItem = {
  id: string
  name: string
  school: string
  type: string
}

const exportStampedDialogVisible = ref(false)
const multipleSelection = ref<StampedFormItem[]>([])
const stampedList = ref<StampedFormItem[]>([
  { id: '1', name: '张三', school: 'A大学', type: 'A类' },
  { id: '2', name: '李四', school: 'B大学', type: 'B类' },
  { id: '3', name: '王五', school: 'A大学', type: 'A类' },
])

function handleStampedSelectionChange(rows: StampedFormItem[]) {
  multipleSelection.value = rows
}

function batchExportStamped() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的报名表')
    return
  }
  ElMessage.success(`已批量导出 ${multipleSelection.value.length} 份盖章报名表`)
  exportStampedDialogVisible.value = false
  multipleSelection.value = []
}

function singleExportStamped(id: string) {
  ElMessage.success(`已导出ID为 ${id} 的盖章报名表`)
}

// 导出所有报名表
function exportAllRegistrationForms() {
  ElMessage.success('正在导出所有报名表...')
  // TODO: 实现导出逻辑
}

// 导出选中类别报名表
function exportSelectedCategoryForms() {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择类别')
    return
  }
  ElMessage.success(
    `正在导出${categoryOptions.find((opt) => opt.value === selectedCategory.value)?.label}报名表...`,
  )
  // TODO: 实现导出逻辑
}

// 导出盖章报名表
function exportStampedForms() {
  exportStampedDialogVisible.value = true
}

// 上传盖章报名表相关
type UploadFile = {
  name?: string
  raw?: File
  [key: string]: unknown
}

const uploadFileList = ref<UploadFile[]>([])

// 上传文件处理
function handleUploadFile(file: UploadFile) {
  uploadFileList.value.push(file.raw ? file : file)
  return false // 阻止自动上传
}

// 删除文件
function handleRemoveFile(file: UploadFile) {
  const fileName = file.name || file.raw?.name
  const index = uploadFileList.value.findIndex((f: UploadFile) => {
    const fName = f.name || f.raw?.name
    return fName === fileName
  })
  if (index > -1) {
    uploadFileList.value.splice(index, 1)
  }
}

// 提交盖章报名表
function submitStampedForm() {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请先上传盖章报名表')
    return
  }
  ElMessage.success('正在提交盖章报名表...')
  // TODO: 实现提交逻辑
}

// 导出统计表
function exportStatistics() {
  try {
    // 构建CSV内容
    let csvContent = '\ufeff' // BOM for Excel
    csvContent += '审核端报名统计表\n'
    csvContent += `统计时间：${new Date().toLocaleString('zh-CN')}\n\n`

    // 整体统计
    csvContent += '整体统计\n'
    csvContent += '类别,总报名数,已通过,已驳回,待审核\n'
    summaryTableData.value.forEach(row => {
      csvContent += `${row.category},${row.total},${row.passed},${row.rejected},${row.pending}\n`
    })
    csvContent += '\n'

    // 各大学统计
    csvContent += '各大学统计\n'
    csvContent += '大学名称,账号ID,总报名节目数,已通过,已驳回,待审核,审核状态,驳回理由\n'
    universityStats.value.forEach(stat => {
      const rejectReason = stat.rejectReason || ''
      csvContent += `${stat.university},${stat.accountId},${stat.total},${stat.passed},${stat.rejected},${stat.pending},${stat.status},"${rejectReason}"\n`
    })

    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `审核端报名统计表_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('导出统计表成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出统计表失败')
  }
}
</script>

<template>
  <div class="home-page">
    <!-- 第一个表单：整体报名信息统计表格 -->
    <el-card class="mb20">
      <template #header>
        <div class="card-header">
          <span>整体报名信息统计</span>
          <el-button type="primary" :icon="Download" @click="exportStatistics">
            导出统计表
          </el-button>
        </div>
      </template>

      <el-table :data="summaryTableData" border stripe>
        <el-table-column prop="category" label="类别" min-width="120" />
        <el-table-column prop="total" label="总报名数" width="120" align="center" />
        <el-table-column prop="passed" label="已通过" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('已通过')" size="small">
              {{ row.passed }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rejected" label="已驳回" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('已驳回')" size="small">
              {{ row.rejected }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pending" label="待审核" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('待审核')" size="small">
              {{ row.pending }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 第二个表单：各大学报名审核状态统计 -->
    <el-card class="mb20">
      <template #header>
        <div class="card-header">
          <span>各大学报名审核状态统计</span>
        </div>
      </template>

      <div class="search-wrapper mb12">
        <el-input
          v-model="keyword"
          placeholder="按大学名称搜索"
          clearable
          style="max-width: 260px"
        />
        <el-button type="primary">搜索</el-button>
      </div>

      <el-table :data="filteredUniversities" border stripe>
        <el-table-column prop="university" label="大学名称" min-width="180" />
        <el-table-column prop="accountId" label="账号ID" min-width="140" />
        <el-table-column prop="total" label="总报名节目数" width="120" align="center" />
        <el-table-column prop="passed" label="已通过" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('已通过')" size="small">
              {{ row.passed }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rejected" label="已驳回" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('已驳回')" size="small">
              {{ row.rejected }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pending" label="待审核" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType('待审核')" size="small">
              {{ row.pending }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" fixed="right">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              :style="{ cursor: row.status === '已驳回' ? 'pointer' : 'default' }"
              @click="viewRejectReason(row)"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 导出报名表卡片 -->
    <el-card class="mb20">
      <template #header>
        <div class="card-header">
          <span>导出报名表</span>
        </div>
      </template>
      <div class="export-section">
        <div class="export-description">
          您可以选择导出所有报名表数据,或按类别导出特定类型的报名表。
        </div>
        <div class="export-actions">
          <el-button type="primary" :icon="Download" @click="exportAllRegistrationForms">
            导出所有报名表
          </el-button>
          <el-button type="success" :icon="Download" @click="exportSelectedCategoryForms">
            导出选中类别报名表
          </el-button>
          <el-select
            v-model="selectedCategory"
            placeholder="请选择节目类型（全部）"
            style="width: 220px"
            clearable
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-button type="warning" :icon="Download" @click="exportStampedForms">
            导出盖章报名表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 上传盖章报名表卡片 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上传盖章报名表</span>
        </div>
      </template>
      <div class="upload-section">
        <el-upload
          :file-list="uploadFileList"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :on-change="handleUploadFile"
          :on-remove="handleRemoveFile"
          :accept="'.pdf,.jpg,.jpeg,.png'"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">将盖章后的报名表拖到此处,或点击上传</div>
        </el-upload>
        <div class="upload-tip">支持:PDF、JPG、PNG格式。请上传已盖章的报名表扫描件或照片。</div>
        <div class="upload-submit">
          <el-button type="primary" :icon="Upload" @click="submitStampedForm">
            提交盖章报名表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 导出盖章报名表对话框 -->
    <el-dialog
      v-model="exportStampedDialogVisible"
      title="导出盖章报名表"
      width="800px"
    >
      <div style="margin-bottom: 12px">
        <el-button type="primary" @click="batchExportStamped">批量导出</el-button>
      </div>
      <el-table
        :data="stampedList"
        @selection-change="handleStampedSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="school" label="学校" min-width="200" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="singleExportStamped(row.id)">单独导出</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="exportStampedDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.mb20 {
  margin-bottom: 20px;
}

.mb12 {
  margin-bottom: 12px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

// 导出报名表区域样式
.export-section {
  .export-description {
    color: #909399;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .export-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

// 上传盖章报名表区域样式
.upload-section {
  .upload-dragger {
    width: 100%;
    margin-bottom: 12px;

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 40px;
    }

    :deep(.el-icon--upload) {
      font-size: 67px;
      color: #c0c4cc;
      margin: 40px 0 16px;
      line-height: 50px;
    }

    :deep(.el-upload__text) {
      color: #606266;
      font-size: 14px;
      text-align: center;
    }
  }

  .upload-tip {
    color: #909399;
    font-size: 12px;
    margin-bottom: 20px;
    text-align: center;
  }

  .upload-submit {
    display: flex;
    justify-content: flex-end;
  }
}
</style>

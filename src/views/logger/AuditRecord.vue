<template>
  <div class="audit-record">
    <el-card shadow="never">
      <template #header>
        <div class="card-title">
          <el-icon><Notebook /></el-icon>
          <span>审计记录</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="records"
        border
        stripe
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="timestamp" label="审计时间" width="180" align="center" />
        <el-table-column prop="auditorName" label="审计员" width="120" align="center" />
        <el-table-column prop="action" label="操作类型" width="120" align="center" />
        <el-table-column prop="targetType" label="目标类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.targetType === 'log' ? '日志' : '记录' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetContent" label="目标内容" min-width="300" />
        <el-table-column prop="description" label="审计描述" min-width="200" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecords"
          @current-change="loadRecords"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup name="AuditRecord">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Notebook } from '@element-plus/icons-vue'
import type { AuditRecord } from '@/types'
import { fetchAuditRecords } from '@/services/mock'

const loading = ref(false)
const records = ref<AuditRecord[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 加载审计记录
const loadRecords = async () => {
  loading.value = true
  try {
    const allRecords = await fetchAuditRecords()
    total.value = allRecords.length

    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    records.value = allRecords.slice(start, end)
  } catch (error) {
    ElMessage.error('加载审计记录失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style lang="scss" scoped>
.audit-record {
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>


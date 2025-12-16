<template>
  <div class="logaudit-home">
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="card-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>日志统计数据</span>
        </div>
      </template>
      <div class="stats-content">
        <div class="stat-item">
          <div class="stat-label">日志总数</div>
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-unit">条</div>
          <div class="stat-detail">
            <div class="detail-item">
              <span class="detail-label">用户端：</span>
              <span class="detail-value">{{ stats.totalByType?.user || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">审核端：</span>
              <span class="detail-value">{{ stats.totalByType?.approval || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">管理员端：</span>
              <span class="detail-value">{{ stats.totalByType?.admin || 0 }}</span>
            </div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日新增</div>
          <div class="stat-value today">{{ stats.todayCount }}</div>
          <div class="stat-unit">条</div>
          <div class="stat-detail">
            <div class="detail-item">
              <span class="detail-label">用户端：</span>
              <span class="detail-value today">{{ stats.todayCountByType?.user || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">审核端：</span>
              <span class="detail-value today">{{ stats.todayCountByType?.approval || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">管理员端：</span>
              <span class="detail-value today">{{ stats.todayCountByType?.admin || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="quick-actions-card">
      <template #header>
        <div class="card-title">
          <el-icon><Operation /></el-icon>
          <span>快速操作</span>
        </div>
      </template>
      <div class="actions-content">
        <el-button type="primary" @click="goToLogs">查看操作日志</el-button>
        <el-button type="success" @click="goToAudit">查看审计记录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup name="LogAuditHomePage">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataAnalysis, Operation } from '@element-plus/icons-vue'
import { getLogStats } from '@/services/mock'

const router = useRouter()
const stats = ref({
  total: 0,
  todayCount: 0,
  totalByType: { user: 0, approval: 0, admin: 0 },
  todayCountByType: { user: 0, approval: 0, admin: 0 }
})

// 加载统计数据
const loadStats = async () => {
  const data = await getLogStats()
  stats.value = data
}

// 跳转到操作日志页面
const goToLogs = () => {
  router.push('/logaudit/logs')
}

// 跳转到审计记录页面
const goToAudit = () => {
  router.push('/logaudit/audit')
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.logaudit-home {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.stats-card {
  .stats-content {
    display: flex;
    justify-content: center;
    gap: 60px;
    padding: 40px 20px;
  }

  .stat-item {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
  }

  .stat-value {
    font-size: 48px;
    font-weight: 600;
    color: #409eff;
    line-height: 1;

    &.today {
      color: #67c23a;
    }
  }

  .stat-unit {
    font-size: 16px;
    color: #606266;
  }

  .stat-detail {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .detail-item {
    font-size: 14px;
    color: #606266;

    .detail-label {
      color: #909399;
    }

    .detail-value {
      color: #409eff;
      font-weight: 500;
      margin-left: 4px;

      &.today {
        color: #67c23a;
      }
    }
  }
}

.quick-actions-card {
  .actions-content {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 20px;
  }
}
</style>

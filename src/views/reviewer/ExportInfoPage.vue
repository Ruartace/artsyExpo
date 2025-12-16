<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const keyword = ref('')
const list = ref([
  { id: '1', name: '张三', school: 'A大学', type: 'A类', status: 'pending' },
  { id: '2', name: '李四', school: 'B大学', type: 'B类', status: 'approved' },
  { id: '3', name: '王五', school: 'A大学', type: 'A类', status: 'pending' },
])

const filtered = computed(() => {
  return list.value.filter(item => {
    return [item.name, item.school, item.type].some(field => field.includes(keyword.value))
  })
})

function exportExcel() {
  ElMessage.success('已导出报名信息Excel表格')
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导出报名信息</span>
          <div class="header-actions">
            <el-input 
              v-model="keyword" 
              placeholder="搜索姓名、学校、类型" 
              clearable 
              style="max-width: 280px; margin-right: 12px" 
            />
            <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filtered" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="school" label="学校" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-card>
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
  align-items: center;
}
</style>

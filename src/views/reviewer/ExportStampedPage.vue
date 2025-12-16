<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multipleSelection = ref<any[]>([])
const list = ref([
  { id: '1', name: '张三', school: 'A大学', type: 'A类' },
  { id: '2', name: '李四', school: 'B大学', type: 'B类' },
  { id: '3', name: '王五', school: 'A大学', type: 'A类' },
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSelectionChange(rows: any[]) {
  multipleSelection.value = rows
}

function batchExport() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的报名表')
    return
  }
  ElMessage.success(`已批量导出 ${multipleSelection.value.length} 份盖章报名表`)
}

function singleExport(id: string) {
  ElMessage.success(`已导出ID为 ${id} 的盖章报名表`)
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导出盖章报名表</span>
          <el-button type="primary" @click="batchExport">批量导出</el-button>
        </div>
      </template>
      <el-table :data="list" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="school" label="学校" />
        <el-table-column prop="type" label="类型" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="singleExport(row.id)">单独导出</el-button>
          </template>
        </el-table-column>
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
</style>

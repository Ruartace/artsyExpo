<template>
  <div class="roster-block">
    <div class="roster-tools">
      <div class="roster-title">{{ title }}</div>
      <div class="tool-btns">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :disabled="readonly"
        >
          <el-link type="primary" :disabled="readonly">批量导入</el-link>
        </el-upload>
        <el-divider direction="vertical" />
        <el-link @click="addRowBelow(rowsLocal.length - 1)" :disabled="readonly">新增一行</el-link>
        <el-divider direction="vertical" />
        <el-link @click="clearRows" :disabled="readonly">清空</el-link>
        <el-divider direction="vertical" />
        <el-link type="success" @click="downloadTemplate">下载模板</el-link>
      </div>
    </div>

    <el-table :data="rowsLocal" border style="width: 100%">
      <el-table-column label="序号" prop="_seq" width="70" align="center" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <el-select
            v-if="col.type==='select'"
            v-model="row[col.prop]"
            size="small"
            :placeholder="`请选择${col.label}`"
            style="width: 100%"
            :disabled="readonly"
          >
            <el-option v-for="op in col.options || []" :key="op.value" :label="op.label" :value="op.value" />
          </el-select>
          <el-input
            v-else
            v-model="row[col.prop]"
            size="small"
            :placeholder="`请输入${col.label}`"
            :disabled="readonly"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" align="center">
        <template #default="{ $index }">
          <span v-if="readonly">-</span>
          <div v-else class="row-actions">
            <el-button size="small" type="primary" link @click="addRowBelow($index)">插入</el-button>
            <el-button size="small" type="danger" link @click="remove($index)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

type Column = {
  prop: string
  label: string
  width?: number
  type?: 'text' | 'select'
  options?: Array<{ label: string; value: string }>
}

type RosterItem = Record<string, string | number | null>

const props = defineProps<{
  title: string
  columns: Column[]
  rows: RosterItem[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:rows', v: RosterItem[]): void
}>()

const uploadRef = ref()
const rowsLocal = ref<RosterItem[]>(props.rows ? JSON.parse(JSON.stringify(props.rows)) : [])

watch(() => props.rows, (v) => {
  rowsLocal.value = v ? JSON.parse(JSON.stringify(v)) : []
  reseq()
}, { deep: true })

const reseq = () => rowsLocal.value.forEach((r, i) => (r._seq = i + 1))
reseq()
const sync = () => emit('update:rows', JSON.parse(JSON.stringify(rowsLocal.value)))

const addRowBelow = (idx: number) => {
  const at = Math.max(0, isNaN(idx) ? 0 : idx + 1)
  rowsLocal.value.splice(at, 0, {}); reseq(); sync()
}
const remove = (idx: number) => { rowsLocal.value.splice(idx, 1); reseq(); sync() }
const clearRows = () => { rowsLocal.value = []; reseq(); sync() }

// Excel文件导入功能
const handleFileChange = (file: { raw: File }) => {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]

      if (!sheetName || !workbook.Sheets[sheetName]) {
        ElMessage.warning('Excel文件格式不正确')
        return
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        ElMessage.warning('Excel文件内容为空或格式不正确')
        return
      }

      // 跳过表头，从第二行开始解析数据
      const importedRows: RosterItem[] = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (row && Array.isArray(row) && row.some(cell => cell !== undefined && cell !== '')) {
          const rowData: RosterItem = {}
          props.columns.forEach((col, index) => {
            // 跳过序号列，从第二列开始映射
            const cellValue = row[index + 1]
            if (cellValue !== undefined && cellValue !== '') {
              rowData[col.prop] = String(cellValue).trim()
            }
          })
          importedRows.push(rowData)
        }
      }

      if (importedRows.length > 0) {
        rowsLocal.value.push(...importedRows)
        reseq()
        sync()
        ElMessage.success(`成功导入 ${importedRows.length} 条数据`)
      } else {
        ElMessage.warning('未找到有效的数据行')
      }
    } catch (error) {
      console.error('Excel解析错误:', error)
      ElMessage.error('Excel文件解析失败，请检查文件格式')
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

const downloadTemplate = () => {
  const header = ['序号', ...props.columns.map(c => c.label)]
  const csv = [header, ['示例行', ...props.columns.map(() => '')]].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.title}-模板.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.roster-tools{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.roster-title{font-weight:600}
.row-actions{display:inline-flex;gap:6px}
.tool-btns {
  display: flex;
  align-items: center;
  gap: 0;
}
.tool-btns .el-upload {
  display: inline-flex;
  align-items: center;
}
</style>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

interface Props {
  keyword: string
  importable?: boolean
  downloadable?: boolean
  addable?: boolean
  clearable?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:keyword', v: string): void
  (e: 'import'): void
  (e: 'download'): void
  (e: 'add'): void
  (e: 'clear'): void
  (e: 'search', v: string): void
}>()

function onSearch() {
  emit('search', props.keyword)
}
</script>

<template>
  <div class="action-toolbar">
    <el-space wrap>
      <el-button v-if="importable" type="primary" @click="$emit('import')">批量导入</el-button>
      <el-button v-if="downloadable" type="primary" @click="$emit('download')">下载模板</el-button>
      <el-button v-if="addable" type="primary" @click="$emit('add')">添加一行</el-button>
      <el-button v-if="clearable" type="danger" @click="$emit('clear')">清空</el-button>
      <el-input :model-value="keyword" @update:model-value="$emit('update:keyword', $event)" placeholder="模糊搜索" clearable class="short-input" />
      <el-button type="primary" @click="onSearch">搜索</el-button>
    </el-space>
  </div>
</template>

<style scoped lang="scss">
.action-toolbar {
  margin: 8px 0;
}
.short-input { width: 300px; }
</style>



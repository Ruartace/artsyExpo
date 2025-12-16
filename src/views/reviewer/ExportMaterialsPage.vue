<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

type MaterialType = 'photo' | 'work' | 'other'
type GroupType = 'unit' | 'group'

const materialType = ref<MaterialType[]>([])
const groupType = ref<GroupType>('unit')
const selectedUnits = ref<string[]>([])
const selectedGroups = ref<string[]>([])

const units = ref(['A大学', 'B大学', 'C大学'])
const groups = ref(['A类', 'B类', 'C类'])

const materialTypeOptions = [
  { label: '证件照', value: 'photo' },
  { label: '作品材料', value: 'work' },
  { label: '其它材料', value: 'other' },
]

const groupTypeOptions = [
  { label: '按单位', value: 'unit' },
  { label: '按组别', value: 'group' },
]

function handleExport() {
  if (materialType.value.length === 0) {
    ElMessage.warning('请至少选择一种材料类型')
    return
  }
  
  if (groupType.value === 'unit' && selectedUnits.value.length === 0) {
    ElMessage.warning('请至少选择一个单位')
    return
  }
  
  if (groupType.value === 'group' && selectedGroups.value.length === 0) {
    ElMessage.warning('请至少选择一个组别')
    return
  }
  
  ElMessage.success('已导出报名材料')
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导出报名材料</span>
        </div>
      </template>
      
      <el-form label-width="120px">
        <el-form-item label="材料类型">
          <el-checkbox-group v-model="materialType">
            <el-checkbox 
              v-for="option in materialTypeOptions" 
              :key="option.value" 
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="分类逻辑">
          <el-radio-group v-model="groupType">
            <el-radio 
              v-for="option in groupTypeOptions" 
              :key="option.value" 
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="groupType === 'unit'" label="选择单位">
          <el-checkbox-group v-model="selectedUnits">
            <el-checkbox 
              v-for="unit in units" 
              :key="unit" 
              :label="unit"
            >
              {{ unit }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item v-if="groupType === 'group'" label="选择组别">
          <el-checkbox-group v-model="selectedGroups">
            <el-checkbox 
              v-for="group in groups" 
              :key="group" 
              :label="group"
            >
              {{ group }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleExport">导出材料</el-button>
        </el-form-item>
      </el-form>
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

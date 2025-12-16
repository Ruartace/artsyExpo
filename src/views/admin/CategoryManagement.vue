<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Edit } from '@element-plus/icons-vue'

// 页面类型定义
type PageType =
  | 'vocal'           // 声乐报名
  | 'instrumental'    // 器乐报名
  | 'dance'           // 舞蹈报名
  | 'opera'           // 戏曲报名
  | 'recitation'      // 朗诵报名
  | 'calligraphy'     // 书法作品
  | 'painting'        // 绘画作品
  | 'design'          // 设计作品
  | 'photography'     // 摄影作品     // 微电影作品
  | 'artPractice'     // 艺术实践工作坊报名
  | 'aestheticInnovation' // 美育改革创新优秀案例申报

// 类别选项类型
interface CategoryOption {
  label: string  // 显示文本
  value: string   // 选项值
}

// 字段标签名称映射
const fieldLabelMap: Record<PageType, string> = {
  vocal: '表演形式',
  instrumental: '表演形式',
  dance: '表演形式',
  opera: '表演形式',
  recitation: '表演形式',
  calligraphy: '作品形式',
  painting: '作品形式',
  design: '作品形式',
  photography: '作品形式',
  artPractice: '类别',
  aestheticInnovation: '类别（选题方向）'
}

// 页面类型配置
const pageTypes: Array<{ type: PageType; name: string }> = [
  { type: 'vocal', name: '声乐报名' },
  { type: 'instrumental', name: '器乐报名' },
  { type: 'dance', name: '舞蹈报名' },
  { type: 'opera', name: '戏曲报名' },
  { type: 'recitation', name: '朗诵报名' },
  { type: 'calligraphy', name: '书法作品' },
  { type: 'painting', name: '绘画作品' },
  { type: 'design', name: '设计作品' },
  { type: 'photography', name: '摄影作品' },
  { type: 'artPractice', name: '艺术实践工作坊报名' },
  { type: 'aestheticInnovation', name: '美育改革创新优秀案例申报' }
]

// 默认类别选项
const defaultCategories: Record<PageType, CategoryOption[]> = {
  vocal: [
    { label: '合唱', value: 'chorus' },
    { label: '小合唱/表演唱', value: 'ensemble' },
    { label: '独唱', value: 'solo' }
  ],
  instrumental: [
    { label: '合奏', value: 'ensemble' },
    { label: '小合奏', value: 'small-ensemble' },
    { label: '重奏', value: 'chamber' }
  ],
  dance: [
    { label: '群舞', value: 'group-dance' }
  ],
  opera: [
    { label: '戏曲', value: 'opera' },
    { label: '校园短剧', value: 'campus-drama' },
    { label: '小品', value: 'sketch' },
    { label: '歌舞剧', value: 'musical-drama' },
    { label: '音乐剧', value: 'musical' },
    { label: '其他', value: 'other' }
  ],
  recitation: [
    { label: '朗诵', value: 'group-dance' }
  ],
  calligraphy: [
    { label: '书法', value: 'calligraphy' },
    { label: '篆刻', value: 'seal-carving' }
  ],
  painting: [
    { label: '国画', value: 'chinese-painting' },
    { label: '水彩/水粉画', value: 'watercolor' },
    { label: '油画', value: 'oil-painting' },
    { label: '其他', value: 'other' }
  ],
  design: [
    { label: '平面设计', value: 'graphic-design' },
    { label: '立体设计', value: '3d-design' }
  ],
  photography: [
    { label: '单张照', value: 'single-photo' },
    { label: '组照', value: 'group-photo' }
  ],
  artPractice: [
    { label: '艺术与科技', value: 'art-tech' },
    { label: '艺术与校园', value: 'art-campus' },
    { label: '艺术与生活', value: 'art-life' },
    { label: '艺术与美丽乡村', value: 'art-village' }
  ],
  aestheticInnovation: [
    { label: '高校美育教师队伍建设', value: 'teacher-team' },
    { label: '高校公共艺术课程建设与教学改革', value: 'public-art-course' },
    { label: '高校专业艺术人才培养模式改革创新', value: 'talent-training' },
    { label: '高校艺术师范教育教学改革', value: 'normal-education' },
    { label: '高校中华优秀传统文化艺术传承创新', value: 'cultural-heritage' },
    { label: '高校学生艺术社团及实践工作坊建设', value: 'student-org' },
    { label: '协同育人机制构建', value: 'collaborative-education' },
    { label: '高校校园文化育人', value: 'campus-culture' },
    { label: '高校美育服务社会路径及实施', value: 'social-service' },
    { label: '高校美育保障机制构建', value: 'guarantee-mechanism' },
    { label: '高校美育评价体系建设', value: 'evaluation-system' }
  ]
}

// 从localStorage加载保存的类别选项
function loadCategories(): Record<PageType, CategoryOption[]> {
  const saved = localStorage.getItem('pageCategories')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 合并默认值和保存的值，确保所有类型都有值
      const loaded: Record<PageType, CategoryOption[]> = { ...defaultCategories }
      Object.keys(parsed).forEach(key => {
        if (key in defaultCategories) {
          loaded[key as PageType] = parsed[key] || []
        }
      })
      return loaded
    } catch (e) {
      console.error('Failed to parse saved categories:', e)
    }
  }
  return { ...defaultCategories }
}

// 类别选项数据
const pageCategories = reactive<Record<PageType, CategoryOption[]>>(loadCategories())

// 搜索和筛选
const keyword = ref('')

// 筛选后的页面类型列表
const filteredPageTypes = computed(() => {
  return pageTypes.filter(page =>
    !keyword.value || page.name.includes(keyword.value)
  )
})

// 当前编辑的行索引和页面类型
const editingIndex = ref<number | null>(null)
const editingPageType = ref<PageType | null>(null)
const editingLabel = ref('')
const editingValue = ref('')

// 对话框显示状态
const dialogVisible = ref(false)

// 打开添加对话框
function openAddDialog(pageType: PageType) {
  editingPageType.value = pageType
  editingIndex.value = null
  editingLabel.value = ''
  editingValue.value = ''
  dialogVisible.value = true
}

// 打开编辑对话框
function openEditDialog(pageType: PageType, index: number) {
  const category = pageCategories[pageType][index]
  if (!category) return

  editingPageType.value = pageType
  editingIndex.value = index
  editingLabel.value = category.label
  editingValue.value = category.value
  dialogVisible.value = true
}

// 保存编辑
function saveEdit() {
  if (!editingPageType.value) return

  const fieldLabel = fieldLabelMap[editingPageType.value]

  if (!editingLabel.value.trim()) {
    ElMessage.warning(`请输入${fieldLabel}名称`)
    return
  }

  if (!editingValue.value.trim()) {
    ElMessage.warning('请输入类别值')
    return
  }

  // 检查值是否重复
  const existingIndex = pageCategories[editingPageType.value].findIndex(
    (cat, idx) => cat.value === editingValue.value && idx !== editingIndex.value
  )

  if (existingIndex !== -1) {
    ElMessage.warning('类别值已存在，请使用其他值')
    return
  }

  const newCategory: CategoryOption = {
    label: editingLabel.value.trim(),
    value: editingValue.value.trim()
  }

  if (editingIndex.value === null) {
    // 添加新类别
    pageCategories[editingPageType.value].push(newCategory)
    ElMessage.success(`已添加${fieldLabel}`)
  } else {
    // 编辑现有类别
    pageCategories[editingPageType.value][editingIndex.value] = newCategory
    ElMessage.success(`已更新${fieldLabel}`)
  }

  // 保存到localStorage
  saveCategories(editingPageType.value)

  // 关闭对话框
  closeDialog()
}

// 关闭对话框
function closeDialog() {
  dialogVisible.value = false
  editingIndex.value = null
  editingPageType.value = null
  editingLabel.value = ''
  editingValue.value = ''
}

// 删除类别
async function deleteCategory(pageType: PageType, index: number) {
  const category = pageCategories[pageType][index]
  if (!category) return

  const fieldLabel = fieldLabelMap[pageType]
  try {
    await ElMessageBox.confirm(
      `确定要删除${fieldLabel}"${category.label}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    pageCategories[pageType].splice(index, 1)
    ElMessage.success(`已删除${fieldLabel}`)

    // 保存到localStorage
    saveCategories(pageType)
  } catch {
    // 用户取消删除
  }
}

// 保存类别选项
function saveCategories(pageType: PageType) {
  try {
    const categoriesToSave = { [pageType]: pageCategories[pageType] }
    const saved = localStorage.getItem('pageCategories')
    const existing = saved ? JSON.parse(saved) : {}
    const updated = { ...existing, ...categoriesToSave }
    localStorage.setItem('pageCategories', JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save categories:', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 批量保存所有类别
function saveAllCategories() {
  try {
    localStorage.setItem('pageCategories', JSON.stringify(pageCategories))
    ElMessage.success('已保存所有类别')
  } catch (e) {
    console.error('Failed to save all categories:', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 重置为默认值
function resetToDefault(pageType: PageType) {
  pageCategories[pageType] = [...defaultCategories[pageType]]
  saveCategories(pageType)
  ElMessage.info(`已重置"${pageTypes.find(p => p.type === pageType)?.name}"的类别为默认值`)
}

// 重置所有为默认值
function resetAllToDefault() {
  Object.keys(defaultCategories).forEach(key => {
    pageCategories[key as PageType] = [...defaultCategories[key as PageType]]
  })
  saveAllCategories()
  ElMessage.info('已重置所有类别为默认值')
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>类型管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="saveAllCategories">保存全部</el-button>
            <el-button type="warning" @click="resetAllToDefault">重置全部</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索 -->
      <div class="filters">
        <el-input
          v-model="keyword"
          placeholder="搜索页面类型"
          clearable
          style="max-width: 300px"
        />
      </div>

      <!-- 类别列表（按12个类型分类） -->
      <div class="categories-list">
        <el-card
          v-for="page in filteredPageTypes"
          :key="page.type"
          class="category-card"
          shadow="hover"
        >
          <template #header>
            <div class="category-card-header">
              <div class="category-title-wrapper">
                <span class="category-title">{{ page.name }}</span>
                <span class="category-field-label">（{{ fieldLabelMap[page.type] }}）</span>
              </div>
              <div class="category-actions">
                <el-button size="small" type="primary" :icon="Plus" @click="openAddDialog(page.type)">
                  添加{{ fieldLabelMap[page.type] }}
                </el-button>
                <el-button size="small" @click="resetToDefault(page.type)">
                  重置默认
                </el-button>
              </div>
            </div>
          </template>

          <!-- 类别表格 -->
          <el-table :data="pageCategories[page.type]" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column :prop="'label'" :label="fieldLabelMap[page.type] + '名称'" min-width="200" />
            <el-table-column prop="value" label="类别值" min-width="100" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ $index }">
                <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="openEditDialog(page.type, $index)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="deleteCategory(page.type, $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <div v-if="pageCategories[page.type].length === 0" class="empty-state">
            <el-empty :description='`暂无${fieldLabelMap[page.type]}，点击"添加${fieldLabelMap[page.type]}"按钮添加`' :image-size="100" />
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex === null
        ? `添加${editingPageType ? fieldLabelMap[editingPageType] : '类别'}`
        : `编辑${editingPageType ? fieldLabelMap[editingPageType] : '类别'}`"
      width="600px"
      @close="closeDialog"
    >
      <el-form :model="{ label: editingLabel, value: editingValue }" label-width="100px">
        <el-form-item :label="editingPageType ? fieldLabelMap[editingPageType] + '名称' : '类别名称'" required>
          <el-input
            v-model="editingLabel"
            :placeholder="`请输入${editingPageType ? fieldLabelMap[editingPageType] : '类别'}名称`"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类别值" required>
          <el-input
            v-model="editingValue"
            placeholder="请输入类别值（英文或数字，用于存储）"
            maxlength="50"
            show-word-limit
          />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            提示：类别值用于系统存储，建议使用英文或数字，不可重复
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
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
  margin-bottom: 20px;
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(800px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .categories-list {
    grid-template-columns: 1fr;
  }
}

.category-card {
  margin-bottom: 0;
}

.category-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.category-field-label {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

:deep(.el-table) {
  .el-table__cell {
    padding: 12px 0;
  }
}
</style>


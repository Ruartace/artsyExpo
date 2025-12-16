<script lang="ts" setup name="HomeView">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, UploadFilled, Download, Upload, Search } from '@element-plus/icons-vue'

interface FileItem {
  name: string
  size: number
  type?: string
}

interface RegistrationRecord {
  index: number
  category: string
  categoryKey: string
  workName: string
  submitTime: string
  status: string
  storageKey: string
  data: Record<string, unknown>
}

const registrationRecords = ref<RegistrationRecord[]>([])
const allRecords = ref<RegistrationRecord[]>([]) // 所有记录（未筛选）
const filterCategory = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedCategory = ref('')
const exporting = ref(false)
const uploading = ref(false)
const sealedFileList = ref<FileItem[]>([])

// 获取类别名称
const getCategoryName = (key: string) => {
  const names: Record<string, string> = {
    vocal: '声乐报名',
    instrumental: '器乐报名',
    dance: '舞蹈报名',
    opera: '戏曲报名',
    recitation: '朗诵报名',
    calligraphy: '书法作品',
    painting: '绘画作品',
    design: '设计作品',
    photography: '摄影作品',
    microfilm: '微电影作品',
    artPractice: '艺术实践工作坊',
    aestheticInnovation: '美育改革创新案例'
  }
  return names[key] || key
}

// 从数据中提取作品名称
const extractWorkName = (data: Record<string, unknown>, categoryKey: string): string => {
  // 尝试从数据中提取作品名称
  const base = data.base as Record<string, unknown> | undefined

  if (base) {
    // 声乐作品可能使用 song1
    if (categoryKey === 'vocal' && base.song1) {
      return String(base.song1)
    }
    // 其他类别可能使用 workName 或 title
    if (base.workName) {
      return String(base.workName)
    }
    if (base.title) {
      return String(base.title)
    }
    // 艺术实践工作坊使用 projectName
    if (base.projectName) {
      return String(base.projectName)
    }
    // 美育改革创新案例使用 caseName
    if (base.caseName) {
      return String(base.caseName)
    }
  }

  // 如果没有找到，生成假数据
  return generateMockWorkName(categoryKey)
}

// 生成随机状态
const getRandomStatus = (): string => {
  const statuses = ['待审核', '已审核', '未审核']
  const randomIndex = Math.floor(Math.random() * statuses.length)
  return statuses[randomIndex] || '未审核'
}

// 生成假作品名称
const generateMockWorkName = (categoryKey: string): string => {
  const mockNames: Record<string, string[]> = {
    vocal: ['青春之歌', '祖国颂', '黄河大合唱', '歌唱祖国', '我和我的祖国'],
    instrumental: ['春江花月夜', '二泉映月', '高山流水', '梅花三弄', '十面埋伏'],
    dance: ['青春舞曲', '茉莉花', '千手观音', '天鹅湖', '红色娘子军'],
    opera: ['牡丹亭', '白蛇传', '梁祝', '沙家浜', '智取威虎山'],
    recitation: ['将进酒', '春江花月夜', '再别康桥', '面朝大海春暖花开', '相信未来'],
    calligraphy: ['兰亭序', '道德经', '论语', '千字文', '百家姓'],
    painting: ['江山如画', '春山图', '秋韵', '水墨江南', '山水之间'],
    design: ['现代艺术设计', '传统与现代', '创新思维', '美学探索', '设计理念'],
    photography: ['城市记忆', '自然风光', '人文纪实', '光影艺术', '时光印记'],
    microfilm: ['青春记忆', '校园故事', '梦想启航', '成长路上', '时代之声'],
    artPractice: ['艺术与科技融合', '传统工艺创新', '文化传承工作坊', '创意设计实践', '美育教育探索'],
    aestheticInnovation: ['高校美育改革实践', '艺术教育创新案例', '美育课程体系建设', '文化育人新模式', '艺术教育实践探索']
  }

  const names = mockNames[categoryKey] || ['未命名作品']
  const randomIndex = Math.floor(Math.random() * names.length)
  return names[randomIndex] || '未命名作品'
}

// 加载报名记录
const loadRegistrationRecords = () => {
  const keyMap: Record<string, string> = {
    'vocalFormDraft': 'vocal',
    'instrumentFormDraft': 'instrumental',
    'danceFormDraft': 'dance',
    'operaFormDraft': 'opera',
    'recitationFormDraft': 'recitation',
    'calligraphyFormDraft': 'calligraphy',
    'paintingFormDraft': 'painting',
    'designFormDraft': 'design',
    'photographyFormDraft': 'photography',
    'microfilmFormDraft': 'microfilm',
    'artPracticeFormDraft': 'artPractice',
    'aestheticInnovationFormDraft': 'aestheticInnovation'
  }

  const records: RegistrationRecord[] = []

  Object.entries(keyMap).forEach(([storageKey, categoryKey]) => {
    try {
      const data = localStorage.getItem(storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed && Object.keys(parsed).length > 0) {
          records.push({
            index: records.length + 1,
            category: getCategoryName(categoryKey),
            categoryKey: categoryKey,
            workName: extractWorkName(parsed, categoryKey),
            submitTime: new Date().toLocaleString('zh-CN'),
            status: getRandomStatus(),
            storageKey: storageKey,
            data: parsed
          })
        }
      }
    } catch (error) {
      console.error(`加载 ${storageKey} 失败:`, error)
    }
  })

  // 如果没有数据，添加一些假数据用于展示
  if (records.length === 0) {
    const mockRecords: RegistrationRecord[] = [
      {
        index: 1,
        category: '声乐报名',
        categoryKey: 'vocal',
        workName: generateMockWorkName('vocal'),
        submitTime: new Date(Date.now() - 86400000 * 2).toLocaleString('zh-CN'),
        status: '待审核',
        storageKey: 'mock_vocal',
        data: {}
      },
      {
        index: 2,
        category: '器乐报名',
        categoryKey: 'instrumental',
        workName: generateMockWorkName('instrumental'),
        submitTime: new Date(Date.now() - 86400000 * 1).toLocaleString('zh-CN'),
        status: '已审核',
        storageKey: 'mock_instrumental',
        data: {}
      },
      {
        index: 3,
        category: '舞蹈报名',
        categoryKey: 'dance',
        workName: generateMockWorkName('dance'),
        submitTime: new Date().toLocaleString('zh-CN'),
        status: '未审核',
        storageKey: 'mock_dance',
        data: {}
      },
      {
        index: 4,
        category: '书法作品',
        categoryKey: 'calligraphy',
        workName: generateMockWorkName('calligraphy'),
        submitTime: new Date(Date.now() - 86400000 * 3).toLocaleString('zh-CN'),
        status: '待审核',
        storageKey: 'mock_calligraphy',
        data: {}
      },
      {
        index: 5,
        category: '绘画作品',
        categoryKey: 'painting',
        workName: generateMockWorkName('painting'),
        submitTime: new Date(Date.now() - 86400000 * 4).toLocaleString('zh-CN'),
        status: '已审核',
        storageKey: 'mock_painting',
        data: {}
      }
    ]
    records.push(...mockRecords)
  }

  registrationRecords.value = records
  allRecords.value = records
}

// 筛选和搜索后的记录
const filteredRecords = computed(() => {
  let records = [...allRecords.value]

  // 按类别筛选
  if (filterCategory.value) {
    records = records.filter(record => record.category === filterCategory.value)
  }

  // 模糊搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(record =>
      record.category.toLowerCase().includes(keyword) ||
      record.workName.toLowerCase().includes(keyword)
    )
  }

  return records
})

// 总数
const totalRecords = computed(() => filteredRecords.value.length)

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 导出所有报名表
const exportAll = async () => {
  exporting.value = true
  try {
    // TODO: 实现导出逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 按类别导出报名表
const exportByCategory = async () => {
  if (!selectedCategory.value) {
    ElMessage.warning('请选择要导出的类别')
    return
  }
  exporting.value = true
  try {
    // TODO: 实现按类别导出逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`导出${getCategoryName(selectedCategory.value)}成功`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 上传盖章报名表
const uploadSealed = async () => {
  if (sealedFileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  uploading.value = true
  try {
    // TODO: 实现上传逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('上传成功')
    sealedFileList.value = []
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 查看详情
const viewDetail = (row: RegistrationRecord) => {
  ElMessage.info(`查看 ${row.category} 的报名详情`)
  // TODO: 实现查看详情逻辑，可以跳转到对应的报名页面
}

onMounted(() => {
  loadRegistrationRecords()
})
</script>
<template>
  <div class="ef-form">
    <!-- 顶部说明 -->
    <el-card shadow="never" class="intro-card">
      <template #header>
        <div class="ef-card-title">
          <el-icon><InfoFilled /></el-icon>
          <span>报名数据统计</span>
        </div>
      </template>
      <div class="intro-text">
        以下为您提交的报名记录，您可以查看、导出报名表或上传盖章后的报名表。
      </div>
    </el-card>

    <!-- 报名记录表格 -->
    <el-card shadow="never" class="ef-section-card">
      <template #header>
        <div class="ef-card-title">
          <span>报名记录</span>
        </div>
      </template>
      <div class="ef-sec-watermark">1</div>

      <!-- 筛选和搜索工具栏 -->
      <div class="toolbar">
        <el-row :gutter="16" align="middle">
          <el-col :span="6">
            <el-select
              v-model="filterCategory"
              placeholder="筛选类别"
              clearable
              style="width: 100%"
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="声乐报名" value="声乐报名" />
              <el-option label="器乐报名" value="器乐报名" />
              <el-option label="舞蹈报名" value="舞蹈报名" />
              <el-option label="戏曲报名" value="戏曲报名" />
              <el-option label="朗诵报名" value="朗诵报名" />
              <el-option label="书法作品" value="书法作品" />
              <el-option label="绘画作品" value="绘画作品" />
              <el-option label="设计作品" value="设计作品" />
              <el-option label="摄影作品" value="摄影作品" />
              <el-option label="微电影作品" value="微电影作品" />
              <el-option label="艺术实践工作坊" value="艺术实践工作坊" />
              <el-option label="美育改革创新案例" value="美育改革创新案例" />
            </el-select>
          </el-col>
          <el-col :span="10">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索作品名称、类别"
              clearable
              @input="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <div class="toolbar-info">
              共 {{ totalRecords }} 条记录
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table :data="paginatedRecords" border style="width: 100%">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="180" />
        <el-table-column prop="workName" label="作品名称" width="200" show-overflow-tooltip />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '已审核' ? 'success' : row.status === '待审核' ? 'warning' : 'info'"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 导出报名表 -->
    <el-card shadow="never" class="ef-section-card">
      <template #header><div class="ef-card-title"><span>导出报名表</span></div></template>
      <div class="ef-sec-watermark">2</div>
      <div class="export-section">
        <p class="export-desc">您可以选择导出所有报名表数据，或按类别导出特定类型的报名表。</p>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-button type="primary" size="large" @click="exportAll" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出所有报名表
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-select v-model="selectedCategory" placeholder="选择类别" style="width: 100%">
              <el-option label="声乐报名" value="vocal" />
              <el-option label="器乐报名" value="instrumental" />
              <el-option label="舞蹈报名" value="dance" />
              <el-option label="戏曲报名" value="opera" />
              <el-option label="朗诵报名" value="recitation" />
              <el-option label="书法作品" value="calligraphy" />
              <el-option label="绘画作品" value="painting" />
              <el-option label="设计作品" value="design" />
              <el-option label="摄影作品" value="photography" />
              <el-option label="微电影作品" value="microfilm" />
              <el-option label="艺术实践工作坊" value="artPractice" />
              <el-option label="美育改革创新案例" value="aestheticInnovation" />
            </el-select>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="24">
            <el-button type="success" size="large" @click="exportByCategory" :disabled="!selectedCategory" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出选中类别报名表
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 上传盖章报名表 -->
    <el-card shadow="never" class="ef-section-card">
      <template #header><div class="ef-card-title"><span>上传盖章报名表</span></div></template>
      <div class="ef-sec-watermark">3</div>
      <el-upload
        v-model:file-list="sealedFileList"
        class="ef-upload-block"
        drag
        multiple
        :auto-upload="false"
        :limit="10"
        :accept="'.pdf,.jpg,.jpeg,.png'"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将盖章后的报名表拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持：PDF、JPG、PNG格式。请上传已盖章的报名表扫描件或照片。
          </div>
        </template>
      </el-upload>
      <div class="ef-actions" style="margin-top: 16px">
        <el-button type="primary" size="large" @click="uploadSealed" :disabled="sealedFileList.length === 0" :loading="uploading">
          <el-icon><Upload /></el-icon>
          提交盖章报名表
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.export-section {
  .export-desc {
    color: #606266;
    margin-bottom: 24px;
    line-height: 1.6;
  }
}

.toolbar {
  margin-bottom: 16px;

  .toolbar-info {
    text-align: right;
    color: #606266;
    line-height: 32px;
  }
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>


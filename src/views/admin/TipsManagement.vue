<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 提示词类型定义
type PageType = 
  | 'vocal'           // 声乐报名
  | 'instrumental'    // 器乐报名
  | 'dance'           // 舞蹈报名
  | 'opera'           // 戏曲报名
  | 'recitation'      // 朗诵报名
  | 'calligraphy'     // 书法作品
  | 'painting'        // 绘画作品
  | 'design'          // 设计作品
  | 'photography'     // 摄影作品
  | 'microfilm'       // 微电影作品
  | 'artPractice'     // 艺术实践工作坊报名
  | 'aestheticInnovation' // 美育改革创新优秀案例申报

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PageTips = {
  pageType: PageType
  pageName: string
  tips: string  // 提示词内容
  uploadTip: string  // 上传作品提示
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
  { type: 'microfilm', name: '微电影作品' },
  { type: 'artPractice', name: '艺术实践工作坊报名' },
  { type: 'aestheticInnovation', name: '美育改革创新优秀案例申报' }
]

// 提示词数据（从localStorage加载或使用默认值）
const defaultTips: Record<PageType, string> = {
  vocal: '合唱：合唱队人数不超过40人，钢琴伴奏1人，指挥1人（应为本校教师），每支合唱队可演唱两首作品（其中至少一首中国作品），演出时间不超过8分钟。\n小合唱或表演唱：人数不超过15人（含伴奏），不设指挥，不得伴舞，演出时间不超过5分钟。',
  instrumental: '小合奏或重奏：人数不超过12人，不设指挥，演出时间不超过6分钟。\n大合奏：人数不超过65人，指挥1人，演出时间不超过10分钟（含指挥、乐队各一次上下台）。',
  dance: '群舞：人数不超过36人，演出时间不超过7分钟。\n独舞、双人舞、三人舞：演出时间不超过6分钟。',
  opera: '含戏曲、校园短剧、小品、歌舞剧、音乐剧等。人数不超过12人（含伴奏），演出时间不超过12分钟。',
  recitation: '作品文体不限，须使用普通话，人数不超过8人（含伴奏，学生不作道具），不得伴舞，演出时间不超过5分钟。',
  calligraphy: '书体不限。尺寸不超过四尺宣纸（69cm×138cm）。',
  painting: '国画、水彩/水粉画（丙烯画）、版画、油画，或其他画种。尺寸：国画不超过四尺宣纸（69cm×138cm）对开，其他画种尺寸均不超过对开（54cm×78cm）。',
  design: '含平面设计和立体设计。平面设计尺寸不超过对开（54cm×78cm），立体设计尺寸不超过50cm（长）×50cm（宽）×50cm（高）。',
  photography: '单张照和组照（每组不超过4幅，需标明顺序号），尺寸均为14英寸（30.48cm×35.56cm）；除影调处理外，不得利用电脑和暗房技术改变影像原貌。',
  microfilm: '播放格式不限，播放时长不超过12分钟。',
  artPractice: '艺术实践工作坊应体现中华优秀文化传承、地域特色、民族团结等主题。',
  aestheticInnovation: '高校美育改革创新优秀案例需围绕美育改革创新实践展开，体现美育工作的创新性和实效性。'
}

// 上传提示默认值
const defaultUploadTips: Record<PageType, string> = {
  vocal: '支持：音频（mp3/wav）、乐谱（pdf）、图片（jpg/png，建议≥1200×1200）。为统一展演的正常播放，请使用常见编码格式。每个节目的最终材料以本地打包提交，文件大小不宜超过100MB；不要将多个文件打包；严禁含违规内容；请遵守版权规范。',
  instrumental: '音频、乐谱、图片、视频等多格式支持，所有作品资料请合规提交。',
  dance: '支持：音频、视频、图片、PDF等多种格式。为展演播放，请使用常见编码，每个节目的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  opera: '支持：音频、视频、图片、PDF等多种格式。为展演播放，请使用常见编码，每个节目的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  recitation: '支持：音频、视频、图片、PDF等多种格式。为展演播放，请使用常见编码，每个节目的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  calligraphy: '支持：图片（jpg/png，建议≥1200×1200）、PDF等格式。每个作品的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  painting: '支持：图片（jpg/png，建议≥1200×1200）、PDF等格式。每个作品的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  design: '支持：图片（jpg/png，建议≥1200×1200）、PDF、3D模型等格式。每个作品的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  photography: '支持：图片（jpg/png，建议≥1200×1200）、RAW等格式。每个作品的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  microfilm: '支持：视频（mp4/mov等）、图片、脚本等格式。播放格式不限，每个作品的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  artPractice: '支持：音频、视频、图片、PDF等多种格式。为展演播放，请使用常见编码，每个节目的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。',
  aestheticInnovation: '支持：音频、视频、图片、PDF等多种格式。为展演播放，请使用常见编码，每个节目的最终材料以本地打包提交，文件大小不宜超过100MB，不要将多个文件打包。'
}

// 从localStorage加载保存的提示词，如果没有则使用默认值
function loadTips(): Record<PageType, string> {
  const saved = localStorage.getItem('pageTips')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 合并默认值和保存的值，确保所有类型都有值
      const loaded: Record<PageType, string> = { ...defaultTips }
      Object.keys(parsed).forEach(key => {
        if (key in defaultTips) {
          loaded[key as PageType] = parsed[key]
        }
      })
      return loaded
    } catch (e) {
      console.error('Failed to parse saved tips:', e)
    }
  }
  return { ...defaultTips }
}

// 从localStorage加载保存的上传提示，如果没有则使用默认值
function loadUploadTips(): Record<PageType, string> {
  const saved = localStorage.getItem('pageUploadTips')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 合并默认值和保存的值，确保所有类型都有值
      const loaded: Record<PageType, string> = { ...defaultUploadTips }
      Object.keys(parsed).forEach(key => {
        if (key in defaultUploadTips) {
          loaded[key as PageType] = parsed[key]
        }
      })
      return loaded
    } catch (e) {
      console.error('Failed to parse saved upload tips:', e)
    }
  }
  return { ...defaultUploadTips }
}

// 提示词数据
const pageTips = reactive<Record<PageType, string>>(loadTips())

// 上传提示数据
const pageUploadTips = reactive<Record<PageType, string>>(loadUploadTips())

// 搜索和筛选
const keyword = ref('')

// 筛选后的页面类型列表
const filteredPageTypes = computed(() => {
  return pageTypes.filter(page => 
    !keyword.value || page.name.includes(keyword.value)
  )
})

// 保存提示词
function saveTips(pageType: PageType) {
  try {
    const tipsToSave = { [pageType]: pageTips[pageType] }
    const saved = localStorage.getItem('pageTips')
    const existing = saved ? JSON.parse(saved) : {}
    const updated = { ...existing, ...tipsToSave }
    localStorage.setItem('pageTips', JSON.stringify(updated))
    ElMessage.success(`已保存"${pageTypes.find(p => p.type === pageType)?.name}"的提示词`)
  } catch (e) {
    console.error('Failed to save tips:', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 保存上传提示
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveUploadTip(pageType: PageType) {
  try {
    const tipsToSave = { [pageType]: pageUploadTips[pageType] }
    const saved = localStorage.getItem('pageUploadTips')
    const existing = saved ? JSON.parse(saved) : {}
    const updated = { ...existing, ...tipsToSave }
    localStorage.setItem('pageUploadTips', JSON.stringify(updated))
    ElMessage.success(`已保存"${pageTypes.find(p => p.type === pageType)?.name}"的上传提示`)
  } catch (e) {
    console.error('Failed to save upload tip:', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 批量保存所有提示词
function saveAllTips() {
  try {
    localStorage.setItem('pageTips', JSON.stringify(pageTips))
    localStorage.setItem('pageUploadTips', JSON.stringify(pageUploadTips))
    ElMessage.success('已保存所有提示词')
  } catch (e) {
    console.error('Failed to save all tips:', e)
    ElMessage.error('保存失败，请重试')
  }
}

// 重置为默认值
function resetToDefault(pageType: PageType) {
  pageTips[pageType] = defaultTips[pageType]
  pageUploadTips[pageType] = defaultUploadTips[pageType]
  ElMessage.info(`已重置"${pageTypes.find(p => p.type === pageType)?.name}"的提示词为默认值`)
}

// 重置所有为默认值
function resetAllToDefault() {
  Object.keys(defaultTips).forEach(key => {
    pageTips[key as PageType] = defaultTips[key as PageType]
  })
  Object.keys(defaultUploadTips).forEach(key => {
    pageUploadTips[key as PageType] = defaultUploadTips[key as PageType]
  })
  ElMessage.info('已重置所有提示词为默认值')
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>提示管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="saveAllTips">保存全部</el-button>
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
      
      <!-- 提示词列表（按12个类型分类） -->
      <div class="tips-list">
        <el-card
          v-for="page in filteredPageTypes"
          :key="page.type"
          class="tip-card"
          shadow="hover"
        >
          <template #header>
            <div class="tip-card-header">
              <span class="tip-title">{{ page.name }}</span>
              <div class="tip-actions">
                <el-button size="small" type="primary" @click="saveTips(page.type)">
                  保存
                </el-button>
                <el-button size="small" @click="resetToDefault(page.type)">
                  重置默认
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="tip-sections">
            <div class="tip-section">
              <div class="tip-section-label">页面提示词：</div>
              <el-input
                v-model="pageTips[page.type]"
                type="textarea"
                :rows="6"
                placeholder="请输入该页面的提示词"
                class="tips-textarea"
              />
            </div>
            <div class="tip-section">
              <div class="tip-section-label">上传作品提示：</div>
              <el-input
                v-model="pageUploadTips[page.type]"
                type="textarea"
                :rows="4"
                placeholder="请输入上传作品下方的小字提示"
                class="tips-textarea"
              />
            </div>
          </div>
        </el-card>
      </div>
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
  gap: 8px;
}

.filters {
  margin-bottom: 20px;
}

.tips-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .tips-list {
    grid-template-columns: 1fr;
  }
}

.tip-card {
  margin-bottom: 0;
}

.tip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.tip-actions {
  display: flex;
  gap: 8px;
}

.tips-textarea {
  width: 100%;
  
  :deep(.el-textarea__inner) {
    font-size: 14px;
    line-height: 1.6;
    font-family: inherit;
    resize: vertical;
  }
}

.tip-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tip-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-section-label {
  font-weight: 500;
  font-size: 14px;
  color: #606266;
}
</style>


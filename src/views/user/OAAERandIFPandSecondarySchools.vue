
<script lang="ts" setup name="OAAERandIFPandSecondarySchools">
import { reactive, ref ,watch} from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'

// 定义类型接口
interface BaseForm {
  performanceType: string
  categoryPath: string[]
  artworkName: string
  performerCount: number | null
  creationTime: string
  song1: string
  song2: string
  minutes: number
  seconds: number
  song1HasChinese: boolean
  song1IsOriginal: boolean
  song2HasChinese: boolean
  song2IsOriginal: boolean
  contact: string
  phone: string
  address: string
  group: string
  leader: string
  tutor: string
  conductor: string
  notice: boolean
  contactUnit: string
  contactPosition: string
  email: string
  intro: string

}

interface FileItem {
  name: string
  size: number
  type?: string
}

interface RosterItem {
  name?: string
  gender?: 'male' | 'female'
  title?: string
  org?: string
  phone?: string
  idNo?: string
  nation?: string
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
}

interface SubmitPayload {
  base: BaseForm & { durationSec: number }
  intro: string
  files: FileItem[]
  rosters: {
    teachers: RosterItem[]
    members: RosterItem[]
    accomp: RosterItem[]
  }
}

defineProps<{ readonly?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: SubmitPayload): void }>()

/* ---- 基础信息 ---- */
const baseForm = reactive<BaseForm>({
  performanceType: '',
  categoryPath: [],
  artworkName: '',
  performerCount: null,
  creationTime: '',
  song1: '',
  song2: '',
  minutes: 0,
  seconds: 0,
  song1HasChinese: true,
  song1IsOriginal: false,
  song2HasChinese: true,
  song2IsOriginal: false,
  contact: '',
  phone: '',
  address: '',
  group: '',
  leader: '',
  tutor: '',
  conductor: '',
  notice: false,
  contactUnit: '',
  contactPosition: '',
  email: '',
  intro: ''
})

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])

/* ---- 多级分类数据 ---- */
interface CategoryOption {
  label: string
  value: string
  children?: CategoryOption[]
}

const categoryOptions = ref<CategoryOption[]>([
  {
    label: '（一）教学案例',
    value: 'teachingCase',
    children: [
      { label: '1. 艺术课程活力课堂', value: '1' },
      { label: '2. 跨学科美育教学课例', value: '2' },
      { label: '3. 数字技术在美育教学中的应用', value: '3' },
      { label: '4. 美育课后服务教学实践', value: '4' }
    ]
  },
  {
    label: '（二）教学研究',
    value: 'teachingResearch',
    children: [
      { label: '1. 传承中华优秀传统文化教育实践研究', value: '1' },
      { label: '2. 艺术课程教学方法创新方法', value: '2' }
    ]
  },
  {
    label: '（三）实践活动',
    value: 'practiceActivity',
    children: [
      { label: '2. 中小学美育浸润行动实践', value: '2' },
      { label: '3. 常态化学生全员艺术展演实践', value: '3' },
      { label: '4. 城乡中小学美育交流帮扶实践', value: '4' },
    ]
  },
  {
    label: '（四）校园文化',
    value: 'campusCulture',
    children: [
      { label: '1. 中华传统传统文化艺术传承学校建设', value: '1' },
      { label: '2. 中小学艺术团建设', value: '2' },
      { label: '3. 最美校园建设', value: '3' },
      { label: '4. 社会资源整合与美育条件保障', value: '4' }
    ]
  }
])

// 监听级联选择器变化，更新performanceType
watch(() => baseForm.categoryPath, (newPath) => {
  if (newPath && newPath.length === 2) {
    baseForm.performanceType = newPath[1] || ''
  } else {
    baseForm.performanceType = ''
  }
})





/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  // 暂存当前表单数据到本地存储
  const saveData = {
    base: baseForm,
    intro: intro.value,
    files: fileList.value
  }

  try {
    localStorage.setItem('voiceFormDraft', JSON.stringify(saveData))
    ElMessage.success('表单已暂存成功')
  } catch (error) {
    console.error('暂存失败:', error)
    ElMessage.error('暂存失败，请重试')
  }
}

const onSubmit = () => {
  const payload: SubmitPayload = {
    base: { ...baseForm, durationSec: 0 },
    intro: intro.value,
    files: fileList.value.map(f => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: [], members: [], accomp: [] }
  }
  emit('submit', payload)
}

</script>

<template>
  <div class="scroll-container">
    <div class="voice-form">
    <!-- 顶部说明 -->
    <el-card shadow="never" class="intro-card">
      <template #header>
        <div class="card-title">
          <el-icon><InfoFilled /></el-icon>
          <span>中小学美育改革创新优秀成果报名表</span>
        </div>
      </template>
    </el-card>

    <!-- 1 基础信息 -->
    <el-card shadow="never" class="section-card sec-1">
      <template #header><div class="card-title"><span>优秀成果基础信息</span></div></template>

      <el-form :model="baseForm" label-width="120px" :disabled="readonly" class="base-form">
        <!-- 作品基本信息 -->
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="优秀成果名称" required>
              <el-input v-model="baseForm.artworkName" placeholder="请填写工作坊名称，不需要加书名号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类别（选题方向）" required label-width="180px">
              <el-cascader
                v-model="baseForm.categoryPath"
                :options="categoryOptions"
                placeholder="请选择类别"
                style="width: 100%"
                :props="{ expandTrigger: 'hover' }"
                clearable
                filterable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="优秀成果代码" required>
              <el-input v-model="baseForm.performerCount" placeholder="请填写作品人数" />
            </el-form-item>
          </el-col>
           <el-col :span="8">
              <el-button type="primary" @click="onSave" >优秀成果代码说明</el-button>
          </el-col>
        </el-row>
        <!-- 联系信息 -->
        <div class="contact-section">
          <h4 class="section-title">联系信息</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="作者姓名" required>
                <el-input v-model="baseForm.contact" placeholder="填写填报人或者负责人姓名即可" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报送单位" required >
                <el-input v-model="baseForm.address" placeholder="四川大学" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
             <el-col :span="12">
              <el-form-item label="负责人电话" required>
                <el-input v-model="baseForm.phone" placeholder="联系人手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="负责人单位" required>
                <el-input v-model="baseForm.contactUnit" placeholder="填写联系人单位，例如：学校、组织等" />
              </el-form-item>

            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="负责人职称" required>
                <el-input v-model="baseForm.contactPosition" placeholder="填写联系人职务，例如：负责人、负责人助理等" />
              </el-form-item>
            </el-col>
             <el-col :span="12">
              <el-form-item label="电子邮箱" required>
                <el-input v-model="baseForm.email" placeholder="填写联系人电子邮箱" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>
        <!-- 2 作品简介 -->
    <el-card shadow="never" class="section-card sec-3">
      <template #header>
        <div class="card-title">
          <span>优秀成果简介区</span>
          <span class="desc-tip">（最多 500 字）</span>
        </div>
      </template>
      <el-form-item prop="intro" required label="优秀成果简介" label-width="190px">
      <el-input v-model="baseForm.intro" type="textarea" :rows="7" maxlength="500" show-word-limit placeholder="请填写工作坊文本介绍区" :disabled="readonly" />
    </el-form-item>
    </el-card>
    <!-- 2 上传作品 -->
    <el-card  required shadow="never" class="section-card sec-2">
      <el-form-item prop="fileList" required label="材料上传" >
      <el-upload
        v-model:file-list="fileList"
        class="upload-block"
        drag
        multiple
        :auto-upload="false"
        :limit="6"
        :disabled="readonly"
        :accept="accepts"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持：音频（mp3/wav）、乐谱（pdf）、图片（jpg/png，建议≥1200×1200）。为统一展演的正常播放，请使用常见编码格式。每个节目的最终材料以本地打包提交，文件大小不宜超过100MB；不要将多个文件打包；严禁含违规内容；请遵守版权规范。
          </div>
        </template>
      </el-upload>
      </el-form-item>
    </el-card>

    <!-- 用户阅读须知区 -->
     <div class="notice">
      <div class="notice-content">
        <p style="color: red">请仔细阅读报名须知，确认无误后勾选报名须知，即可进行报名。</p>
        <el-row :gutter="34">
          <el-col :span="12">
            <el-form-item label="报名须知" prop="notice">
              <el-checkbox v-model="baseForm.notice" required>我已仔细阅读并同意报名须知</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      </div>
    <!-- 操作区 -->
    <div class="actions">
      <el-button size="large" @click="onSave" :disabled="readonly">暂存</el-button>
      <el-button type="primary" size="large" @click="onSubmit">提交报名表</el-button>
    </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>

.scroll-container {
  height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
}
.voice-form {
  display: flex;
  flex-direction: column;
  max-width: 82vw;
  margin: 0 auto;
  gap: 10px;
}

/* 标题 */
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  .desc-tip {
    color: #909399;
    font-weight: 400;
    margin-left: 8px;
  }
}


/* 区块卡片 */
.section-card {
  position: relative;
  overflow: hidden;
}

.base-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.duration,
.dimension {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  .el-input {
    min-width: 140px;
    max-width: 200px;
  }
  .unit {
    color: #606266;
    font-size: 14px;
  }
}

.song-section,
.contact-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.upload-block {
  width: 420px;
}

.performer-limit-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #409eff;
  font-size: 14px;
  margin-bottom: 16px;
}

.input-error {
  :deep(.el-input__wrapper) {
    border-color: #f56565 !important;
    box-shadow: 0 0 0 1px #f56565 inset !important;
  }
}

.mt16 {
  margin-top: 16px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

/* 小屏适配 */
@media (max-width: 1024px) {
  .upload-block {
    width: 100%;
  }
}
</style>

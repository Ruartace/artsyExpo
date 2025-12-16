
<script lang="ts" setup name="ArtPracticeWorksheet">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'

// 定义类型接口
interface BaseForm {
  performanceType: string
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

/* ---- 花名册 列定义 ---- */
type Column = {
  prop: string
  label: string
  width?: number
  type?: 'text' | 'select'
  options?: Array<{ label: string; value: string }>
}


const memberColumns: Column[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'gender', label: '性别', width: 150, type: 'select', options: [{ label:'男', value:'male' }, { label:'女', value:'female' }] },
  { prop: 'school', label: '学校', width: 100 },
  { prop: 'studentId', label: '学籍号', width: 160 },
  { prop: 'phone', label: '联系方式', width: 160 },
  { prop: 'batch', label: '批次', width: 180, type: 'select', options: [{ label:'第一批次', value:'1' }, { label:'第二批次', value:'2' }] },
]
const teacherColumns: Column[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'gender', label: '性别', width: 150, type: 'select', options: [{ label:'男', value:'male' }, { label:'女', value:'female' }] },
  { prop: 'school', label: '学校', width: 100 },
  { prop: 'phone', label: '联系方式', width: 160 },
  { prop: 'batch', label: '批次', width: 180, type: 'select', options: [{ label:'第一批次', value:'1' }, { label:'第二批次', value:'2' }] },
]
/* ---- 表数据 ---- */
const teachers = ref<RosterItem[]>([])
const members = ref<RosterItem[]>([])



/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  // 暂存当前表单数据到本地存储
  const saveData = {
    base: baseForm,
    intro: intro.value,
    files: fileList.value,
    rosters: {
      members: members.value,
    }
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
    rosters: { teachers: [], members: members.value, accomp: [] }
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
          <span>艺术实践工坊作品报名表</span>
        </div>
      </template>
    </el-card>

    <!-- 1 基础信息 -->
    <el-card shadow="never" class="section-card sec-1">
      <template #header><div class="card-title"><span>项目基础信息</span></div></template>
      <el-form :model="baseForm" label-width="120px" :disabled="readonly" class="base-form">
        <!-- 作品基本信息 -->
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="项目名称" required>
              <el-input v-model="baseForm.artworkName" placeholder="请填写工作坊名称，不需要加书名号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类别" required>
              <el-select v-model="baseForm.performanceType" placeholder="请选择" style="width: 100%">
                <el-option label="剪纸" value="paperCutting" />
                <el-option label="皮影" value="shadowPlay" />
                <el-option label="编织" value="weaving" />
                <el-option label="刺绣" value="stiching" />
                <el-option label="（面塑）泥塑" value="mud" />
                <el-option label="年画" value="newYear" />
                <el-option label="版画" value="woodcut" />
                <el-option label="扎染（蜡染）" value="crocheting" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 联系信息 -->
        <div class="contact-section">
          <h4 class="section-title">联系信息</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系人姓名" required>
                <el-input v-model="baseForm.contact" placeholder="填写填报人或者负责人姓名即可" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人电话" required>
                <el-input v-model="baseForm.phone" placeholder="联系人手机号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系地址" required>
                <el-input v-model="baseForm.address" placeholder="联系地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="联系人单位" required>
                <el-input v-model="baseForm.contactUnit" placeholder="填写联系人单位，例如：学校、组织等" />
              </el-form-item>

            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系人职务" required>
                <el-input v-model="baseForm.contactPosition" placeholder="填写联系人职务，例如：负责人、负责人助理等" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组别" required>
                 <el-select v-model="baseForm.group" placeholder="请选择" style="width: 100%">
                <el-option label="甲组" value="group1" />
                <el-option label="乙组" value="group2" />
                 </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
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
          <span>工作坊文本介绍区</span>
          <span class="desc-tip">（最多 500 字）</span>
        </div>
      </template>
      <el-form-item prop="intro" required label="工作坊项目简介" label-width="190px">
      <el-input v-model="baseForm.intro" type="textarea" :rows="7" maxlength="500" show-word-limit placeholder="请填写工作坊文本介绍区" :disabled="readonly" />
    </el-form-item>
      <el-form-item prop="intro" required label="设计思路和特色描述" label-width="190px">
      <el-input v-model="baseForm.intro" type="textarea" :rows="7" maxlength="500" show-word-limit placeholder="请填写设计思路和特色描述" :disabled="readonly" />
    </el-form-item>
    <el-form-item prop="intro" required label="展区设计方案" label-width="190px">
      <el-input v-model="baseForm.intro" type="textarea" :rows="7" maxlength="500" show-word-limit placeholder="请填写展区设计方案" :disabled="readonly" />
    </el-form-item>
     <el-form-item label="本方案是否预设设计图"  label-width="190px" required>
       <el-radio-group v-model="baseForm.song1IsOriginal">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <div style="color: red; font-size: 18px; margin-bottom: 10px;font-weight: 500;">注：若选择是，请将设计方案设计图稿报送至工作坊组委会邮箱（expo@artsyexpo.cn）</div>
    </el-card>
    <!-- 2 上传作品 -->
    <el-card  required shadow="never" class="section-card sec-2">
      <el-form-item prop="fileList" required label="上传工作坊视频" >
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

    <!-- 4 花名册 -->
<el-card shadow="never" class="section-card sec-4">
      <template #header><div class="card-title"><span>报名花名册</span></div></template>
      <div style="color: red; font-size: 18px; margin-bottom: 10px;font-weight: 800;">注：带队教师分两批，共限四人</div>
      <RosterBlock title="带队教师" :columns="teacherColumns" v-model:rows="teachers" :readonly="readonly" />
      <div style=" font-size: 18px; margin-bottom: 10px;margin-top: 10px; font-weight: 800;">学生名单</div>
            <div style="color: red; font-size: 18px; margin-bottom: 10px;font-weight: 800;">注：学生分两批，共限12人</div>
      <RosterBlock class="mt16" title="参赛学生" :columns="memberColumns" v-model:rows="members" :readonly="readonly" />
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

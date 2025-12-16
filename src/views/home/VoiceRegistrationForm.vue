
<script lang="ts" setup name="VoiceRegistrationForm">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'

// 定义类型接口
interface BaseForm {
  performanceType: 'chorus' | 'ensemble' | 'solo'
  minutes: number
  seconds: number
  song1: string
  song2: string
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
  notice: boolean
  chorusCount?: number
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
  performanceType: 'chorus',
  minutes: 0,
  seconds: 0,
  song1: '',
  song2: '',
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
  notice: false,
  chorusCount: undefined
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

const teacherColumns: Column[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'gender', label: '性别', width: 100, type: 'select', options: [{ label:'男', value:'male' }, { label:'女', value:'female' }] },
  { prop: 'title', label: '职称/专业', width: 160 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'school', label: '学校名称', width: 160 },
  { prop: 'org', label: '所属院系/部门', width: 180 },
  { prop: 'phone', label: '联系方式', width: 160 }
]

const memberColumns: Column[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'major', label: '专业类别', width: 160 },
  { prop: 'grade', label: '年级', width: 100 },
  { prop: 'gender', label: '性别', width: 100, type: 'select', options: [{ label:'男', value:'male' }, { label:'女', value:'female' }] },
  { prop: 'region', label: '所在地区', width: 140 },
  { prop: 'school', label: '学校名称', width: 160 },
  { prop: 'dept', label: '所在院系/部门', width: 180 },
  { prop: 'phone', label: '联系方式', width: 160 }
]

const accompColumns: Column[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'major', label: '专业', width: 160 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'gender', label: '性别', width: 100, type: 'select', options: [{ label:'男', value:'male' }, { label:'女', value:'female' }] },
  { prop: 'region', label: '所在地区', width: 140 },
  { prop: 'school', label: '学校名称', width: 160 },
  { prop: 'dept', label: '所在院系/部门', width: 180 },
  { prop: 'phone', label: '联系方式', width: 160 }
]

/* ---- 三个表数据 ---- */
const teachers = ref<RosterItem[]>([])
const members = ref<RosterItem[]>([])
const accomp = ref<RosterItem[]>([])

/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  // 暂存当前表单数据到本地存储
  const saveData = {
    base: baseForm,
    intro: intro.value,
    files: fileList.value,
    rosters: {
      teachers: teachers.value,
      members: members.value,
      accomp: accomp.value
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
// 重置功能待商议
// const onReset = () => {
//   baseForm.performanceType = 'chorus'
//   baseForm.minutes = 0
//   baseForm.seconds = 0
//   baseForm.song1 = ''
//   baseForm.song2 = ''
//   baseForm.song1HasChinese = true
//   baseForm.song1IsOriginal = false
//   baseForm.song2HasChinese = true
//   baseForm.song2IsOriginal = false
//   baseForm.contact = ''
//   baseForm.phone = ''
//   baseForm.address = ''
//   baseForm.group = ''
//   baseForm.leader = ''
//   baseForm.tutor = ''
//   baseForm.notice = false
//   baseForm.chorusCount = undefined
//   intro.value = ''
//   fileList.value = []
//   teachers.value = []
//   members.value = []
//   accomp.value = []
// }

const onSubmit = () => {
  const payload: SubmitPayload = {
    base: { ...baseForm, durationSec: baseForm.minutes * 60 + baseForm.seconds },
    intro: intro.value,
    files: fileList.value.map(f => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: teachers.value, members: members.value, accomp: accomp.value }
  }
  emit('submit', payload)
}
</script>

<template>
  <div class="voice-form">
    <!-- 顶部说明 -->
    <el-card shadow="never" class="intro-card">
      <template #header>
        <div class="card-title">
          <el-icon><InfoFilled /></el-icon>
          <span>声乐作品报名表</span>
        </div>
      </template>
      <div class="intro-text">
        合唱：合唱队人数不超过40人，钢琴伴奏1人，指挥1人（应为本校教师），每支合唱队可演唱两首作品（其中至少一首中国作品），演出时间不超过8分钟。<br />
        小合唱或表演唱：人数不超过15人（含伴奏），不设指挥，不得伴舞，演出时间不超过5分钟。
      </div>
    </el-card>

    <!-- 1 基础信息 -->
    <el-card shadow="never" class="section-card sec-1">
      <template #header><div class="card-title"><span>作品信息</span></div></template>
      <div class="sec-watermark">1</div>

      <el-form :model="baseForm" label-width="120px" :disabled="readonly" class="base-form">
        <!-- 表演形式和时长 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="表演形式">
              <el-select v-model="baseForm.performanceType" placeholder="请选择" style="width: 100%">
                <el-option label="合唱" value="chorus" />
                <el-option label="小合唱/表演唱" value="ensemble" />
                <el-option label="独唱" value="solo" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作品时长">
              <div class="duration">
                <el-input v-model.number="baseForm.minutes" type="number" min="0" style="width:80px" />
                <span class="unit">分</span>
                <el-input v-model.number="baseForm.seconds" type="number" min="0" max="59" style="width:80px" />
                <span class="unit">秒</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 合唱人数（仅合唱时显示） -->
        <el-row :gutter="24" v-if="baseForm.performanceType === 'chorus'">
          <el-col :span="12">
            <el-form-item label="合唱人数">
              <el-input v-model.number="baseForm.chorusCount" type="number" min="1" placeholder="请输入合唱人数" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 曲目信息 -->
        <div class="song-section">
          <h4 class="section-title">曲目信息</h4>

          <!-- 曲目1 -->
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="曲目1" required>
                <el-input v-model="baseForm.song1" placeholder="请输入曲目名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否中文作品">
                <el-radio-group v-model="baseForm.song1HasChinese">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否原创作品">
                <el-radio-group v-model="baseForm.song1IsOriginal">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 曲目2 -->
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="曲目2（可选）">
                <el-input v-model="baseForm.song2" placeholder="若只演唱一首可留空" />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="baseForm.song2">
              <el-form-item label="是否中文作品">
                <el-radio-group v-model="baseForm.song2HasChinese">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="baseForm.song2">
              <el-form-item label="是否原创作品">
                <el-radio-group v-model="baseForm.song2IsOriginal">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 联系信息 -->
        <div class="contact-section">
          <h4 class="section-title">联系信息</h4>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系人">
                <el-input v-model="baseForm.contact" placeholder="联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="baseForm.phone" placeholder="手机号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系地址">
                <el-input v-model="baseForm.address" placeholder="联系地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组别">
                 <el-select v-model="baseForm.group" placeholder="请选择" style="width: 100%">
                <el-option label="甲组(非专业组)" value="group1" />
                <el-option label="乙组" value="group2" />
                <el-option label="丁组" value="group3" />
                 </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>

    <!-- 2 作品简介 -->
    <el-card shadow="never" class="section-card sec-2">
      <template #header>
        <div class="card-title">
          <span>作品简介</span>
          <span class="desc-tip">（最多 200 字）</span>
        </div>
      </template>
      <div class="sec-watermark">2</div>
      <el-input v-model="intro" type="textarea" :rows="7" maxlength="200" show-word-limit placeholder="请填写作品简介" :disabled="readonly" />
    </el-card>

    <!-- 3 上传作品 -->
    <el-card shadow="never" class="section-card sec-3">
      <template #header><div class="card-title"><span>上传作品</span></div></template>
      <div class="sec-watermark">3</div>
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
    </el-card>

    <!-- 4 花名册 -->
    <el-card shadow="never" class="section-card sec-4">
      <template #header><div class="card-title"><span>报名花名册</span></div></template>
      <div class="sec-watermark">4</div>
      <RosterBlock title="指导教师" :columns="teacherColumns" v-model:rows="teachers" :readonly="readonly" />
      <RosterBlock class="mt16" title="参赛人员" :columns="memberColumns" v-model:rows="members" :readonly="readonly" />
      <RosterBlock class="mt16" title="指挥（可以为本校老师）" :columns="accompColumns" v-model:rows="accomp" :readonly="readonly" />
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
</template>
<style lang="scss" scoped>
.voice-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.intro-card .intro-text {
  color: #666;
  line-height: 1.7;
}

/* 区块卡片 + 背景水印数字 */
.section-card {
  position: relative;
  overflow: hidden;

  .sec-watermark {
    position: absolute;
    right: 24px;
    top: 12px;
    font-size: 160px;
    line-height: 1;
    font-weight: 800;
    color: rgba(64, 158, 255, 0.12);
    user-select: none;
    pointer-events: none;
  }
}

.base-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.duration {
  display: inline-flex;
  align-items: center;
  gap: 8px;

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

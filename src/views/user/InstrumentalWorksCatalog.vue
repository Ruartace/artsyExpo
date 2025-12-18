<script lang="ts" setup name="InstrumentalWorksCatalog">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import { baseFormDefaults } from '@/config/forms/user/InstrumentalWorksCatalog'
import { memberColumns, teacherColumns } from '@/config/tables/user/InstrumentalWorksCatalog'

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
  ...baseFormDefaults,
})

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])

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
    },
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
//   baseForm.performerCount = 0
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
//   intro.value = ''
//   fileList.value = []
//   teachers.value = []
//   members.value = []
//   accomp.value = []
// }

const onSubmit = () => {
  const payload: SubmitPayload = {
    base: { ...baseForm, durationSec: 0 },
    intro: intro.value,
    files: fileList.value.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: [], members: members.value, accomp: [] },
  }
  emit('submit', payload)
}

/* ---- 人数限制计算属性 ---- */
const performerLimit = computed(() => {
  if (baseForm.performanceType === 'ensemble') {
    return {
      maxCount: 65,
      description:
        '合奏：乐队人数不超过 65 人，指挥 1 人（原则上应为本校教师），演出时间不超过 9 分钟',
    }
  } else if (
    baseForm.performanceType === 'smallEnsemble' ||
    baseForm.performanceType === 'repertoire'
  ) {
    return {
      maxCount: 12,
      description: '小合奏或重奏：人数不超过 12 人，不设指挥，演出时间不超过 6 分钟',
    }
  } else {
    return {
      maxCount: 65,
      description: '请先选择作品类型',
    }
  }
})

const performerCountExceeded = computed(() => {
  return baseForm.performerCount !== null && baseForm.performerCount > performerLimit.value.maxCount
})
</script>

<template>
  <div class="scroll-container">
    <div class="voice-form">
      <!-- 顶部说明 -->
      <el-card shadow="never" class="intro-card">
        <template #header>
          <div class="card-title">
            <el-icon><InfoFilled /></el-icon>
            <span>器乐作品报名表</span>
          </div>
        </template>
        <!-- p标签可以换插值语法 -->
        <div class="intro-text">
          合奏：乐队人数不超过 65 人，指挥 1 人（原则上应为本校教师），演出时间不超过 9 分钟。<br />
          小合奏或重奏：人数不超过 12 人，不设指挥，演出时间不超过 6 分钟。
        </div>
      </el-card>

      <!-- 1 基础信息 -->
      <el-card shadow="never" class="section-card sec-1">
        <template #header
          ><div class="card-title"><span>作品信息</span></div></template
        >

        <el-form :model="baseForm" label-width="120px" :disabled="readonly" class="base-form">
          <!-- 作品基本信息 -->
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="作品名称" required>
                <el-input v-model="baseForm.artworkName" placeholder="例：《器乐作品》" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="作品类型" required>
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="合奏" value="ensemble" />
                  <el-option label="小合奏" value="smallEnsemble" />
                  <el-option label="重奏" value="repertoire" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="作品时长" required>
                <div class="duration">
                  <el-input
                    v-model.number="baseForm.minutes"
                    type="number"
                    min="0"
                    style="width: 80px"
                  />
                  <span class="unit">分</span>
                  <el-input
                    v-model.number="baseForm.seconds"
                    type="number"
                    min="0"
                    max="59"
                    style="width: 80px"
                  />
                  <span class="unit">秒</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 表演人数 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                label="表演人数"
                required
                :error="performerCountExceeded ? `人数不能超过${performerLimit.maxCount}人` : ''"
              >
                <el-input
                  v-model.number="baseForm.performerCount"
                  type="number"
                  min="1"
                  :max="performerLimit.maxCount"
                  placeholder="请填写表演人数"
                  :class="{ 'input-error': performerCountExceeded }"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否为本届展演原创" label-width="150px">
                <el-radio-group v-model="baseForm.song1IsOriginal">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <div class="performer-limit-tip">
                <span>{{ performerLimit.description }}</span>
              </div>
            </el-col>
          </el-row>
          <!-- 联系信息 -->
          <div class="contact-section">
            <h4 class="section-title">联系信息</h4>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="联系人姓名" required>
                  <el-input v-model="baseForm.contact" placeholder="联系人姓名" />
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
                <el-form-item label="组别" required>
                  <el-select v-model="baseForm.group" placeholder="请选择" style="width: 100%">
                    <el-option label="甲组" value="group1" />
                    <el-option label="乙组" value="group2" />
                  </el-select>
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
            <span>作品描述</span>
            <span class="desc-tip">（最多 200 字）</span>
          </div>
        </template>
        <el-input
          v-model="intro"
          type="textarea"
          :rows="7"
          maxlength="200"
          show-word-limit
          placeholder="请填写作品简介"
          :disabled="readonly"
        />
      </el-card>
      <!-- 2 上传作品 -->
      <el-card required shadow="never" class="section-card sec-2">
        <el-form-item prop="fileList" required label="上传作品">
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
        <template #header
          ><div class="card-title"><span>报名花名册</span></div></template
        >
        <div style="color: red; font-size: 18px; margin-bottom: 10px; font-weight: 800">
          注：指导教师限3人
        </div>
        <RosterBlock
          title="指导教师"
          :columns="teacherColumns"
          v-model:rows="teachers"
          :readonly="readonly"
        />
        <div style="font-size: 18px; margin-bottom: 10px; margin-top: 10px; font-weight: 800">
          参演人员
        </div>
        <RosterBlock
          class="mt16"
          title="参赛学生"
          :columns="memberColumns"
          v-model:rows="members"
          :readonly="readonly"
        />
        <div style="font-size: 18px; margin-bottom: 10px; font-weight: 800">指挥信息</div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="指挥" label-width="80px">
              <el-select
                v-model="baseForm.conductor"
                placeholder="请选择指挥类型"
                style="width: 100%"
                :disabled="readonly"
              >
                <el-option label="教师" value="teacher" />
                <el-option label="学生" value="student" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 用户阅读须知区 -->
      <div class="notice">
        <div class="notice-content">
          <p style="color: red">请仔细阅读报名须知，确认无误后勾选报名须知，即可进行报名。</p>
          <el-row :gutter="34">
            <el-col :span="12">
              <el-form-item label="报名须知" prop="notice">
                <el-checkbox v-model="baseForm.notice" required
                  >我已仔细阅读并同意报名须知</el-checkbox
                >
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
@use '@/assets/styles/user_styles/InstrumentalWorksCatalog.scss';
</style>

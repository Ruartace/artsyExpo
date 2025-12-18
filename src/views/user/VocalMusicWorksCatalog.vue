<script lang="ts" setup name="VoiceRegistrationForm">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import {
  teacherColumns,
  memberColumns,
  accompColumns,
  accompanimentColumns,
} from '@/config/tables/user/VocalMusicWorksCatalog'
import { vocalBaseFormDefaults } from '@/config/forms/user/VocalMusicWorksCatalog'
import {
  createVocalMusicWork,
  getVocalPerformanceCategories,
} from '@/services/user/VocalMusicWorksCatalog'
import type { PerformanceCategory } from '@/services/user/VocalMusicWorksCatalog'

// 定义类型接口
interface BaseForm {
  performanceType: string | number
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
  performerCount: number | null
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
const baseForm = reactive<BaseForm>({ ...vocalBaseFormDefaults })

/* ---- 简介 ---- */
const intro = ref('')
const categoryOptions = ref<PerformanceCategory[]>([])

// 预加载表演形式分类
const loadCategories = async () => {
  const res = await getVocalPerformanceCategories()
  if (res.code === 200 && Array.isArray(res.data)) {
    categoryOptions.value = res.data
  } else {
    ElMessage.warning('获取表演形式失败，请刷新重试')
  }
}
loadCategories()
/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])
const scoreAccepts = '.pdf'
const scoreFiles = ref<FileItem[]>([])
/* ---- 四个表数据 ---- */
const teachers = ref<RosterItem[]>([])
const members = ref<RosterItem[]>([])
const accomp = ref<RosterItem[]>([])
const accompaniment = ref<RosterItem[]>([])
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
      accomp: accomp.value,
      accompaniment: accompaniment.value,
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
const onSubmit = () => {
  const durationSec = baseForm.minutes * 60 + baseForm.seconds
  const type = baseForm.performanceType

  if (!type) {
    ElMessage.error('请选择表演形式')
    return
  }
  if (!baseForm.performerCount || baseForm.performerCount < 1) {
    ElMessage.error('请输入有效的表演人数')
    return
  }
  if (members.value.length !== (baseForm.performerCount ?? 0)) {
    ElMessage.error('表演人数与参赛学生名单不一致')
    return
  }
  if (teachers.value.length > 3) {
    ElMessage.error('指导教师人数不得超过3人')
    return
  }
  //条件限制：包含人数以及时长
  if (type === 1) {
    // 合唱
    if (durationSec > 480) {
      ElMessage.error('合唱作品时长不能超过8分钟')
      return
    }
    const hasChinese = baseForm.song2
      ? baseForm.song1HasChinese || baseForm.song2HasChinese
      : baseForm.song1HasChinese
    if (!hasChinese) {
      ElMessage.error('合唱作品至少包含一首中国作品')
      return
    }
    if (accomp.value.length !== 1) {
      ElMessage.error('合唱需设置1位指挥')
      return
    }
    if (accompaniment.value.length !== 1) {
      ElMessage.error('合唱需设置1位伴奏')
      return
    }
    if (scoreFiles.value.length < 1) {
      ElMessage.error('请上传合唱谱（PDF）')
      return
    }
  } else if (type === 4) {
    // 班级合唱
    if (durationSec > 480) {
      ElMessage.error('班级合唱作品时长不能超过8分钟')
      return
    }
    if (members.value.length > 55) {
      ElMessage.error('班级合唱人数不得超过55人')
      return
    }
    const hasChinese = baseForm.song2
      ? baseForm.song1HasChinese || baseForm.song2HasChinese
      : baseForm.song1HasChinese
    if (!hasChinese) {
      ElMessage.error('班级合唱至少包含一首中国作品')
      return
    }
    if (accomp.value.length > 1) {
      ElMessage.error('班级合唱指挥最多1人')
      return
    }
    if (accompaniment.value.length > 1) {
      ElMessage.error('班级合唱伴奏最多1人')
      return
    }
    if (baseForm.group !== 'group1') {
      ElMessage.error('班级合唱仅限甲组')
      return
    }
    if (scoreFiles.value.length < 1) {
      ElMessage.error('请上传合唱谱（PDF）')
      return
    }
  } else if (type === 2 || type === 3) {
    // 小合唱或表演唱
    if (durationSec > 300) {
      ElMessage.error('作品时长不能超过5分钟')
      return
    }
    if (members.value.length + accompaniment.value.length > 15) {
      ElMessage.error('小合唱或表演唱人数不得超过15人（含伴奏）')
      return
    }
    if (accomp.value.length > 0) {
      ElMessage.error('小合唱或表演唱不设指挥')
      return
    }
    if (accompaniment.value.length > 1) {
      ElMessage.error('伴奏最多1人')
      return
    }
  }

  const payload: SubmitPayload = {
    base: { ...baseForm, durationSec },
    intro: intro.value,
    files: fileList.value.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: teachers.value, members: members.value, accomp: accomp.value },
  }
  emit('submit', payload)

  // 调用后端API提交数据
  // 注意：此处仅为示例，实际提交数据结构需要根据后端接口要求进行调整
  // 假设后端需要的 performance_form 和 group 是数字类型，这里需要进行转换映射
  const groupMap: Record<string, number> = {
    group1: 1, // 甲组
    group2: 2, // 乙组
  }

  createVocalMusicWork({
    title: baseForm.song1, // 假设使用第一首曲目名称作为作品标题
    description: intro.value,
    duration_minutes: baseForm.minutes,
    duration_seconds: baseForm.seconds,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    performer_count: baseForm.performerCount || 0,
    has_read_terms: baseForm.notice,
    performance_form: Number(baseForm.performanceType),
    group: groupMap[baseForm.group] || 0,
    // 文件上传通常需要先上传文件获取 URL，这里暂留空或根据实际逻辑处理
    video_file: null,
    score_file: null,
  }).then((res) => {
    if (res.code === 200) {
      ElMessage.success('报名成功')
      // 可以跳转或重置表单
    } else {
      ElMessage.error(res.message || '报名失败')
    }
  })
}
const durationLimit = computed(() =>
  baseForm.performanceType === 2 || baseForm.performanceType === 3 ? 300 : 480,
)
const durationExceeded = computed(
  () => baseForm.minutes * 60 + baseForm.seconds > durationLimit.value,
)
const durationErrorText = computed(() =>
  baseForm.performanceType === 2 || baseForm.performanceType === 3
    ? '作品时长不能超过5分钟'
    : '作品时长不能超过8分钟',
)
</script>

<template>
  <div class="scroll-container">
    <div class="voice-form">
      <!-- 顶部说明 -->
      <el-card shadow="never" class="intro-card">
        <template #header>
          <div class="card-title">
            <el-icon><InfoFilled /></el-icon>
            <span>声乐作品报名表</span>
          </div>
        </template>
        <!-- p标签可以换插值语法 -->
        <div class="intro-text">
          声乐节目提交合唱谱的电子版。合唱：合唱队人数不限，指挥和伴奏各自1人（应为本校教师），每支合唱队可演唱两首作品（其中至少一首中国作品），演出时间不超过8分钟。<br />
          班级合唱：演唱班级须是成建制普通教学班级（仅限中小学甲组），人数不超过55人，可另设指挥和伴奏各一人，应为本校老师。每个班级可演唱两首歌曲（其中至少一首中国作品），总时长不超过8分钟。<br />
          小合唱或表演唱：人数不超过15人（含伴奏，应为本校教师或学生），不设指挥，不得伴舞，演出时间不超过5分钟。
          <p style="color: red">
            注意：班级合唱报送时，需在曲目名称后面括号标注学段，如《XXX（小学）》，《XXX（初中）》，《XXX（高中）》，若未标注将进行驳回处理。
          </p>
        </div>
      </el-card>
      <!-- 1 基础信息 -->
      <el-card shadow="never" class="section-card sec-1">
        <template #header
          ><div class="card-title"><span>作品信息</span></div></template
        >

        <el-form :model="baseForm" label-width="120px" :disabled="readonly" class="base-form">
          <!-- 表演形式和时长 -->
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="表演形式" required>
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择表演形式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="作品时长"
                required
                :error="durationExceeded ? durationErrorText : ''"
              >
                <div class="duration" :class="{ 'input-error': durationExceeded }">
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
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="表演人数" required placeholder="请输入表演人数">
                <el-input
                  v-model.number="baseForm.performerCount"
                  type="number"
                  min="1"
                  placeholder="请输入表演人数"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 曲目信息 -->
          <div class="song-section">
            <h4 class="section-title">曲目信息</h4>
            <!-- 曲目1 -->
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="曲目1" required>
                  <el-input v-model="baseForm.song1" placeholder="请输入曲目名称" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="是否为中国作品">
                  <el-radio-group v-model="baseForm.song1HasChinese">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="是否为本届展演原创" label-width="150px">
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
              <el-col :span="4" v-if="baseForm.song2">
                <el-form-item label="是否为中国作品">
                  <el-radio-group v-model="baseForm.song2HasChinese">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="6" v-if="baseForm.song2">
                <el-form-item label="是否为本届展演原创" label-width="150px">
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
                <el-form-item label="联系人" required>
                  <el-input v-model="baseForm.contact" placeholder="请输入联系人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" required>
                  <el-input v-model="baseForm.phone" placeholder="请输入联系人手机号码" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="联系地址" required>
                  <el-input v-model="baseForm.address" placeholder="请输入联系地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组别" required>
                  <el-select v-model="baseForm.group" placeholder="请选择组别" style="width: 100%">
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
      <el-card shadow="never" class="section-card sec-2">
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

      <!-- 3 上传作品 -->
      <el-card required shadow="never" class="section-card sec-3">
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
      <!-- 上传合唱谱 -->
      <el-card shadow="never" class="section-card sec-3">
        <!-- <template #header><div class="card-title"><span>上传合唱谱</span></div></template> -->
        <el-form-item prop="scoreFiles" label="上传合唱谱">
          <el-upload
            v-model:file-list="scoreFiles"
            class="upload-block"
            drag
            multiple
            :auto-upload="false"
            :limit="6"
            :disabled="readonly"
            :accept="scoreAccepts"
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
        <RosterBlock
          class="mt16"
          title="老师指挥"
          :columns="accompColumns"
          v-model:rows="accomp"
          :readonly="readonly"
        />
        <RosterBlock
          class="mt16"
          title="老师伴奏"
          :columns="accompanimentColumns"
          v-model:rows="accompaniment"
          :readonly="readonly"
        />
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
@use '@/assets/styles/user_styles/VocalMusicWorksCatalog.scss';
</style>

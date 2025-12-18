<script lang="ts" setup name="DanceWorkCatalog">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import { baseFormDefaults } from '@/config/forms/user/DanceWorkCatalog'
import { teacherColumns, memberColumns } from '@/config/tables/user/DanceWorkCatalog'

// 定义类型接口
interface BaseForm {
  performanceType: string
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
  groupCount?: number
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

/* ---- 三个表数据 ---- */
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
      teachers: teachers.value,
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
//   baseForm.performanceType = 'group'
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
//   baseForm.groupCount = undefined
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
    files: fileList.value.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: teachers.value, members: members.value, accomp: [] },
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
            <span>舞蹈作品报名表</span>
          </div>
        </template>
        <div class="intro-text">群舞：人数不超过36人，演出时间不超过7分钟。<br /></div>
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
              <el-form-item label="表演形式" required placeholder="请选择表演形式">
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="群舞" value="group" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
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

          <!-- 群舞人数 -->
          <el-row :gutter="24" v-if="baseForm.performanceType === 'group'">
            <el-col :span="12">
              <el-form-item label="表演人数" required>
                <el-input
                  v-model.number="baseForm.groupCount"
                  type="number"
                  min="1"
                  placeholder="请输入群舞人数"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 表演信息 -->
          <div class="song-section">
            <h4 class="section-title">表演信息</h4>

            <!-- 表演名称 -->
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="表演名称" required>
                  <el-input v-model="baseForm.song1" placeholder="请输入表演名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否为本届展演原创" label-width="150px">
                  <el-radio-group v-model="baseForm.song1IsOriginal">
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
                  <el-input v-model="baseForm.contact" placeholder="联系人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" required>
                  <el-input v-model="baseForm.phone" placeholder="手机号" />
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
@use '@/assets/styles/user_styles/DanceWorkCatalog.scss';
</style>

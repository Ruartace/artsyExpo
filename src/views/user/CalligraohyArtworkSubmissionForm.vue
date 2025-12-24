<script lang="ts" setup name="CalligraohyArtworkSubmissionForm">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import { baseFormDefaults } from '@/config/forms/user/CalligraohyArtworkSubmissionForm'
import { memberColumns } from '@/config/tables/user/CalligraohyArtworkSubmissionForm'
import {
  saveCalligraphySubmission,
  getCalligraphySubmissionList,
  submitCalligraphySubmission,
  uploadCalligraphyFile,
  getCalligraphyCategories,
  getGroupCategories,
  addCalligraphyAuthor,
  deleteCalligraphyParticipant,
  getCalligraphyParticipants,
} from '@/services/user/CalligraohyArtworkSubmissionForm'
import type {
  CalligraphyCategory,
  GroupCategory,
  CalligraphySubmission,
} from '@/services/user/CalligraohyArtworkSubmissionForm'

// 定义类型接口
interface BaseForm {
  performanceType: string
  artworkName: string
  artworkLength: number | null
  artworkWidth: number | null
  creationTime: string
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
}

interface FileItem {
  name: string
  size: number
  type?: string
  raw?: File
  url?: string
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
  // Extend for local tracking
  server_id?: number
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
defineEmits<{ (e: 'submit', payload: SubmitPayload): void }>()

/* ---- 状态 ---- */
const submissionId = ref<number | string | null>(null)
const categoryOptions = ref<CalligraphyCategory[]>([])
const groupOptions = ref<GroupCategory[]>([])
const existingParticipantIds = ref<number[]>([])
const route = useRoute()

/* ---- 基础信息 ---- */
const baseForm = reactive<BaseForm>({
  ...baseFormDefaults,
})

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileList = ref<any[]>([]) // Use any to match element-plus file type

/* ---- 表数据 ---- */
const members = ref<RosterItem[]>([])

/* ---- 辅助函数 ---- */
function getAgeFromIdCard(idCard: string): number {
  if (!idCard || idCard.length < 10) return 0
  const yearStr = idCard.substring(6, 10)
  const year = parseInt(yearStr)
  if (isNaN(year)) return 0
  const currentYear = new Date().getFullYear()
  return currentYear - year
}

// 填充表单数据
const fillFormData = async (existing: CalligraphySubmission) => {
  submissionId.value = existing.id

  // 填充表单
  baseForm.artworkName = existing.title
  // 兼容处理：优先匹配 code，如果不行匹配 name
  const matchedCategory = categoryOptions.value.find(
    (c) => c.id === existing.calligraphy_type_id || c.id === existing.performance_form_id,
  )
  baseForm.performanceType =
    matchedCategory?.code ||
    matchedCategory?.name ||
    existing.calligraphy_type_name ||
    existing.performance_form ||
    existing.calligraphy_type_id?.toString() ||
    existing.performance_form_id?.toString() ||
    ''

  baseForm.artworkLength = existing.height_cm ?? existing.artwork_length ?? null
  baseForm.artworkWidth = existing.width_cm ?? existing.artwork_width ?? null
  baseForm.creationTime = existing.creation_time || existing.creation_date || ''
  baseForm.contact = existing.contact_name
  baseForm.phone = existing.contact_phone
  baseForm.address = existing.contact_address

  const matchedGroup = groupOptions.value.find(
    (g) => g.id === existing.group_id || g.name === existing.group_name,
  )
  baseForm.group =
    matchedGroup?.code ||
    matchedGroup?.name ||
    existing.group_name ||
    existing.group ||
    existing.group_id?.toString() ||
    ''

  baseForm.tutor = existing.instructor_name || existing.tutor_name || ''
  baseForm.notice = existing.has_read_terms
  intro.value = existing.description

  // 填充图片 (如果 image_file 存在)
  if (existing.image_file || existing.artwork_file) {
    const fileUrl = existing.artwork_file || existing.image_file
    // 这里只是简单的显示，实际上可能需要处理成 FileItem
    fileList.value = [
      {
        name: fileUrl?.split('/').pop() || 'uploaded-file',
        url: fileUrl,
      },
    ]
  }

  // 4. 获取相关人员
  const partRes = await getCalligraphyParticipants(existing.id)
  if (partRes.data) {
    existingParticipantIds.value = partRes.data.map((p) => p.id)
    members.value = partRes.data.map((p) => ({
      name: p.name,
      gender: (p.gender as 'male' | 'female') || undefined,
      idNo: p.id_card,
      nation: p.ethnicity,
      phone: p.contact || undefined,
      school: p.school,
      server_id: p.id,
    }))
  }
}

/* ---- 初始化 ---- */
onMounted(async () => {
  try {
    // 1. 获取分类
    const catRes = await getCalligraphyCategories()
    if (catRes.data) {
      categoryOptions.value = catRes.data
    }

    // 2. 获取组别
    const groupRes = await getGroupCategories()
    if (groupRes.data) {
      groupOptions.value = groupRes.data
    }

    // 3. 尝试恢复草稿或获取指定ID的报名表
    const routeId = route.params.id
    const id = Array.isArray(routeId) ? routeId[0] : routeId

    // 获取列表
    const listRes = await getCalligraphySubmissionList()

    if (id) {
      // 从列表中查找指定ID
      if (listRes.data) {
        const existing = listRes.data.find((item) => item.id == Number(id))
        if (existing) {
          await fillFormData(existing)
        }
      }
    } else {
      // 没有ID，查找草稿
      if (listRes.data && listRes.data.length > 0) {
        // 查找最新且状态为 draft 的
        const drafts = listRes.data.filter((item) => item.status === 'draft')
        if (drafts.length > 0) {
          // 取最新的
          const latestData = drafts.reduce((prev, current) => {
            return prev.id > current.id ? prev : current
          })

          try {
            await ElMessageBox.confirm(
              '检测到您有未提交的草稿，是否恢复上次填写的内容？',
              '恢复草稿',
              {
                confirmButtonText: '恢复',
                cancelButtonText: '取消',
                type: 'info',
              },
            )
            await fillFormData(latestData)
            ElMessage.success('已恢复暂存信息')
          } catch {
            ElMessage.info('已取消恢复，您可以重新填写')
          }
        }
      }
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    // ElMessage.error('获取数据失败')
  }
})

/* ---- 行为：暂存 / 提交 ---- */
const saveForm = async () => {
  // 查找对应的 ID
  const selectedCategory = categoryOptions.value.find(
    (c) => c.code === baseForm.performanceType || c.name === baseForm.performanceType,
  )
  const selectedGroup = groupOptions.value.find(
    (g) => g.code === baseForm.group || g.name === baseForm.group,
  )

  // 1. 保存基本信息
  const payload = {
    id: submissionId.value || undefined,
    title: baseForm.artworkName,
    description: intro.value,
    height_cm: baseForm.artworkLength,
    width_cm: baseForm.artworkWidth,
    creation_time: baseForm.creationTime,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    has_read_terms: baseForm.notice,
    calligraphy_type_name: baseForm.performanceType,
    calligraphy_type_id: selectedCategory?.id,
    group_name: baseForm.group,
    group_id: selectedGroup?.id,
    instructor_name: baseForm.tutor,
  }

  const res = await saveCalligraphySubmission(payload)
  if (res.code !== 200 && res.code !== 201) {
    throw new Error(res.message || '保存失败')
  }

  const newId = res.data.id
  submissionId.value = newId

  // 2. 处理文件上传
  // 筛选出新上传的文件 (没有 url 属性或者 raw 属性存在的)
  const newFiles = fileList.value.filter((f) => f.raw)
  for (const f of newFiles) {
    await uploadCalligraphyFile(newId, f.raw)
  }

  // 3. 处理人员信息 (全量同步：先删除旧的，再添加新的)
  // 删除旧的
  if (existingParticipantIds.value.length > 0) {
    for (const pid of existingParticipantIds.value) {
      try {
        await deleteCalligraphyParticipant(pid)
      } catch (e) {
        console.warn('删除人员失败', pid, e)
      }
    }
    existingParticipantIds.value = []
  }

  // 添加新的
  const newParticipantIds: number[] = []
  for (const m of members.value) {
    if (!m.name) continue
    const pData = {
      name: m.name,
      gender: m.gender || 'male',
      id_card: m.idNo || '',
      ethnicity: m.nation || '',
      age: getAgeFromIdCard(m.idNo || ''),
      contact: m.phone || '',
      role: 'author',
      school: m.school,
    }
    const pRes = await addCalligraphyAuthor(newId, pData)
    if (pRes.data) {
      newParticipantIds.push(pRes.data.id)
    }
  }
  existingParticipantIds.value = newParticipantIds

  return newId
}

const onSave = async () => {
  try {
    await saveForm()
    ElMessage.success('暂存成功')
  } catch (error) {
    console.error('暂存失败:', error)
    ElMessage.error('暂存失败，请检查填写信息')
  }
}

const onSubmit = async () => {
  if (!baseForm.notice) {
    ElMessage.warning('请先阅读并同意报名须知')
    return
  }
  try {
    // 先保存所有信息
    const id = await saveForm()
    // 再提交
    await submitCalligraphySubmission(id)
    ElMessage.success('提交成功')
    // 可以在这里跳转或刷新状态
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  }
}

/* ---- 尺寸限制计算属性 ---- */
const sizeLimit = computed(() => {
  // 兼容 code 和 name 判断
  const type = baseForm.performanceType
  if (
    type === 'calligraphy' ||
    type === 'carving' ||
    type === '书法' ||
    type === '篆刻' ||
    type === 'seal_carving'
  ) {
    return {
      maxLength: 138,
      maxWidth: 69,
      description: '书法、篆刻作品尺寸不超过四尺宣纸（69cm×138cm）对开',
    }
  }
  return {
    maxLength: 0,
    maxWidth: 0,
    description: '',
  }
})

const lengthExceeded = computed(() => {
  if (sizeLimit.value.maxLength === 0) return false
  return baseForm.artworkLength !== null && baseForm.artworkLength > sizeLimit.value.maxLength
})

const widthExceeded = computed(() => {
  if (sizeLimit.value.maxWidth === 0) return false
  return baseForm.artworkWidth !== null && baseForm.artworkWidth > sizeLimit.value.maxWidth
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
            <span>书法、篆刻作品报名表</span>
          </div>
        </template>
        <!-- p标签可以换插值语法 -->
        <div class="intro-text">
          优艺术作品需为原创，并提交创作说明（包括作品主题和创作过程）。<br />
          书法、篆刻作品尺寸不超过四尺宣纸（69cm×138cm）。
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
                <el-input v-model="baseForm.artworkName" placeholder="例：《绘画作品》" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="作品类型" required>
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.code || item.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="创作时间" required>
                <el-date-picker
                  v-model="baseForm.creationTime"
                  type="date"
                  placeholder="选择创作时间"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 作品尺寸 -->
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item
                label="作品长度"
                required
                :error="lengthExceeded ? `长度不能超过${sizeLimit.maxLength}cm` : ''"
              >
                <div class="dimension">
                  <el-input
                    v-model.number="baseForm.artworkLength"
                    type="number"
                    min="0"
                    :max="sizeLimit.maxLength"
                    placeholder="请填写作品长边"
                    :class="{ 'input-error': lengthExceeded }"
                  />
                  <span class="unit">cm</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="作品宽度"
                required
                :error="widthExceeded ? `宽度不能超过${sizeLimit.maxWidth}cm` : ''"
              >
                <div class="dimension">
                  <el-input
                    v-model.number="baseForm.artworkWidth"
                    type="number"
                    min="0"
                    :max="sizeLimit.maxWidth"
                    placeholder="请填写作品宽边"
                    :class="{ 'input-error': widthExceeded }"
                  />
                  <span class="unit">cm</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <div class="size-limit-tip">
                <span>{{ sizeLimit.description }}</span>
              </div>
            </el-col>
          </el-row>
          <!-- 联系信息 -->
          <div class="contact-section">
            <h4 class="section-title">联系信息</h4>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="联系人姓名" required>
                  <el-input v-model="baseForm.contact" placeholder="请填写作品联系人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人电话" required>
                  <el-input v-model="baseForm.phone" placeholder="请填写作品联系人电话" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="联系地址" required>
                  <el-input v-model="baseForm.address" placeholder="请填写作品联系地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组别" required>
                  <el-select v-model="baseForm.group" placeholder="请选择" style="width: 100%">
                    <el-option
                      v-for="g in groupOptions"
                      :key="g.id"
                      :label="g.name"
                      :value="g.code || g.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="指导老师" required>
                  <el-input
                    v-model="baseForm.tutor"
                    placeholder="请填写作品指导老师姓名，仅限一人"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
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
      <!-- 3 作品简介 -->
      <el-card shadow="never" class="section-card sec-3">
        <template #header>
          <div class="card-title">
            <span>作品描述</span>
            <span class="desc-tip">（最多 200 字）</span>
          </div>
        </template>
        <el-row :gutter="24">
          <el-form-item
            prop="fileList"
            label="创作说明（包括作品主题和创作过程）"
            required
          ></el-form-item>
        </el-row>
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
      <!-- 4 花名册 -->
      <el-card shadow="never" class="section-card sec-4">
        <template #header
          ><div class="card-title"><span>参赛人员</span></div></template
        >
        <RosterBlock
          class="mt16"
          title="作者信息"
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
@use '@/assets/styles/user_styles/CalligraohyArtworkSubmissionForm.scss';
</style>

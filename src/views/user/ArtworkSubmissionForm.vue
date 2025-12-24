<script lang="ts" setup name="ArtworkSubmissionForm">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import { baseFormDefaults } from '@/config/forms/user/ArtworkSubmissionForm'
import { memberColumns } from '@/config/tables/user/ArtworkSubmissionForm'
import { useRoute } from 'vue-router'
import {
  saveArtworkSubmission,
  getArtworkSubmission,
  getArtworkSubmissionList,
  submitArtworkSubmission,
  uploadArtworkFile,
  addArtworkAuthor,
  deleteArtworkParticipant,
  getArtworkParticipants,
  getArtworkCategories,
  getGroupCategories,
} from '@/services/user/ArtworkSubmissionForm'
import type {
  ArtworkSubmission,
  ArtworkCategory,
  GroupCategory,
} from '@/services/user/ArtworkSubmissionForm'

// 定义类型接口
interface BaseForm {
  performanceType: string
  artworkName: string
  artworkLength: number | null
  artworkWidth: number | null
  creationTime: string
  contact: string
  phone: string
  address: string
  group: string
  tutor: string
  notice: boolean
}

interface FileItem {
  name: string
  size: number
  type?: string
  raw?: File
  uid?: number
  status?: string
}

interface RosterItem {
  id?: number
  name?: string
  gender?: 'male' | 'female'
  title?: string
  org?: string
  phone?: string
  id_card?: string
  nation?: string
  ethnicity?: string
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
  age?: number | string
  contact?: string
  grade?: string
  student_id?: string
  _seq?: number
}

defineProps<{ readonly?: boolean }>()

/* ---- 基础信息 ---- */
const baseForm = reactive<BaseForm>({
  ...baseFormDefaults,
})
const currentId = ref<string | number>('')
const route = useRoute()
const artworkTypeOptions = ref<ArtworkCategory[]>([])
const groupOptions = ref<GroupCategory[]>([])

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])

/* ---- 表数据 ---- */
const members = ref<RosterItem[]>([])

// 加载作品类型和组别
const loadOptions = async () => {
  try {
    const [typeRes, groupRes] = await Promise.all([getArtworkCategories(), getGroupCategories()])

    if (typeRes.code === 200 && Array.isArray(typeRes.data)) {
      artworkTypeOptions.value = typeRes.data
    } else {
      const nestedData = typeRes.data as { data?: ArtworkCategory[] } | null
      if (nestedData && Array.isArray(nestedData.data)) {
        artworkTypeOptions.value = nestedData.data
      }
    }

    if (groupRes.code === 200 && Array.isArray(groupRes.data)) {
      groupOptions.value = groupRes.data
    } else {
      const nestedData = groupRes.data as { data?: GroupCategory[] } | null
      if (nestedData && Array.isArray(nestedData.data)) {
        groupOptions.value = nestedData.data
      }
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 加载人员信息
const loadParticipants = async (id: number | string) => {
  try {
    const res = await getArtworkParticipants(id)
    if (res.code === 200 && Array.isArray(res.data)) {
      const data = res.data
      members.value = data.map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
        grade: p.grade,
        student_id: p.student_id,
        school: p.school,
      }))
    }
  } catch (error) {
    console.error('获取人员信息失败:', error)
  }
}

// 填充表单数据
const fillFormData = async (data: ArtworkSubmission) => {
  if (data.performance_form_id) {
    baseForm.performanceType = String(data.performance_form_id)
  } else {
    baseForm.performanceType = data.performance_form
  }

  baseForm.artworkName = data.title
  baseForm.artworkLength = data.artwork_length
  baseForm.artworkWidth = data.artwork_width
  baseForm.creationTime = data.creation_date
  baseForm.contact = data.contact_name
  baseForm.phone = data.contact_phone
  baseForm.address = data.contact_address
  // 优先使用 group_id
  if (data.group_id) {
    baseForm.group = String(data.group_id)
  } else {
    baseForm.group = String(data.group || '')
  }
  baseForm.tutor = data.tutor_name || ''
  baseForm.notice = data.has_read_terms
  intro.value = data.description

  if (data.image_file) {
    fileList.value = [
      {
        name: data.image_file.split('/').pop() || 'artwork.jpg',
        size: 0,
        type: 'image/jpeg',
      },
    ]
  }

  if (data.authors && Array.isArray(data.authors)) {
    members.value = data.authors.map((p) => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      id_card: p.id_card,
      ethnicity: p.ethnicity,
      age: p.age,
      contact: p.contact,
      grade: p.grade,
      student_id: p.student_id,
      school: p.school,
    }))
  } else {
    await loadParticipants(data.id)
  }
}

// 初始化表单
const initForm = async () => {
  const routeId = route.params.id
  const id = Array.isArray(routeId) ? routeId[0] : routeId

  if (id) {
    currentId.value = id
    try {
      const res = await getArtworkSubmission(id)
      if (res.code === 200 && res.data) {
        await fillFormData(res.data)
        ElMessage.success('获取报名信息成功')
      }
    } catch (error) {
      console.error('获取报名信息失败:', error)
      ElMessage.error('获取报名信息失败')
    }
  } else {
    try {
      const res = await getArtworkSubmissionList()
      if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
        const latestData = res.data.reduce((prev, current) => {
          return prev.id > current.id ? prev : current
        })

        if (latestData && latestData.status === 'draft') {
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
            const detailRes = await getArtworkSubmission(latestData.id)
            if (detailRes.code === 200 && detailRes.data) {
              await fillFormData(detailRes.data)
              currentId.value = latestData.id
              ElMessage.success('已恢复暂存信息')
            }
          } catch {
            ElMessage.info('已取消恢复，您可以重新填写')
          }
        }
      }
    } catch (error) {
      console.warn('尝试获取暂存信息失败:', error)
    }
  }
}

// 在初始化前加载分类和组别
loadOptions().then(() => {
  initForm()
})

/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  if (!baseForm.artworkName) {
    ElMessage.error('请输入作品名称以便暂存')
    return
  }

  // 尝试查找对应的名称或代码
  const selectedCategory = artworkTypeOptions.value.find(
    (item) => String(item.id) === String(baseForm.performanceType),
  )
  const performanceFormValue = selectedCategory
    ? selectedCategory.code || selectedCategory.name
    : baseForm.performanceType

  saveArtworkSubmission({
    id: currentId.value || undefined,
    title: baseForm.artworkName,
    description: intro.value,
    artwork_length: baseForm.artworkLength,
    artwork_width: baseForm.artworkWidth,
    creation_date: baseForm.creationTime || new Date().toISOString().split('T')[0] || '',
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    has_read_terms: baseForm.notice,
    performance_form: performanceFormValue,
    performance_form_id: baseForm.performanceType,
    group_id: baseForm.group,
    tutor_name: baseForm.tutor,
    image_file: null,
  })
    .then((res) => {
      if (res.code === 200 || res.code === 201) {
        currentId.value = res.data.id
        ElMessage.success('表单已暂存成功')
      } else {
        ElMessage.error(res.message || '暂存失败')
      }
    })
    .catch((error) => {
      console.error('暂存失败:', error)
      ElMessage.error('暂存失败，请重试')
    })
}

const onAddParticipant = async (index: number, row: RosterItem) => {
  // 必须先保存草稿获取ID
  const routeId = route.params.id
  let applicationId = currentId.value
  if (!applicationId && routeId) {
    applicationId = Array.isArray(routeId) ? routeId[0] || '' : routeId
  }

  if (!applicationId) {
    let listRes
    try {
      listRes = await getArtworkSubmissionList()
      if (listRes.code === 200 && Array.isArray(listRes.data) && listRes.data.length > 0) {
        const latestData = listRes.data.reduce((prev, current) => {
          return prev.id > current.id ? prev : current
        })
        if (latestData && latestData.status === 'draft') {
          applicationId = String(latestData.id)
        }
      }
    } catch (e) {
      console.warn('尝试获取最新草稿ID失败', e)
    }
  }

  if (!applicationId) {
    try {
      await ElMessageBox.confirm('添加人员信息需要先保存当前表单草稿，是否保存？', '提示', {
        confirmButtonText: '保存并继续',
        cancelButtonText: '取消',
        type: 'info',
      })

      const selectedCategory = artworkTypeOptions.value.find(
        (item) => String(item.id) === String(baseForm.performanceType),
      )
      const performanceFormValue = selectedCategory
        ? selectedCategory.code || selectedCategory.name
        : baseForm.performanceType

      const res = await saveArtworkSubmission({
        id: currentId.value || undefined,
        title: baseForm.artworkName,
        description: intro.value,
        artwork_length: baseForm.artworkLength,
        artwork_width: baseForm.artworkWidth,
        creation_date: baseForm.creationTime || new Date().toISOString().split('T')[0] || '',
        contact_name: baseForm.contact,
        contact_phone: baseForm.phone,
        contact_address: baseForm.address,
        has_read_terms: baseForm.notice,
        performance_form: performanceFormValue,
        performance_form_id: baseForm.performanceType,
        group_id: baseForm.group,
        tutor_name: baseForm.tutor,
        image_file: null,
      })

      if (res.code === 200 || res.code === 201) {
        applicationId = String(res.data.id)
        currentId.value = applicationId
        ElMessage.success('草稿保存成功，正在添加人员...')
      } else {
        ElMessage.error(res.message || '保存草稿失败')
        return
      }
    } catch {
      return
    }
  }

  if (!row || !row.name) {
    ElMessage.warning('请填写姓名')
    return
  }
  if (!row.id_card) {
    ElMessage.warning('请填写身份证号')
    return
  }

  const payload = {
    role: 'author',
    name: row.name,
    id_card: row.id_card,
    ethnicity: row.ethnicity || '',
    age: row.age ? Number(row.age) : 0,
    gender: (row.gender as 'male' | 'female') || 'female',
    contact: row.contact || row.phone || '',
    submission_id: Number(applicationId),
    grade: row.grade,
    student_id: row.student_id,
    school: row.school || '',
  }

  try {
    const res = await addArtworkAuthor(applicationId, payload)
    if (res.code === 200 || res.code === 201) {
      ElMessage.success('添加人员成功')
      const p = res.data
      const newItem: RosterItem = {
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
        grade: p.grade,
        student_id: p.student_id,
        school: p.school,
      }
      Object.assign(row, newItem)
    } else {
      ElMessage.error(res.message || '添加人员失败')
    }
  } catch (error) {
    console.error('添加人员接口调用失败:', error)
    ElMessage.error('添加人员失败，请重试')
  }
}

const onDeleteParticipant = async (row: RosterItem) => {
  if (!row.id) return
  try {
    const res = await deleteArtworkParticipant(row.id)
    if (res.code === 200 || res.code === 204) {
      ElMessage.success('删除人员成功')
    } else {
      ElMessage.error(res.message || '删除人员失败')
    }
  } catch (error) {
    console.error('删除人员失败:', error)
    ElMessage.error('删除人员失败，请重试')
  }
}

const onSubmit = () => {
  if (!baseForm.performanceType) {
    ElMessage.error('请选择作品类型')
    return
  }
  if (!baseForm.artworkName) {
    ElMessage.error('请输入作品名称')
    return
  }
  if (!baseForm.contact) {
    ElMessage.error('请输入联系人姓名')
    return
  }
  if (!baseForm.phone) {
    ElMessage.error('请输入联系电话')
    return
  }
  if (!baseForm.notice) {
    ElMessage.error('请阅读并同意报名须知')
    return
  }

  const selectedCategory = artworkTypeOptions.value.find(
    (item) => String(item.id) === String(baseForm.performanceType),
  )
  const performanceFormValue = selectedCategory
    ? selectedCategory.code || selectedCategory.name
    : baseForm.performanceType

  saveArtworkSubmission({
    id: currentId.value || undefined,
    title: baseForm.artworkName,
    description: intro.value,
    artwork_length: baseForm.artworkLength,
    artwork_width: baseForm.artworkWidth,
    creation_date: baseForm.creationTime || new Date().toISOString().split('T')[0] || '',
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    has_read_terms: baseForm.notice,
    performance_form: performanceFormValue,
    performance_form_id: baseForm.performanceType,
    group_id: baseForm.group,
    tutor_name: baseForm.tutor,
    image_file: null,
  })
    .then(async (res) => {
      if (res.code === 200 || res.code === 201) {
        const applicationId = res.data.id

        try {
          for (const file of fileList.value) {
            if (file.raw) {
              await uploadArtworkFile(applicationId, file.raw)
            }
          }

          // 提交前确保所有新加的人员都已保存（兜底逻辑）
          for (const p of members.value) {
            if (!p.id) {
              await addArtworkAuthor(applicationId, {
                role: 'author',
                name: p.name || '',
                id_card: p.id_card || '',
                ethnicity: p.ethnicity || '',
                age: Number(p.age) || 0,
                gender: (p.gender as 'male' | 'female') || 'female',
                contact: p.contact || '',
                grade: p.grade,
                student_id: p.student_id,
                school: p.school || '',
              })
            }
          }

          const submitRes = await submitArtworkSubmission(applicationId)
          if (submitRes.code === 200) {
            ElMessage.success('报名成功')
            const loading = ElLoading.service({
              lock: true,
              text: '提交成功，正在刷新页面...',
              background: 'rgba(0, 0, 0, 0.7)',
              // background: 'rgba(255, 255, 255, 0.7)', // Dark mode issues, using standard
            })
            setTimeout(() => {
              loading.close()
              window.location.reload()
            }, 1000)
          } else {
            ElMessage.error(submitRes.message || '提交失败')
          }
        } catch (error) {
          console.error('提交过程出错:', error)
          ElMessage.error('提交失败，请重试')
        }
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    })
    .catch((error) => {
      console.error('保存失败:', error)
      ElMessage.error('保存失败，请重试')
    })
}

/* ---- 尺寸限制计算属性 ---- */
const sizeLimit = computed(() => {
  const selectedCategory = artworkTypeOptions.value.find(
    (item) => String(item.id) === String(baseForm.performanceType),
  )

  const isPainting = selectedCategory
    ? selectedCategory.name === '国画' || selectedCategory.code === 'painting'
    : baseForm.performanceType === 'painting'

  if (isPainting) {
    return {
      maxLength: 138,
      maxWidth: 69,
      description: '国画尺寸不超过四尺宣纸（69cm×138cm）对开',
    }
  } else {
    return {
      maxLength: 60,
      maxWidth: 40,
      description: '其他画种尺寸不超过对开（40cm×60cm）',
    }
  }
})

const lengthExceeded = computed(() => {
  return baseForm.artworkLength !== null && baseForm.artworkLength > sizeLimit.value.maxLength
})

const widthExceeded = computed(() => {
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
            <span>绘画作品报名表</span>
          </div>
        </template>
        <!-- p标签可以换插值语法 -->
        <div class="intro-text">
          优艺术作品需为原创，并提交创作说明（包括作品主题和创作过程）。<br />
          国画、水彩水粉画（丙烯画）、版画、油画，或其他画种，尺寸：国画不超过四尺宣纸（69cm×138cm）对开，其他画种尺寸不超过对开（40cm×60cm）。
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
                    v-for="item in artworkTypeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="String(item.id)"
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
                      v-for="item in groupOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="String(item.id)"
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
          @delete="onDeleteParticipant"
          @add-participant="(e) => onAddParticipant(e.index, e.row)"
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
@use '@/assets/styles/user_styles/ArtworkSubmissionForm.scss';
</style>

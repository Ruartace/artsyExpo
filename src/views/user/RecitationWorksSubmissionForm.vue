<script lang="ts" setup name="RecitationWorksSubmissionForm">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import { baseFormDefaults } from '@/config/forms/user/RecitationWorksSubmissionForm'
import {
  memberColumns,
  teacherColumns,
  accompColumns,
  accompanimentColumns,
} from '@/config/tables/user/RecitationWorksSubmissionForm'
import { useRoute } from 'vue-router'
import {
  saveRecitationSubmission,
  getRecitationSubmission,
  getRecitationSubmissionList,
  submitRecitationSubmission,
  uploadRecitationFile,
  addRecitationParticipant,
  deleteRecitationParticipant,
  getRecitationCategories,
  getGroupCategories,
} from '@/services/user/RecitationWorksSubmissionForm'
import type {
  RecitationSubmission,
  RecitationCategory,
  GroupCategory,
  RecitationParticipant,
} from '@/services/user/RecitationWorksSubmissionForm'

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
  idNo?: string
  nation?: string
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
// const emit = defineEmits<{ (e: 'submit', payload: SubmitPayload): void }>()

/* ---- 基础信息 ---- */
const baseForm = reactive<BaseForm>({
  ...baseFormDefaults,
})
const currentId = ref<string | number>('')
const route = useRoute()
const performanceTypeOptions = ref<RecitationCategory[]>([])
const groupOptions = ref<GroupCategory[]>([])

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])
const scriptFileList = ref<FileItem[]>([]) // 新增：朗诵文稿列表

/* ---- 表数据 ---- */
const teachers = ref<RosterItem[]>([])
const members = ref<RosterItem[]>([])
const accomp = ref<RosterItem[]>([])
const accompaniment = ref<RosterItem[]>([])

// 加载作品类型和组别
const loadOptions = async () => {
  try {
    const [typeRes, groupRes] = await Promise.all([getRecitationCategories(), getGroupCategories()])

    if (typeRes.code === 200 && Array.isArray(typeRes.data)) {
      performanceTypeOptions.value = typeRes.data
    } else {
      const nestedData = typeRes.data as { data?: RecitationCategory[] } | null
      if (nestedData && Array.isArray(nestedData.data)) {
        performanceTypeOptions.value = nestedData.data
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

// 填充表单数据
const fillFormData = async (data: RecitationSubmission) => {
  if (data.performance_form_id) {
    baseForm.performanceType = String(data.performance_form_id)
  } else if (data.performance_type_id) {
    baseForm.performanceType = String(data.performance_type_id)
  } else {
    // 尝试匹配 name
    const typeName = data.performance_form_name || data.performance_type
    const matched = performanceTypeOptions.value.find(
      (opt) => opt.name === typeName || opt.code === typeName,
    )
    if (matched) {
      baseForm.performanceType = String(matched.id)
    } else if (typeName) {
      baseForm.performanceType = typeName
    }
  }

  baseForm.artworkName = data.title
  if (data.duration_minutes !== undefined && data.duration_seconds !== undefined) {
    baseForm.minutes = data.duration_minutes
    baseForm.seconds = data.duration_seconds
  } else if (data.duration) {
    baseForm.minutes = Math.floor(data.duration / 60)
    baseForm.seconds = data.duration % 60
  }

  baseForm.performerCount = data.performer_count
  baseForm.creationTime = data.created_at
  baseForm.contact = data.contact_name
  baseForm.phone = data.contact_phone
  baseForm.address = data.contact_address
  baseForm.song1IsOriginal = data.is_original

  // 优先使用 group_id
  if (data.group_id) {
    baseForm.group = String(data.group_id)
  } else {
    baseForm.group = String(data.group || '')
  }

  baseForm.notice = data.has_read_terms
  intro.value = data.description

  // 处理文件回显 - 这里假设后端返回 image_file 或 video_file
  // 注意：RecitationSubmission 定义中有 image_file 和 video_file
  // 暂时只处理一个，或者根据文件名后缀分
  const files: FileItem[] = []
  if (data.image_file) {
    files.push({
      name: data.image_file.split('/').pop() || 'artwork.file',
      size: 0,
      type: 'image/jpeg', // 假定
    })
  }
  if (data.video_file) {
    files.push({
      name: data.video_file.split('/').pop() || 'video.file',
      size: 0,
      type: 'video/mp4', // 假定
    })
  }
  // 简单分配：如果是PDF放到 scriptFileList，其他放到 fileList？
  // 或者全部放到 fileList，因为后端可能只返回了一个字段
  // 鉴于目前逻辑复杂且信息不足，暂且将所有文件放入 fileList
  fileList.value = files

  // 处理人员信息
  let allParticipants: RecitationParticipant[] = []
  if (data.teachers && Array.isArray(data.teachers)) {
    allParticipants = allParticipants.concat(data.teachers)
  }
  if (data.students && Array.isArray(data.students)) {
    allParticipants = allParticipants.concat(data.students)
  }
  if (data.participants && Array.isArray(data.participants)) {
    allParticipants = allParticipants.concat(data.participants)
  }

  if (allParticipants.length > 0) {
    teachers.value = allParticipants
      .filter((p) => p.role === 'teacher')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        idNo: p.id_card,
        nation: p.ethnicity,
        phone: p.contact || p.phone,
        title: p.title,
        org: p.org || p.school,
        contact: p.contact || p.phone,
      }))

    members.value = allParticipants
      .filter((p) => p.role === 'student')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        idNo: p.id_card,
        nation: p.ethnicity,
        major: p.major,
        region: p.region,
        school: p.school,
        dept: p.dept,
        instrument: p.instrument,
        contact: p.contact || p.phone,
      }))

    accomp.value = allParticipants
      .filter(
        (p) =>
          p.role === 'student_accompanist' ||
          (p.role === 'accompanist' && !p.name.includes('老师')),
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        idNo: p.id_card,
        nation: p.ethnicity,
        major: p.major,
        region: p.region,
        school: p.school,
        dept: p.dept,
        instrument: p.instrument,
        contact: p.contact || p.phone,
      }))

    accompaniment.value = allParticipants
      .filter(
        (p) =>
          p.role === 'teacher_accompanist' || (p.role === 'accompanist' && p.name.includes('老师')),
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        idNo: p.id_card,
        nation: p.ethnicity,
        phone: p.contact || p.phone,
        title: p.title,
        org: p.org || p.school,
        contact: p.contact || p.phone,
      }))
  } else {
    teachers.value = []
    members.value = []
    accomp.value = []
    accompaniment.value = []
  }
}

// 初始化表单
const initForm = async () => {
  const routeId = route.params.id
  const id = Array.isArray(routeId) ? routeId[0] : routeId

  if (id) {
    currentId.value = id
    try {
      const res = await getRecitationSubmission(id)
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
      const res = await getRecitationSubmissionList()
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
            const detailRes = await getRecitationSubmission(latestData.id)
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

  const selectedCategory = performanceTypeOptions.value.find(
    (item) => String(item.id) === String(baseForm.performanceType),
  )
  // 如果没有匹配到（比如是手动输入的或者其他），尝试直接用 value
  const performanceFormValue = selectedCategory
    ? selectedCategory.code || selectedCategory.name
    : baseForm.performanceType

  const duration = (baseForm.minutes || 0) * 60 + (baseForm.seconds || 0)

  saveRecitationSubmission({
    id: currentId.value || undefined,
    title: baseForm.artworkName,
    description: intro.value,
    duration: duration,
    performance_type: performanceFormValue,
    performance_type_id: baseForm.performanceType,
    performance_form_id: baseForm.performanceType,
    group: baseForm.group,
    group_id: baseForm.group,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    has_read_terms: baseForm.notice,
    performer_count: baseForm.performerCount || 0,
    is_original: baseForm.song1IsOriginal,
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

const onAddParticipant = async (
  role: 'teacher' | 'student' | 'student_accompanist' | 'teacher_accompanist',
  index: number,
  row: RosterItem,
) => {
  // 必须先保存草稿获取ID
  const routeId = route.params.id
  let applicationId = currentId.value
  if (!applicationId && routeId) {
    applicationId = Array.isArray(routeId) ? routeId[0] || '' : routeId
  }

  if (!applicationId) {
    // 尝试获取最新草稿
    let listRes
    try {
      listRes = await getRecitationSubmissionList()
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

      const selectedCategory = performanceTypeOptions.value.find(
        (item) => String(item.id) === String(baseForm.performanceType),
      )
      const performanceFormValue = selectedCategory
        ? selectedCategory.code || selectedCategory.name
        : baseForm.performanceType

      const duration = (baseForm.minutes || 0) * 60 + (baseForm.seconds || 0)

      const res = await saveRecitationSubmission({
        id: currentId.value || undefined,
        title: baseForm.artworkName,
        description: intro.value,
        duration: duration,
        performance_type: performanceFormValue,
        performance_type_id: baseForm.performanceType,
        performance_form_id: baseForm.performanceType,
        group: baseForm.group,
        group_id: baseForm.group,
        contact_name: baseForm.contact,
        contact_phone: baseForm.phone,
        contact_address: baseForm.address,
        has_read_terms: baseForm.notice,
        performer_count: baseForm.performerCount || 0,
        is_original: baseForm.song1IsOriginal,
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
  if (!row.idNo) {
    ElMessage.warning('请填写身份证号')
    return
  }

  const payload = {
    role: role,
    name: row.name,
    gender: (row.gender as 'male' | 'female') || 'female',
    id_card: row.idNo,
    ethnicity: row.nation || '',
    phone: row.phone || row.contact || '',
    major: row.major || '',
    region: row.region || '',
    school: row.school || '',
    dept: row.dept || '',
    instrument: row.instrument || '',
    title: row.title || '',
    org: row.org || '',
  }

  try {
    const res = await addRecitationParticipant(applicationId, payload)
    if (res.code === 200 || res.code === 201) {
      ElMessage.success('添加人员成功')
      const p = res.data
      const newItem: RosterItem = {
        id: p.id,
        name: p.name,
        gender: p.gender,
        idNo: p.id_card,
        nation: p.ethnicity,
        phone: p.phone,
        major: p.major,
        region: p.region,
        school: p.school,
        dept: p.dept,
        instrument: p.instrument,
        title: p.title,
        org: p.org,
        contact: p.phone,
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
    const res = await deleteRecitationParticipant(row.id)
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

  const selectedCategory = performanceTypeOptions.value.find(
    (item) => String(item.id) === String(baseForm.performanceType),
  )
  const performanceFormValue = selectedCategory
    ? selectedCategory.code || selectedCategory.name
    : baseForm.performanceType

  const duration = (baseForm.minutes || 0) * 60 + (baseForm.seconds || 0)

  saveRecitationSubmission({
    id: currentId.value || undefined,
    title: baseForm.artworkName,
    description: intro.value,
    duration: duration,
    performance_type: performanceFormValue,
    performance_type_id: baseForm.performanceType,
    performance_form_id: baseForm.performanceType,
    group: baseForm.group,
    group_id: baseForm.group,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    has_read_terms: baseForm.notice,
    performer_count: baseForm.performerCount || 0,
    is_original: baseForm.song1IsOriginal,
    image_file: null,
  })
    .then(async (res) => {
      if (res.code === 200 || res.code === 201) {
        const applicationId = res.data.id

        try {
          // 上传作品文件
          for (const file of fileList.value) {
            if (file.raw) {
              await uploadRecitationFile(applicationId, file.raw)
            }
          }
          // 上传文稿文件
          for (const file of scriptFileList.value) {
            if (file.raw) {
              // 暂时使用同一个接口上传，后端可能通过文件类型判断或统一处理
              await uploadRecitationFile(applicationId, file.raw)
            }
          }

          // 提交前确保所有新加的人员都已保存
          // Teachers
          for (const p of teachers.value) {
            if (!p.id) {
              await addRecitationParticipant(applicationId, {
                role: 'teacher',
                name: p.name || '',
                gender: (p.gender as 'male' | 'female') || 'female',
                id_card: p.idNo || '',
                ethnicity: p.nation || '',
                phone: p.phone || p.contact || '',
                title: p.title || '',
                org: p.org || '',
              })
            }
          }
          // Members
          for (const p of members.value) {
            if (!p.id) {
              await addRecitationParticipant(applicationId, {
                role: 'student',
                name: p.name || '',
                gender: (p.gender as 'male' | 'female') || 'female',
                id_card: p.idNo || '',
                ethnicity: p.nation || '',
                major: p.major || '',
                region: p.region || '',
                school: p.school || '',
                dept: p.dept || '',
                instrument: p.instrument || '',
              })
            }
          }
          // Accomp
          for (const p of accomp.value) {
            if (!p.id) {
              await addRecitationParticipant(applicationId, {
                role: 'student_accompanist',
                name: p.name || '',
                gender: (p.gender as 'male' | 'female') || 'female',
                id_card: p.idNo || '',
                ethnicity: p.nation || '',
                major: p.major || '',
                region: p.region || '',
                school: p.school || '',
                dept: p.dept || '',
                instrument: p.instrument || '',
              })
            }
          }
          // Teacher Accomp
          for (const p of accompaniment.value) {
            if (!p.id) {
              await addRecitationParticipant(applicationId, {
                role: 'teacher_accompanist',
                name: p.name || '',
                gender: (p.gender as 'male' | 'female') || 'female',
                id_card: p.idNo || '',
                ethnicity: p.nation || '',
                phone: p.phone || p.contact || '',
                title: p.title || '',
                org: p.org || '',
              })
            }
          }

          const submitRes = await submitRecitationSubmission(applicationId)
          if (submitRes.code === 200) {
            ElMessage.success('报名成功')
            const loading = ElLoading.service({
              lock: true,
              text: '提交成功，正在刷新页面...',
              background: 'rgba(0, 0, 0, 0.7)',
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

/* ---- 人数限制计算属性 ---- */
const performerLimit = computed(() => {
  // 朗诵作品统一限制为8人（含伴奏）
  return {
    maxCount: 8,
    description:
      '作品文体不限，须使用普通话，人数不超过8人（含伴奏，学生不进行道具设置，不得伴舞），演出时间不超过5分钟',
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
            <span>朗诵作品报名表</span>
          </div>
        </template>
        <!-- p标签可以换插值语法 -->
        <div class="intro-text">
          作品文体不限，须使用普通话，人数不超过 8
          人（含伴奏，学生不进行道具设置，不得伴舞），演出时间不超过 5
          分钟，需提交朗诵文稿的电子版。
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
                <el-input v-model="baseForm.artworkName" placeholder="例：《朗诵作品》" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="表演形式" required>
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in performanceTypeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="String(item.id)"
                  />
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
      <!-- 2 上传文件稿 -->
      <el-card required shadow="never" class="section-card sec-2">
        <el-form-item prop="scriptFileList" required label="上传朗诵文稿">
          <el-upload
            v-model:file-list="scriptFileList"
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
                请上传作品朗诵文稿，作品的朗诵文稿要求；PDF格式，文件大小不宜超过20MB。
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
          @delete="onDeleteParticipant"
          @add-participant="(e) => onAddParticipant('teacher', e.index, e.row)"
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
          @delete="onDeleteParticipant"
          @add-participant="(e) => onAddParticipant('student', e.index, e.row)"
        />
        <RosterBlock
          class="mt16"
          title="学生伴奏"
          :columns="accompColumns"
          v-model:rows="accomp"
          :readonly="readonly"
          @delete="onDeleteParticipant"
          @add-participant="(e) => onAddParticipant('student_accompanist', e.index, e.row)"
        />
        <RosterBlock
          class="mt16"
          title="老师伴奏"
          :columns="accompanimentColumns"
          v-model:rows="accompaniment"
          :readonly="readonly"
          @delete="onDeleteParticipant"
          @add-participant="(e) => onAddParticipant('teacher_accompanist', e.index, e.row)"
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
@use '@/assets/styles/user_styles/RecitationWorksSubmissionForm.scss';
</style>

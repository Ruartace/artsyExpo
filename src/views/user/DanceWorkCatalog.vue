<script lang="ts" setup name="DanceWorkCatalog">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import RosterBlock from '@/components/RosterBlock.vue'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
import {
  saveDanceWork,
  getDanceWork,
  getDanceWorkList,
  getDanceParticipants,
  submitDanceWork,
  uploadDanceWorkFile,
  addDanceParticipant,
  addDanceTeacher,
  addDanceStudent,
  deleteDanceParticipant,
  getDancePerformanceCategories,
  getGroupCategories,
  getDanceTeacherTemplate,
} from '@/services/user/DanceWorkCatalog'
import type { DanceWork, GroupCategory } from '@/services/user/DanceWorkCatalog'
import { useRoute } from 'vue-router'
import type { Column } from '@/types/roster'

// 定义类型接口
interface BaseForm {
  performanceType: string | number
  minutes: number
  seconds: number
  title: string
  isOriginal: boolean
  contact: string
  phone: string
  address: string
  group: string | number
  notice: boolean
  groupCount?: number
}

const baseFormDefaults: BaseForm = {
  performanceType: 'group',
  minutes: 0,
  seconds: 0,
  title: '',
  isOriginal: false,
  contact: '',
  phone: '',
  address: '',
  group: '',
  notice: false,
  groupCount: undefined,
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
  // 为了兼容 RosterBlock 的显示
  _seq?: number
}

interface SubmitPayload {
  base: BaseForm & { durationSec: number }
  intro: string
  files: FileItem[]
  rosters: {
    teachers: RosterItem[]
    members: RosterItem[]
  }
}

// 表格列配置
const teacherColumns: Column[] = [
  { label: '姓名', prop: 'name', minWidth: '100', maxLength: 20 },
  {
    label: '性别',
    prop: 'gender',
    width: '80',
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { label: '身份证号', prop: 'id_card', minWidth: '180', maxLength: 18 },
  { label: '联系电话', prop: 'contact', minWidth: '120', maxLength: 15 },
  { label: '单位', prop: 'org', minWidth: '150', maxLength: 50 },
  { label: '职务', prop: 'title', minWidth: '100', maxLength: 20 },
]

const memberColumns: Column[] = [
  { label: '姓名', prop: 'name', minWidth: '100', maxLength: 20 },
  {
    label: '性别',
    prop: 'gender',
    width: '80',
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { label: '身份证号', prop: 'id_card', minWidth: '180', maxLength: 18 },
  { label: '民族', prop: 'ethnicity', width: '100', maxLength: 10 },
  { label: '年龄', prop: 'age', width: '80', type: 'number', min: 1, max: 100 },
  { label: '学籍号', prop: 'student_id', minWidth: '150', maxLength: 30 },
  { label: '年级', prop: 'grade', width: '100', maxLength: 10 },
  { label: '联系电话', prop: 'contact', minWidth: '120', maxLength: 15 },
]

defineProps<{ readonly?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: SubmitPayload): void }>()

/* ---- 基础信息 ---- */
const baseForm = reactive<BaseForm>({
  ...baseFormDefaults,
})
const currentId = ref<string | number>('')
const route = useRoute()
const groupOptions = ref<GroupCategory[]>([])
const performanceTypeOptions = ref<GroupCategory[]>([])

// 预加载表演形式分类和组别分类
const loadCategories = async () => {
  const [groupRes, typeRes] = await Promise.all([
    getGroupCategories(),
    getDancePerformanceCategories(),
  ])

  if (groupRes.code === 200 && Array.isArray(groupRes.data)) {
    groupOptions.value = groupRes.data
  } else {
    // 尝试处理嵌套数据结构: { code: 200, data: { status: 'success', data: [...], ... } }
    const nestedData = groupRes.data as { data?: GroupCategory[] } | null
    if (nestedData && Array.isArray(nestedData.data)) {
      groupOptions.value = nestedData.data
    } else {
      console.warn('获取组别接口返回异常:', groupRes)
      ElMessage.warning('获取组别失败，请刷新重试')
    }
  }

  if (typeRes.code === 200 && Array.isArray(typeRes.data)) {
    performanceTypeOptions.value = typeRes.data
  } else {
    // 尝试处理嵌套数据结构
    const nestedData = typeRes.data as { data?: GroupCategory[] } | null
    if (nestedData && Array.isArray(nestedData.data)) {
      performanceTypeOptions.value = nestedData.data
    } else {
      console.warn('获取作品类型接口返回异常:', typeRes)
      ElMessage.warning('获取表演形式失败，请刷新重试')
    }
  }
}

/* ---- 简介 ---- */
const intro = ref('')

/* ---- 上传 ---- */
const accepts = '.mp3,.wav,.pdf,.jpg,.jpeg,.png'
const fileList = ref<FileItem[]>([])
const scoreFiles = ref<FileItem[]>([])

/* ---- 三个表数据 ---- */
const teachers = ref<RosterItem[]>([])
const members = ref<RosterItem[]>([])

// 加载人员信息
const loadParticipants = async (id: number | string) => {
  try {
    const res = await getDanceParticipants(id)
    if (res.code === 200 && Array.isArray(res.data)) {
      const data = res.data

      teachers.value = data
        .filter((p) => p.role === 'teacher')
        .map((p) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          id_card: p.id_card,
          ethnicity: p.ethnicity,
          age: p.age,
          contact: p.contact,
        }))

      members.value = data
        .filter((p) => p.role === 'student')
        .map((p) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          id_card: p.id_card,
          ethnicity: p.ethnicity,
          age: p.age,
          contact: p.contact,
          grade: p.grade,
          student_id: p.student_id,
        }))
    }
  } catch (error) {
    console.error('获取人员信息失败:', error)
  }
}

// 填充表单数据
const fillFormData = async (data: DanceWork) => {
  // 映射表演形式
  if (data.performance_form_id) {
    baseForm.performanceType = String(data.performance_form_id)
  } else if (data.performance_form_name === '群舞' || data.performance_form === 'group') {
    baseForm.performanceType = 'group'
  } else {
    baseForm.performanceType = data.performance_form || 'group'
  }

  // 映射组别
  if (data.group_id) {
    baseForm.group = String(data.group_id)
  } else if (data.group) {
    baseForm.group = data.group
  } else {
    baseForm.group = ''
  }

  baseForm.minutes = data.duration_minutes
  baseForm.seconds = data.duration_seconds
  baseForm.title = data.title
  baseForm.isOriginal = data.is_original
  baseForm.contact = data.contact_name
  baseForm.phone = data.contact_phone
  baseForm.address = data.contact_address
  baseForm.notice = data.has_read_terms
  baseForm.groupCount = data.performer_count

  intro.value = data.description

  // 文件回填
  if (data.score_file) {
    scoreFiles.value = [
      {
        name: data.score_file.split('/').pop() || 'score.pdf',
        size: 0,
        type: 'application/pdf',
      },
    ]
  }
  if (data.video_file) {
    fileList.value = [
      {
        name: data.video_file.split('/').pop() || 'work.mp4',
        size: 0,
        type: 'video/mp4',
      },
    ]
  }

  // 加载人员信息
  // 优先使用后端返回的 teachers 和 students
  if (data.teachers || data.students) {
    if (data.teachers && Array.isArray(data.teachers)) {
      teachers.value = data.teachers.map((p) => ({
        id: p.id,
        name: p.name,
        gender:
          (p.gender as string) === '男'
            ? 'male'
            : (p.gender as string) === '女'
              ? 'female'
              : (p.gender as 'male' | 'female'),
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
        org: p.school || p.contact,
      }))
    }

    if (data.students && Array.isArray(data.students)) {
      members.value = data.students.map((p) => ({
        id: p.id,
        name: p.name,
        gender:
          (p.gender as string) === '男'
            ? 'male'
            : (p.gender as string) === '女'
              ? 'female'
              : (p.gender as 'male' | 'female'),
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
        grade: p.grade,
        student_id: p.student_id,
      }))
    }
  } else if (data.participants && Array.isArray(data.participants)) {
    // 兼容旧结构
    const pList = data.participants
    teachers.value = pList
      .filter((p) => p.role === 'teacher')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
      }))

    members.value = pList
      .filter((p) => p.role === 'student')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
        grade: p.grade,
        student_id: p.student_id,
      }))
  } else {
    await loadParticipants(data.id)
  }
}

// 如果是编辑模式（有ID），则加载数据；否则尝试加载最近的暂存数据
const initForm = async () => {
  const routeId = route.params.id
  const id = Array.isArray(routeId) ? routeId[0] : routeId

  if (id) {
    // 编辑模式：根据ID获取
    currentId.value = id
    try {
      const res = await getDanceWork(id)
      if (res.code === 200 && res.data) {
        await fillFormData(res.data)
        ElMessage.success('获取报名信息成功')
      }
    } catch (error) {
      console.error('获取报名信息失败:', error)
      ElMessage.error('获取报名信息失败')
    }
  } else {
    // 新增模式：尝试获取最近的暂存数据
    try {
      const res = await getDanceWorkList()
      if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
        // 获取ID最大的数据（即最新的数据）
        const latestData = res.data.reduce((prev, current) => {
          return prev.id > current.id ? prev : current
        })

        // 判断状态是否为 draft
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
            // 用户点击确认，获取详细数据并填充
            const detailRes = await getDanceWork(latestData.id)
            if (detailRes.code === 200 && detailRes.data) {
              await fillFormData(detailRes.data)
              currentId.value = latestData.id
              ElMessage.success('已恢复暂存信息')
            } else {
              ElMessage.error(detailRes.message || '获取草稿详情失败')
            }
          } catch {
            ElMessage.info('已取消恢复，您可以重新填写')
          }
        }
      }
    } catch (error) {
      // 获取列表失败不提示错误，仅在控制台记录，因为这只是一个辅助功能
      console.warn('尝试获取暂存信息失败:', error)
    }
  }
}

// 在加载完分类后初始化表单
loadCategories().then(() => {
  initForm()
})

const downloadTemplate = async () => {
  try {
    const res = await getDanceTeacherTemplate()
    if (res) {
      const blob = new Blob([res as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = '指导教师导入模板.xlsx'
      link.click()
      window.URL.revokeObjectURL(link.href)
      ElMessage.success('模板下载成功')
    } else {
      ElMessage.error('模板下载失败')
    }
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败，请重试')
  }
}

const onAddParticipant = async (
  role: 'teacher' | 'student' | 'conductor' | 'accompanist',
  index: number,
  row?: RosterItem,
) => {
  // 如果是新增模式（没有ID），无法立即添加人员到数据库
  // 必须先保存草稿获取ID
  const routeId = route.params.id
  let applicationId = currentId.value
  // 若存在路由参数ID则优先使用
  if (!applicationId && routeId) {
    applicationId = Array.isArray(routeId) ? routeId[0] || '' : routeId
  }

  if (!applicationId) {
    let listRes
    try {
      listRes = await getDanceWorkList()
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

      // 调用保存逻辑
      const res = await saveDanceWork({
        id: currentId.value || undefined,
        title: baseForm.title,
        description: intro.value,
        duration_minutes: baseForm.minutes,
        duration_seconds: baseForm.seconds,
        contact_name: baseForm.contact,
        contact_phone: baseForm.phone,
        contact_address: baseForm.address,
        performer_count: baseForm.groupCount || 0,
        has_read_terms: baseForm.notice,
        performance_form_id: baseForm.performanceType,
        group_id: baseForm.group,
        is_original: baseForm.isOriginal,
        video_file: null,
        score_file: null,
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

  // 1. 前端校验：检查必填项
  if (!row || !row.name) {
    ElMessage.warning('请填写姓名')
    return
  }
  if (!row.id_card) {
    ElMessage.warning('请填写身份证号')
    return
  }
  if (!row.contact && !row.phone) {
    // 兼容 contact 或 phone 字段
    if (!row.contact && row.phone) row.contact = row.phone
    if (!row.contact) {
      ElMessage.warning('请填写联系方式')
      return
    }
  }
  if (role === 'student' && !row.student_id) {
    ElMessage.warning('请填写学籍号')
    return
  }

  // 2. 构造数据
  const payload = {
    role: role,
    name: row?.name,
    id_card: row?.id_card,
    ethnicity: row?.ethnicity || '',
    age: row?.age ? Number(row.age) : 0,
    gender: (row?.gender as 'male' | 'female') || 'female',
    contact: row?.contact || row?.phone || '',
    submission_id: Number(applicationId),
    grade: role === 'student' ? row?.grade : undefined,
    student_id: role === 'student' ? row?.student_id : undefined,
  }

  try {
    const res = await addDanceParticipant(payload)
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
      }

      if (row) {
        Object.assign(row, newItem)
      } else {
        if (role === 'teacher') {
          teachers.value.push(newItem)
        } else if (role === 'student') {
          members.value.push(newItem)
        }
      }
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
    const res = await deleteDanceParticipant(row.id)
    if (res.code === 200 || res.code === 204) {
      ElMessage.success('删除人员成功')
    } else {
      ElMessage.error(res.message || '删除人员失败')
      const routeId = route.params.id
      const id = Array.isArray(routeId) ? routeId[0] : routeId
      if (id) {
        await loadParticipants(id)
      }
    }
  } catch (error) {
    console.error('删除人员失败:', error)
    ElMessage.error('删除人员失败，请重试')
    const routeId = route.params.id
    const id = Array.isArray(routeId) ? routeId[0] : routeId
    if (id) {
      await loadParticipants(id)
    }
  }
}

/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  if (!baseForm.title) {
    ElMessage.error('请输入表演名称以便暂存')
    return
  }

  saveDanceWork({
    title: baseForm.title,
    description: intro.value,
    duration_minutes: baseForm.minutes,
    duration_seconds: baseForm.seconds,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    performer_count: baseForm.groupCount || 0,
    has_read_terms: baseForm.notice,
    performance_form_id: baseForm.performanceType,
    group_id: baseForm.group,
    is_original: baseForm.isOriginal,
    video_file: null,
    score_file: null,
  })
    .then((res) => {
      if (res.code === 200 || res.code === 201) {
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
const onSubmit = () => {
  if (!baseForm.performanceType) {
    ElMessage.error('请选择表演形式')
    return
  }

  const durationSec = (baseForm.minutes || 0) * 60 + (baseForm.seconds || 0)

  // 校验群舞人数
  if (baseForm.performanceType === 'group') {
    if (!baseForm.groupCount) {
      ElMessage.error('请填写表演人数')
      return
    }
    if (baseForm.groupCount > performerLimit.value.maxCount) {
      ElMessage.error(`群舞人数不能超过${performerLimit.value.maxCount}人`)
      return
    }
    // 校验实际名单人数是否一致
    if (members.value.length !== baseForm.groupCount) {
      ElMessage.error(
        `参赛学生名单人数(${members.value.length}人)与填写的表演人数(${baseForm.groupCount}人)不一致`,
      )
      return
    }
    // 校验时长
    const maxDurationSec = performerLimit.value.maxDuration * 60
    if (durationSec > maxDurationSec) {
      ElMessage.error(`演出时间不能超过${performerLimit.value.maxDuration}分钟`)
      return
    }
  }

  // 校验指导教师人数
  if (teachers.value.length > 3) {
    ElMessage.error('指导教师人数不得超过3人')
    return
  }

  // 校验必填项
  if (!baseForm.title) {
    ElMessage.error('请输入表演名称')
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

  const payload: SubmitPayload = {
    base: { ...baseForm, durationSec },
    intro: intro.value,
    files: fileList.value.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    rosters: { teachers: teachers.value, members: members.value },
  }
  emit('submit', payload)

  // 保存并提交
  saveDanceWork({
    id: currentId.value || undefined,
    title: baseForm.title,
    description: intro.value,
    duration_minutes: baseForm.minutes,
    duration_seconds: baseForm.seconds,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    performer_count: baseForm.groupCount || 0,
    has_read_terms: baseForm.notice,
    performance_form_id: baseForm.performanceType,
    group_id: baseForm.group,
    is_original: baseForm.isOriginal,
    video_file: null,
    score_file: null,
  })
    .then(async (res) => {
      if (res.code === 200 || res.code === 201) {
        const applicationId = res.data.id

        try {
          // 上传文件
          for (const file of fileList.value) {
            if (file.raw) {
              await uploadDanceWorkFile(applicationId, 'video', file.raw)
            }
          }
          for (const file of scoreFiles.value) {
            if (file.raw) {
              await uploadDanceWorkFile(applicationId, 'score', file.raw)
            }
          }

          // 添加人员
          const participants = [
            ...teachers.value.map((p) => ({ ...p, role: 'teacher' as const })),
            ...members.value.map((p) => ({ ...p, role: 'student' as const })),
          ]

          // 这里其实不应该再调添加人员接口，因为RosterBlock的操作已经实时同步到后端了
          // 但是如果是新创建的表单（没有ID），之前无法同步。
          // 逻辑是：如果RosterBlock的row没有ID，说明是新加的（但RosterBlock的add是实时的？）
          // 之前的 onAddParticipant 逻辑是：如果没ID，先保存草稿，然后添加。
          // 所以 teachers.value 里的数据应该都有 ID 了。
          // 除非用户手动改了 teachers.value 而没走 onAddParticipant。
          // 暂时保留这个逻辑作为兜底，但要注意不要重复添加。
          // 检查 p.id 是否存在。
          for (const p of participants) {
            if (!p.id) {
              if (p.role === 'teacher') {
                await addDanceTeacher(applicationId, {
                  role: 'teacher',
                  name: p.name || '',
                  id_card: p.id_card || '',
                  ethnicity: p.ethnicity || '',
                  age: Number(p.age) || 0,
                  gender: p.gender || 'male',
                  contact: p.contact || '',
                  school: p.org || '',
                })
              } else {
                await addDanceStudent(applicationId, {
                  role: 'student',
                  name: p.name || '',
                  id_card: p.id_card || '',
                  ethnicity: p.ethnicity || '',
                  age: Number(p.age) || 0,
                  gender: p.gender || 'male',
                  contact: p.contact || '',
                  grade: p.grade,
                  student_id: p.student_id,
                  school: p.school || '',
                })
              }
            }
          }
        } catch (error) {
          console.error('文件上传或人员添加失败:', error)
          ElMessage.error('信息保存失败，请重试')
          return
        }

        try {
          const submitRes = await submitDanceWork(applicationId)
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
          console.error('提交接口调用失败:', error)
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

/* ---- 限制计算属性 ---- */
const performerLimit = computed(() => {
  if (baseForm.performanceType === 'group') {
    return {
      maxCount: 36,
      maxDuration: 7, // minutes
      description: '群舞：人数不超过36人，演出时间不超过7分钟。',
    }
  }
  return {
    maxCount: 36,
    maxDuration: 7,
    description: '群舞：人数不超过36人，演出时间不超过7分钟。',
  }
})

const durationExceeded = computed(() => {
  const totalMinutes = (baseForm.minutes || 0) + (baseForm.seconds || 0) / 60
  return totalMinutes > performerLimit.value.maxDuration
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
              <el-form-item label="表演形式" required>
                <el-select
                  v-model="baseForm.performanceType"
                  placeholder="请选择表演形式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in performanceTypeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="String(item.id)"
                  />
                  <!-- 保留硬编码作为兜底，如果API为空 -->
                  <el-option
                    v-if="performanceTypeOptions.length === 0"
                    label="群舞"
                    value="group"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="作品时长"
                required
                :error="durationExceeded ? `演出时间不能超过${performerLimit.maxDuration}分钟` : ''"
              >
                <div class="duration">
                  <el-input
                    v-model.number="baseForm.minutes"
                    type="number"
                    min="0"
                    style="width: 80px"
                    :class="{ 'input-error': durationExceeded }"
                  />
                  <span class="unit">分</span>
                  <el-input
                    v-model.number="baseForm.seconds"
                    type="number"
                    min="0"
                    max="59"
                    style="width: 80px"
                    :class="{ 'input-error': durationExceeded }"
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
          <!-- 限制提示 -->
          <el-row :gutter="24">
            <el-col :span="24">
              <div class="performer-limit-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ performerLimit.description }}</span>
              </div>
            </el-col>
          </el-row>
          <!-- 表演信息 -->
          <div class="song-section">
            <h4 class="section-title">表演信息</h4>

            <!-- 表演名称 -->
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="表演名称" required>
                  <el-input v-model="baseForm.title" placeholder="请输入表演名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否为本届展演原创" label-width="150px">
                  <el-radio-group v-model="baseForm.isOriginal">
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
          custom-download
          @download="downloadTemplate"
          @add-participant="(e) => onAddParticipant('teacher', e.index, e.row)"
          @delete-row="(e) => onDeleteParticipant(e.row)"
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
          @add-participant="(e) => onAddParticipant('student', e.index, e.row)"
          @delete-row="(e) => onDeleteParticipant(e.row)"
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

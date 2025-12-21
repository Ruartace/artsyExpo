<script lang="ts" setup name="VoiceRegistrationForm">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
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
  saveVocalMusicWork,
  getVocalPerformanceCategories,
  getGroupCategories,
  getVocalMusicWork,
  getVocalMusicWorkList,
  getVocalMusicParticipants,
  submitVocalMusicWork,
  uploadVocalMusicFile,
  getVocalTeacherTemplate,
  addVocalMusicParticipant,
  deleteVocalMusicParticipant,
} from '@/services/user/VocalMusicWorksCatalog'
import type {
  PerformanceCategory,
  GroupCategory,
  VocalMusicWork,
} from '@/services/user/VocalMusicWorksCatalog'
import { useRoute } from 'vue-router'

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
  group: string | number
  leader: string
  tutor: string
  notice: boolean
  performerCount: number | null
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
  contact?: string
  id_card?: string
  ethnicity?: string
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
  age?: number | string
  grade?: string
  student_id?: string
  // 兼容不同命名
  phone?: string
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
const route = useRoute()

/* ---- 简介 ---- */
const intro = ref('')
const categoryOptions = ref<PerformanceCategory[]>([])
const groupOptions = ref<GroupCategory[]>([])

// 预加载表演形式分类和组别分类
const loadCategories = async () => {
  const [catRes, groupRes] = await Promise.all([
    getVocalPerformanceCategories(),
    getGroupCategories(),
  ])

  if (catRes.code === 200 && Array.isArray(catRes.data)) {
    categoryOptions.value = catRes.data
  } else {
    ElMessage.warning('获取表演形式失败，请刷新重试')
  }

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
}

// 加载人员信息
const loadParticipants = async (id: number | string) => {
  try {
    const res = await getVocalMusicParticipants(id)
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

      accomp.value = data
        .filter((p) => p.role === 'conductor')
        .map((p) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          id_card: p.id_card,
          ethnicity: p.ethnicity,
          age: p.age,
          contact: p.contact,
        }))

      accompaniment.value = data
        .filter((p) => p.role === 'accompanist')
        .map((p) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          id_card: p.id_card,
          ethnicity: p.ethnicity,
          age: p.age,
          contact: p.contact,
        }))
    }
  } catch (error) {
    console.error('获取人员信息失败:', error)
  }
}

// 填充表单数据
const fillFormData = async (data: VocalMusicWork) => {
  baseForm.performanceType = data.performance_form
  baseForm.minutes = data.duration_minutes
  baseForm.seconds = data.duration_seconds
  baseForm.song1 = data.title
  baseForm.contact = data.contact_name
  baseForm.phone = data.contact_phone
  baseForm.address = data.contact_address
  baseForm.group = data.group
  baseForm.notice = data.has_read_terms
  baseForm.performerCount = data.performer_count

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
  // 优先从 data.participants 获取（如果后端支持）
  // 否则调用 loadParticipants 单独获取
  if (data.participants && Array.isArray(data.participants)) {
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

    accomp.value = pList
      .filter((p) => p.role === 'conductor')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
      }))

    accompaniment.value = pList
      .filter((p) => p.role === 'accompanist')
      .map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        id_card: p.id_card,
        ethnicity: p.ethnicity,
        age: p.age,
        contact: p.contact,
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
    try {
      const res = await getVocalMusicWork(id)
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
      const res = await getVocalMusicWorkList()
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
            // 用户点击确认，填充数据
            await fillFormData(latestData)
            ElMessage.success('已恢复暂存信息')
          } catch {
            // 用户点击取消，不填充数据，保持表单为空（默认状态）
            // 可以在这里执行额外的清空操作，但由于初始化时表单本就是空的，所以通常不需要
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

const downloadTemplate = async () => {
  const success = await getVocalTeacherTemplate()
  if (!success) {
    ElMessage.error('模板下载失败，请重试')
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
  let applicationId = Array.isArray(routeId) ? routeId[0] : routeId

  // 尝试获取本地缓存的ID（如果在页面初始化时通过恢复草稿获取了ID，但未更新路由）
  if (!applicationId) {
    // 尝试从最近一次保存/恢复的记录中获取ID，这里简单起见，如果页面上已经有数据，尝试再次调用列表接口获取最新的草稿ID
    // 或者更简单的，直接提示用户保存。
    // 优化逻辑：如果用户之前恢复了草稿，baseForm里应该有数据，但applicationId可能还是空的（因为URL没变）
    // 此时应该先尝试获取最新的草稿ID
    try {
      const res = await getVocalMusicWorkList()
      if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
        const latestData = res.data.reduce((prev, current) => {
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
      const res = await saveVocalMusicWork({
        title: baseForm.song1, // 确保有标题
        description: intro.value,
        duration_minutes: baseForm.minutes,
        duration_seconds: baseForm.seconds,
        contact_name: baseForm.contact,
        contact_phone: baseForm.phone,
        contact_address: baseForm.address,
        performer_count: baseForm.performerCount || 0,
        has_read_terms: baseForm.notice,
        performance_form: Number(baseForm.performanceType) || 1, // 默认值为 1 或其他有效 ID
        group: Number(baseForm.group) || 1, // 默认值为 1 或其他有效 ID
        video_file: null,
        score_file: null,
      })

      if (res.code === 200 || res.code === 201) {
        applicationId = String(res.data.id)
        // 更新路由或状态，避免重复创建
        // 这里简单处理，实际可能需要 router.replace
        ElMessage.success('草稿保存成功，正在添加人员...')
      } else {
        ElMessage.error(res.message || '保存草稿失败')
        return
      }
    } catch {
      // 用户取消
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
  // contact 和 phone 兼容
  if (!row.contact && !row.phone) {
    ElMessage.warning('请填写联系方式')
    return
  }
  if (role === 'student' && !row.student_id) {
    ElMessage.warning('请填写学籍号')
    return
  }

  // 2. 构造数据：直接使用用户输入，不设默认值（除性别外）
  const payload = {
    role: role,
    name: row?.name,
    id_card: row?.id_card,
    ethnicity: row?.ethnicity,
    age: row?.age ? Number(row.age) : undefined,
    gender: (row?.gender as 'male' | 'female') || 'female',
    contact: row?.contact,
    submission_id: Number(applicationId), // 确保这里使用的是统一的 ID
    // 如果是学生，可能需要更多字段
    grade: role === 'student' ? row?.grade : undefined,
    student_id: role === 'student' ? row?.student_id : undefined,
  }

  try {
    const res = await addVocalMusicParticipant(payload)
    if (res.code === 200 || res.code === 201) {
      ElMessage.success('添加人员成功')

      // 直接使用返回的数据，不再调用详情接口
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

      // 找到对应的列表并更新
      // 注意：由于 RosterBlock 是双向绑定的，理论上 rows 已经更新了用户输入
      // 但这里为了确保数据一致性（特别是有了 id），我们更新对应行
      // 不过由于我们不知道具体的 index，这里简单地替换整个列表或者找到对应行可能比较麻烦
      // 更好的方式是 RosterBlock 传递 index，然后我们在这里更新
      // 目前 add-participant 事件传递了 index，我们可以利用一下

      // 重新加载列表是最稳妥的方式，或者根据 role 找到对应数组更新
      // 由于我们现在是点击行内的按钮添加，所以 row 应该是已经存在于数组中的
      if (row) {
        // 更新本地对象，这样 RosterBlock 里的显示会自动更新（包括 id）
        Object.assign(row, newItem)
      } else {
        // 只有当没有传递 row 时（极少情况）才 push
        if (role === 'teacher') {
          teachers.value.push(newItem)
        } else if (role === 'student') {
          members.value.push(newItem)
        } else if (role === 'conductor') {
          accomp.value.push(newItem)
        } else if (role === 'accompanist') {
          accompaniment.value.push(newItem)
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
  if (!row.id) return // 如果没有ID，说明只是前端临时数据，RosterBlock已经删除了，不需要调用后端

  try {
    const res = await deleteVocalMusicParticipant(row.id)
    if (res.code === 200 || res.code === 204) {
      ElMessage.success('删除人员成功')
    } else {
      ElMessage.error(res.message || '删除人员失败')
      // 删除失败，重新加载数据以恢复显示
      const routeId = route.params.id
      const id = Array.isArray(routeId) ? routeId[0] : routeId
      if (id) {
        await loadParticipants(id)
      }
    }
  } catch (error) {
    console.error('删除人员失败:', error)
    ElMessage.error('删除人员失败，请重试')
    // 删除失败，重新加载数据以恢复显示
    const routeId = route.params.id
    const id = Array.isArray(routeId) ? routeId[0] : routeId
    if (id) {
      await loadParticipants(id)
    }
  }
}

/* ---- 行为：暂存 / 提交 ---- */
const onSave = () => {
  // 暂存只保留最基本的非空校验，或者甚至可以允许部分空值，视业务需求而定
  // 这里保留一些基础字段的校验，但放宽了对表演人数和组别的限制
  if (!baseForm.song1) {
    ElMessage.error('请输入曲目1名称以便暂存')
    return
  }

  // 暂存可能不需要所有校验，但至少需要核心字段
  saveVocalMusicWork({
    title: baseForm.song1,
    description: intro.value,
    duration_minutes: baseForm.minutes,
    duration_seconds: baseForm.seconds,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    performer_count: baseForm.performerCount || 0,
    has_read_terms: baseForm.notice,
    performance_form: Number(baseForm.performanceType),
    group: Number(baseForm.group) || null,
    video_file: null,
    score_file: null,
  })
    .then((res) => {
      if (res.code === 200) {
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
  if (!baseForm.group) {
    ElMessage.error('请选择组别')
    return
  }
  if (!baseForm.contact) {
    ElMessage.error('请输入联系人')
    return
  }
  if (!baseForm.phone) {
    ElMessage.error('请输入联系电话')
    return
  }
  if (!baseForm.address) {
    ElMessage.error('请输入联系地址')
    return
  }
  //条件限制：包含人数以及时长
  const selectedCategory = categoryOptions.value.find((c) => c.id === type)
  const categoryName = selectedCategory?.name || ''

  if (categoryName.includes('合唱') && !categoryName.includes('小合唱')) {
    // 合唱 (通常对应 type === 1)
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
  } else if (categoryName.includes('班级合唱') || type === 4) {
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
  } else if (
    categoryName.includes('小合唱') ||
    categoryName.includes('表演唱') ||
    type === 2 ||
    type === 3
  ) {
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
  } else if (categoryName.includes('独唱')) {
    // 独唱
    if (durationSec > 300) {
      ElMessage.error('独唱作品时长不能超过5分钟')
      return
    }
    if (members.value.length !== 1) {
      ElMessage.error('独唱只能有1名参赛选手')
      return
    }
    if (accomp.value.length > 0) {
      ElMessage.error('独唱不设指挥')
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

  // 先调用 createVocalMusicWork 保存数据（无论新增还是更新，这里假设 createVocalMusicWork 逻辑包含保存）
  // 注意：如果后端 createVocalMusicWork 仅用于创建新记录，而更新需要另一接口，这里可能需要调整
  // 根据现有代码逻辑，createVocalMusicWork 似乎是 POST /vocalperformance/applications/，通常用于创建
  // 如果是更新现有记录（有ID），可能需要 PUT/PATCH 接口。
  // 但目前只看到 createVocalMusicWork 和 saveVocalMusicWork (都是 POST)
  // 假设先保存（创建或更新），拿到 ID 后再调用 submitVocalMusicWork

  // 1. 保存/创建数据
  createVocalMusicWork({
    title: baseForm.song1,
    description: intro.value,
    duration_minutes: baseForm.minutes,
    duration_seconds: baseForm.seconds,
    contact_name: baseForm.contact,
    contact_phone: baseForm.phone,
    contact_address: baseForm.address,
    performer_count: baseForm.performerCount || 0,
    has_read_terms: baseForm.notice,
    performance_form: Number(baseForm.performanceType),
    group: Number(baseForm.group),
    video_file: null,
    score_file: null,
  })
    .then(async (res) => {
      if (res.code === 200 || res.code === 201) {
        // 2. 获取返回的 ID
        const applicationId = res.data.id

        // 3. 上传文件
        try {
          // 上传作品文件
          for (const file of fileList.value) {
            if (file.raw) {
              await uploadVocalMusicFile(applicationId, 'video', file.raw)
            }
          }
          // 上传乐谱文件
          for (const file of scoreFiles.value) {
            if (file.raw) {
              await uploadVocalMusicFile(applicationId, 'score', file.raw)
            }
          }

          // 添加人员信息
          const participants = [
            ...teachers.value.map((p) => ({ ...p, role: 'teacher' as const })),
            ...members.value.map((p) => ({ ...p, role: 'student' as const })),
            ...accomp.value.map((p) => ({ ...p, role: 'conductor' as const })),
            ...accompaniment.value.map((p) => ({ ...p, role: 'accompanist' as const })),
          ]

          for (const p of participants) {
            await addVocalMusicParticipant({
              role: p.role,
              name: p.name || '',
              id_card: p.id_card || '',
              ethnicity: p.ethnicity || '',
              age: Number(p.age) || 0,
              gender: p.gender || 'male', // 默认值，需确保前端校验
              contact: p.contact || '',
              submission_id: applicationId,
              grade: p.grade,
              student_id: p.student_id,
            })
          }
        } catch (error) {
          console.error('文件上传或人员添加失败:', error)
          ElMessage.error('信息保存失败，请重试')
          return // 如果失败，中止提交
        }

        // 4. 调用提交接口
        try {
          const submitRes = await submitVocalMusicWork(applicationId)
          if (submitRes.code === 200) {
            ElMessage.success('报名成功')
            const loading = ElLoading.service({
              lock: true,
              text: '提交成功，正在刷新页面...',
              background: 'rgba(0, 0, 0, 0.7)',
            })
            // 可以跳转或重置表单
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

/* ---- 报名须知弹窗 ---- */
const noticeVisible = ref(false)
const showNotice = () => {
  noticeVisible.value = true
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
                    <el-option
                      v-for="item in groupOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
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
          custom-download
          @download="downloadTemplate"
          @add-participant="({ index, row }) => onAddParticipant('teacher', index, row)"
          @delete-row="({ row }) => onDeleteParticipant(row)"
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
          @add-participant="({ index, row }) => onAddParticipant('student', index, row)"
          @delete-row="({ row }) => onDeleteParticipant(row)"
        />
        <RosterBlock
          class="mt16"
          title="老师指挥"
          :columns="accompColumns"
          v-model:rows="accomp"
          :readonly="readonly"
          @add-participant="onAddParticipant('conductor')"
          @delete-row="({ row }) => onDeleteParticipant(row)"
        />
        <RosterBlock
          class="mt16"
          title="老师伴奏"
          :columns="accompanimentColumns"
          v-model:rows="accompaniment"
          :readonly="readonly"
          @add-participant="({ index, row }) => onAddParticipant('accompanist', index, row)"
          @delete-row="({ row }) => onDeleteParticipant(row)"
        />
      </el-card>

      <!-- 用户阅读须知区 -->
      <div class="notice">
        <div class="notice-content">
          <p style="color: red">请仔细阅读报名须知，确认无误后勾选报名须知，即可进行报名。</p>
          <el-row :gutter="34">
            <el-col :span="12">
              <el-form-item label="报名须知" prop="notice">
                <el-checkbox v-model="baseForm.notice" required>
                  我已仔细阅读并同意
                  <span
                    style="color: #409eff; cursor: pointer; font-weight: bold"
                    @click.prevent="showNotice"
                  >
                    《报名须知》
                  </span>
                </el-checkbox>
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

      <!-- 报名须知弹窗 -->
      <el-dialog v-model="noticeVisible" title="报名须知" width="50%" :close-on-click-modal="false">
        <div class="notice-dialog-content" style="line-height: 1.8; font-size: 16px">
          <p>
            1. 报名者需保证所填写的个人信息真实、准确、有效，如因信息错误导致无法参赛，后果自负。
          </p>
          <p>2. 参赛作品必须符合展演主题，内容健康向上，不得含有违反法律法规、社会公德的内容。</p>
          <p>
            3.
            报名者需确保拥有参赛作品的合法版权或已获得授权，如发生版权纠纷，由报名者承担全部法律责任。
          </p>
          <p>
            4.
            组委会有权对参赛作品进行录音、录像、摄影，并有权将参赛作品用于相关的宣传、展示、出版等非商业用途。
          </p>
          <p>5. 请严格遵守比赛时间安排，迟到者视为自动放弃比赛资格。</p>
          <p>6. 比赛期间请服从现场工作人员的指挥，保持赛场秩序。</p>
          <p>7. 最终解释权归本次展演组委会所有。</p>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="noticeVisible = false">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use '@/assets/styles/user_styles/VocalMusicWorksCatalog.scss';
</style>

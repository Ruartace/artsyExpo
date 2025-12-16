<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type Registration = {
  id: string
  accountId: string  // 报名账号ID（同一大学使用同一账号）
  accountName: string // 账号名称（通常是大学名称）
  workName: string  // 节目名称
  name: string
  school: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  rejectReason?: string  // 驳回理由
  phone?: string
  email?: string
  // 用户报名表单字段（通用字段）
  contact?: string  // 联系人
  address?: string  // 地址
  intro?: string  // 简介
  // 演奏类字段
  performanceType?: string  // 表演形式
  minutes?: number  // 时长（分）
  seconds?: number  // 时长（秒）
  isOriginal?: boolean  // 是否原创
  group?: string  // 组别
  song1?: string  // 曲目1
  song2?: string  // 曲目2
  song1HasChinese?: boolean  // 曲目1是否中文作品
  song2HasChinese?: boolean  // 曲目2是否中文作品
  song1IsOriginal?: boolean  // 曲目1是否原创
  song2IsOriginal?: boolean  // 曲目2是否原创
  chorusCount?: number  // 合唱人数
  pianoAccompanist?: string  // 钢琴伴奏
  leader?: string  // 领队
  tutor?: string  // 指导教师
  // 美育改革创新字段
  caseName?: string  // 案例名称
  leaderName?: string  // 负责人姓名
  leaderTitle?: string  // 负责人职称
  caseCode?: string  // 案例代码
  submitUnit?: string  // 报送单位
  leaderUnit?: string  // 负责人单位
  leaderPhone?: string  // 负责人电话
  category?: string  // 类别（选题方向）
  // 花名册（简化显示，只显示数量）
  teachersCount?: number  // 教师数量
  membersCount?: number  // 成员数量
  accompCount?: number  // 伴奏数量
  // 上传文件（显示文件名列表）
  files?: Array<{ name: string; size?: number; type?: string }>  // 上传的文件
}

const keyword = ref('')
const filterStatus = ref<string>('')
const filterType = ref<string>('')
const multipleSelection = ref<Registration[]>([])

// 节目类型选项（用户端的12个类型）
const typeOptions = [
  { label: '声乐报名', value: '声乐报名' },
  { label: '器乐报名', value: '器乐报名' },
  { label: '舞蹈报名', value: '舞蹈报名' },
  { label: '戏曲报名', value: '戏曲报名' },
  { label: '朗诵报名', value: '朗诵报名' },
  { label: '书法作品', value: '书法作品' },
  { label: '绘画作品', value: '绘画作品' },
  { label: '设计作品', value: '设计作品' },
  { label: '摄影作品', value: '摄影作品' },
  { label: '微电影作品', value: '微电影作品' },
  { label: '艺术实践工作坊报名', value: '艺术实践工作坊报名' },
  { label: '美育改革创新优秀案例申报', value: '美育改革创新优秀案例申报' }
]
const registrationDetailVisible = ref(false)
const currentDetail = ref<Registration | null>(null)
const rejectReasonDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectAccount = ref<string | null>(null)  // 当前要驳回的节目ID
const batchRejectReasonDialogVisible = ref(false)
const batchRejectReason = ref('')

const list = ref<Registration[]>([
  {
    id: '1',
    accountId: 'account001',
    accountName: 'A大学',
    workName: '春天来了',
    name: '张三',
    school: 'A大学',
    type: '声乐报名',
    status: 'pending',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    contact: '张老师',
    address: '北京市',
    performanceType: '合唱',
    minutes: 5,
    seconds: 30,
    isOriginal: false,
    group: 'A组',
    song1: '春天来了',
    song2: '夏日之歌',
    song1HasChinese: true,
    song2HasChinese: true,
    song1IsOriginal: false,
    song2IsOriginal: false,
    chorusCount: 40,
    pianoAccompanist: 'teacher',
    leader: '李老师',
    tutor: '王老师',
    intro: '这是一首关于春天的合唱作品，展现了春天的美好景象和人们对春天的向往。',
    teachersCount: 2,
    membersCount: 40,
    accompCount: 1,
    files: [
      { name: '作品音频.mp3', size: 5120000 },
      { name: '作品视频.mp4', size: 25600000 },
      { name: '曲谱.pdf', size: 1024000 }
    ]
  },
  {
    id: '4',
    accountId: 'account001',
    accountName: 'A大学',
    workName: '月光曲',
    name: '张三同学2',
    school: 'A大学',
    type: '器乐报名',
    status: 'pending',
    phone: '13800138001',
    email: 'zhangsan2@example.com',
    contact: '张老师',
    address: '北京市',
    performanceType: '独奏',
    minutes: 4,
    seconds: 15,
    isOriginal: false,
    group: 'B组',
    intro: '经典器乐合奏作品，以月光为主题，表现夜晚的宁静与美好。',
    teachersCount: 1,
    membersCount: 1,
    files: [
      { name: '演奏视频.mp4', size: 30000000 }
    ]
  },
  {
    id: '2',
    accountId: 'account002',
    accountName: 'B大学',
    workName: '舞蹈风采',
    name: '李四',
    school: 'B大学',
    type: '舞蹈报名',
    status: 'pending',
    phone: '13900139000',
    email: 'lisi@example.com',
    contact: '李老师',
    address: '上海市',
    performanceType: '群舞',
    minutes: 6,
    seconds: 0,
    isOriginal: true,
    group: 'A组',
    intro: '展现校园生活的舞蹈作品，动作优美，编排新颖。',
    teachersCount: 1,
    membersCount: 36,
    files: [
      { name: '舞蹈视频.mp4', size: 50000000 }
    ]
  },
  {
    id: '3',
    accountId: 'account003',
    accountName: 'C大学',
    workName: '戏曲选段',
    name: '王五',
    school: 'C大学',
    type: '戏曲报名',
    status: 'approved',
    phone: '13700137000',
    email: 'wangwu@example.com',
    contact: '王老师',
    address: '广东省',
    performanceType: '传统戏曲',
    minutes: 7,
    seconds: 30,
    isOriginal: false,
    group: 'A组',
    intro: '经典戏曲选段，传承传统文化艺术。',
    teachersCount: 1,
    membersCount: 8,
    files: [
      { name: '戏曲表演视频.mp4', size: 40000000 }
    ]
  },
  {
    id: '5',
    accountId: 'account004',
    accountName: 'D大学',
    workName: '经典朗诵',
    name: '赵六',
    school: 'D大学',
    type: '朗诵报名',
    status: 'pending',
    phone: '13600136000',
    email: 'zhaoliu@example.com',
    contact: '赵老师',
    address: '江苏省',
    performanceType: '集体朗诵',
    minutes: 5,
    seconds: 0,
    isOriginal: true,
    group: 'A组',
    intro: '优美的朗诵作品，展现语言艺术魅力。',
    teachersCount: 1,
    membersCount: 15,
    files: [
      { name: '朗诵视频.mp4', size: 35000000 }
    ]
  },
  {
    id: '6',
    accountId: 'account005',
    accountName: 'E大学',
    workName: '美育改革创新案例',
    name: '孙七',
    school: 'E大学',
    type: '美育改革创新优秀案例申报',
    status: 'pending',
    phone: '13500135000',
    email: 'sunqi@example.com',
    caseName: '高校美育改革创新优秀案例',
    leaderName: '孙教授',
    leaderTitle: '教授',
    caseCode: 'CASE001',
    submitUnit: 'E大学',
    leaderUnit: 'E大学音乐学院',
    leaderPhone: '13500135000',
    category: '高校美育教师队伍建设',
    intro: '这是一个关于高校美育教师队伍建设的优秀案例。',
    files: [
      { name: '案例正文.pdf', size: 2048000 },
      { name: '附件材料1.pdf', size: 1536000 }
    ]
  },
])

// 筛选后的报名列表（按节目显示）
const filteredRegistrations = computed(() => {
  return list.value.filter(item => {
    const hit = item.accountName.includes(keyword.value) || item.workName.includes(keyword.value)
    const statusOk = !filterStatus.value || item.status === filterStatus.value
    const typeOk = !filterType.value || item.type === filterType.value
    return hit && statusOk && typeOk
  })
})

function handleSelectionChange(rows: Registration[]) {
  multipleSelection.value = rows
}

function viewRegistrationDetail(row: Registration) {
  currentDetail.value = row
  registrationDetailVisible.value = true
}

// 审核通过（按节目）
function approveRegistration(id: string) {
  list.value = list.value.map(i =>
    i.id === id && i.status === 'pending'
      ? { ...i, status: 'approved', rejectReason: undefined }
      : i
  )
  ElMessage.success('审核通过')
}

// 打开驳回理由填写对话框
function openRejectReasonDialog(id: string) {
  currentRejectAccount.value = id
  rejectReason.value = ''
  rejectReasonDialogVisible.value = true
}

// 提交单个节目驳回
function submitReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回理由')
    return
  }
  if (!currentRejectAccount.value) return

  list.value = list.value.map(i =>
    i.id === currentRejectAccount.value && i.status === 'pending'
      ? { ...i, status: 'rejected', rejectReason: rejectReason.value.trim() }
      : i
  )
  ElMessage.success('已驳回')
  rejectReasonDialogVisible.value = false
  rejectReason.value = ''
  currentRejectAccount.value = null
}

// 打开批量驳回理由填写对话框
function openBatchRejectReasonDialog() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要审核的节目')
    return
  }
  const workNames = multipleSelection.value.map(r => r.workName)

  ElMessageBox.confirm(
    `确定要驳回以下 ${multipleSelection.value.length} 个节目的报名吗？\n节目：${workNames.join('、')}`,
    '批量驳回',
    {
      confirmButtonText: '填写驳回理由',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
    }
  ).then(() => {
    batchRejectReason.value = ''
    batchRejectReasonDialogVisible.value = true
  }).catch(() => {})
}

// 提交批量驳回
function submitBatchReject() {
  if (!batchRejectReason.value.trim()) {
    ElMessage.warning('请填写驳回理由')
    return
  }

  const ids = new Set(multipleSelection.value.map(r => r.id))

  list.value = list.value.map(i =>
    ids.has(i.id) && i.status === 'pending'
      ? { ...i, status: 'rejected', rejectReason: batchRejectReason.value.trim() }
      : i
  )

  ElMessage.success(`已批量驳回 ${ids.size} 个节目的报名`)
  batchRejectReasonDialogVisible.value = false
  batchRejectReason.value = ''
  multipleSelection.value = []
}

// 批量审核通过（按节目）
function batchApprove() {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要审核的节目')
    return
  }
  const ids = new Set(multipleSelection.value.map(r => r.id))

  list.value = list.value.map(i =>
    ids.has(i.id) && i.status === 'pending'
      ? { ...i, status: 'approved', rejectReason: undefined }
      : i
  )

  ElMessage.success(`已批量通过 ${ids.size} 个节目的报名`)
  multipleSelection.value = []
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return statusMap[status] || status
}

function getStatusType(status: string) {
  const typeMap: Record<string, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return typeMap[status] || 'info'
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>审核报名</span>
          <div class="filters">
            <el-input
              v-model="keyword"
              placeholder="搜索大学名称或节目名称"
              clearable
              style="max-width: 260px"
            />
            <el-select v-model="filterStatus" clearable placeholder="请选择审核状态（全部）" style="width: 220px">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-select v-model="filterType" clearable placeholder="请选择节目类型（全部）" style="width: 220px">
              <el-option label="全部" value="" />
              <el-option
                v-for="option in typeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-button type="success" @click="batchApprove">批量审核通过</el-button>
            <el-button type="danger" @click="openBatchRejectReasonDialog">批量审核不通过</el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="filteredRegistrations"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="accountName" label="大学名称" min-width="200" />
        <el-table-column prop="workName" label="节目名" min-width="200" />
        <el-table-column prop="type" label="节目类型" min-width="180" />
        <el-table-column prop="accountId" label="账号ID" min-width="150" />
        <el-table-column prop="rejectReason" label="驳回理由" min-width="250">
          <template #default="{ row }">
            <span v-if="row.rejectReason" style="color: #F56C6C">
              {{ row.rejectReason }}
            </span>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="查看详情" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewRegistrationDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="审核状态/操作" width="220" fixed="right">
          <template #default="{ row }">
            <!-- 待审核状态：显示操作按钮 -->
            <template v-if="row.status === 'pending'">
              <el-button
                size="small"
                type="success"
                @click="approveRegistration(row.id)"
              >
                通过
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="openRejectReasonDialog(row.id)"
              >
                驳回
              </el-button>
            </template>
            <!-- 已审核状态：显示状态标签 -->
            <template v-else>
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 单个报名详情弹窗 -->
    <el-dialog
      v-model="registrationDetailVisible"
      title="报名详细信息"
      width="800px"
      v-if="currentDetail"
    >
      <!-- 基本信息 -->
      <el-descriptions :column="2" border title="基本信息">
        <el-descriptions-item label="ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="大学名称">{{ currentDetail.accountName }}</el-descriptions-item>
        <el-descriptions-item label="节目名">{{ currentDetail.workName }}</el-descriptions-item>
        <el-descriptions-item label="账号ID">{{ currentDetail.accountId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ currentDetail.school }}</el-descriptions-item>
        <el-descriptions-item label="节目类型">{{ currentDetail.type }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentDetail.status)" size="small">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentDetail.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentDetail.email || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.contact" label="联系人">{{ currentDetail.contact }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.address" label="地址">{{ currentDetail.address }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.rejectReason" label="驳回理由" :span="2">
          <span style="color: #F56C6C">{{ currentDetail.rejectReason }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 演奏类报名详情 -->
      <template v-if="['声乐报名', '器乐报名', '舞蹈报名', '戏曲报名', '朗诵报名'].includes(currentDetail.type)">
        <el-descriptions :column="2" border title="作品信息" style="margin-top: 20px">
          <el-descriptions-item v-if="currentDetail.performanceType" label="表演形式">
            {{ currentDetail.performanceType }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.minutes !== undefined && currentDetail.seconds !== undefined" label="作品时长">
            {{ currentDetail.minutes }}分{{ currentDetail.seconds }}秒
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.isOriginal !== undefined" label="是否原创">
            {{ currentDetail.isOriginal ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.group" label="组别">
            {{ currentDetail.group }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.song1" label="曲目1">
            {{ currentDetail.song1 }}
            <span v-if="currentDetail.song1HasChinese !== undefined">
              （{{ currentDetail.song1HasChinese ? '中文作品' : '非中文作品' }}）
            </span>
            <span v-if="currentDetail.song1IsOriginal !== undefined">
              {{ currentDetail.song1IsOriginal ? '原创作品' : '非原创作品' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.song2" label="曲目2">
            {{ currentDetail.song2 }}
            <span v-if="currentDetail.song2HasChinese !== undefined">
              （{{ currentDetail.song2HasChinese ? '中文作品' : '非中文作品' }}）
            </span>
            <span v-if="currentDetail.song2IsOriginal !== undefined">
              {{ currentDetail.song2IsOriginal ? '原创作品' : '非原创作品' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.chorusCount" label="合唱人数">
            {{ currentDetail.chorusCount }}人
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.pianoAccompanist" label="钢琴伴奏">
            {{ currentDetail.pianoAccompanist === 'teacher' ? '老师' : currentDetail.pianoAccompanist === 'student' ? '学生' : currentDetail.pianoAccompanist }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.leader" label="领队">
            {{ currentDetail.leader }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.tutor" label="指导教师">
            {{ currentDetail.tutor }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 美育改革创新详情 -->
      <template v-if="currentDetail.type === '美育改革创新优秀案例申报'">
        <el-descriptions :column="2" border title="案例信息" style="margin-top: 20px">
          <el-descriptions-item v-if="currentDetail.caseName" label="案例名称">
            {{ currentDetail.caseName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.caseCode" label="案例代码">
            {{ currentDetail.caseCode }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.leaderName" label="负责人姓名">
            {{ currentDetail.leaderName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.leaderTitle" label="负责人职称">
            {{ currentDetail.leaderTitle }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.submitUnit" label="报送单位">
            {{ currentDetail.submitUnit }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.leaderUnit" label="负责人单位">
            {{ currentDetail.leaderUnit }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.leaderPhone" label="负责人电话">
            {{ currentDetail.leaderPhone }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.category" label="类别（选题方向）">
            {{ currentDetail.category }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 简介 -->
      <div v-if="currentDetail.intro" style="margin-top: 20px">
        <h4>简介</h4>
        <div style="padding: 12px; background-color: #f5f7fa; border-radius: 4px; white-space: pre-wrap;">
          {{ currentDetail.intro }}
        </div>
      </div>

      <!-- 花名册信息 -->
      <div v-if="currentDetail.teachersCount !== undefined || currentDetail.membersCount !== undefined || currentDetail.accompCount !== undefined" style="margin-top: 20px">
        <h4>花名册信息</h4>
        <el-descriptions :column="3" border>
          <el-descriptions-item v-if="currentDetail.teachersCount !== undefined" label="教师数量">
            {{ currentDetail.teachersCount }}人
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.membersCount !== undefined" label="成员数量">
            {{ currentDetail.membersCount }}人
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.accompCount !== undefined" label="伴奏数量">
            {{ currentDetail.accompCount }}人
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 上传文件 -->
      <div v-if="currentDetail.files && currentDetail.files.length > 0" style="margin-top: 20px">
        <h4>上传文件</h4>
        <el-table :data="currentDetail.files" border size="small" max-height="200">
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="type" label="文件类型" width="120">
            <template #default="{ row }">
              {{ row.type || '未知' }}
            </template>
          </el-table-column>
          <el-table-column label="文件大小" width="120">
            <template #default="{ row }">
              {{ row.size ? formatFileSize(row.size) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="registrationDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 驳回理由填写弹窗 -->
    <el-dialog
      v-model="rejectReasonDialogVisible"
      title="填写驳回理由"
      width="600px"
      @close="rejectReason = ''; currentRejectAccount = null"
    >
      <el-form>
        <el-form-item label="驳回理由" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="5"
            placeholder="请详细填写驳回理由"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectReasonDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject">确定驳回</el-button>
      </template>
    </el-dialog>

    <!-- 批量驳回理由填写弹窗 -->
    <el-dialog
      v-model="batchRejectReasonDialogVisible"
      title="填写批量驳回理由"
      width="600px"
      @close="batchRejectReason = ''"
    >
      <el-form>
        <el-form-item label="驳回理由" required>
          <el-input
            v-model="batchRejectReason"
            type="textarea"
            :rows="5"
            placeholder="请填写驳回理由，该理由将应用于所有选中的账号"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchRejectReasonDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitBatchReject">确定批量驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>



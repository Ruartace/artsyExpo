<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

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
const filterType = ref<string>('')
const registrationDetailVisible = ref(false)
const currentDetail = ref<Registration | null>(null)

// 导出功能
const exportMaterialType = ref<string>('')
const materialTypeOptions = [
  { label: '视频', value: 'video' },
  { label: '图片', value: 'image' },
  { label: 'PDF', value: 'pdf' },
]

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

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

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
    workName: '书法佳作',
    name: '孙七',
    school: 'E大学',
    type: '书法作品',
    status: 'pending',
    phone: '13500135000',
    email: 'sunqi@example.com',
    contact: '孙老师',
    address: '浙江省',
    intro: '优秀的书法作品，展现传统书法艺术。',
    files: [
      { name: '书法作品.jpg', size: 2048000 }
    ]
  },
  {
    id: '7',
    accountId: 'account006',
    accountName: 'F大学',
    workName: '山水画',
    name: '周八',
    school: 'F大学',
    type: '绘画作品',
    status: 'approved',
    phone: '13400134000',
    email: 'zhouba@example.com',
    contact: '周老师',
    address: '四川省',
    intro: '精美的山水画作品，展现中国画的魅力。',
    files: [
      { name: '绘画作品.jpg', size: 3072000 }
    ]
  },
  {
    id: '8',
    accountId: 'account007',
    accountName: 'G大学',
    workName: '海报设计',
    name: '吴九',
    school: 'G大学',
    type: '设计作品',
    status: 'pending',
    phone: '13300133000',
    email: 'wujiu@example.com',
    contact: '吴老师',
    address: '湖北省',
    intro: '创新的海报设计作品，展现设计艺术。',
    files: [
      { name: '设计作品.pdf', size: 4096000 }
    ]
  },
  {
    id: '9',
    accountId: 'account008',
    accountName: 'H大学',
    workName: '校园风光',
    name: '郑十',
    school: 'H大学',
    type: '摄影作品',
    status: 'pending',
    phone: '13200132000',
    email: 'zhengshi@example.com',
    contact: '郑老师',
    address: '湖南省',
    intro: '精美的摄影作品，展现校园美丽风光。',
    files: [
      { name: '摄影作品.jpg', size: 5120000 }
    ]
  },
  {
    id: '10',
    accountId: 'account009',
    accountName: 'I大学',
    workName: '校园故事',
    name: '钱十一',
    school: 'I大学',
    type: '微电影作品',
    status: 'approved',
    phone: '13100131000',
    email: 'qianshiyi@example.com',
    contact: '钱老师',
    address: '河南省',
    intro: '感人的校园微电影，展现青春故事。',
    files: [
      { name: '微电影.mp4', size: 102400000 }
    ]
  },
  {
    id: '11',
    accountId: 'account010',
    accountName: 'J大学',
    workName: '艺术工作坊',
    name: '孙十二',
    school: 'J大学',
    type: '艺术实践工作坊报名',
    status: 'pending',
    phone: '13000130000',
    email: 'sunshier@example.com',
    contact: '孙老师',
    address: '山东省',
    intro: '创新的艺术实践工作坊，展现艺术教育新形式。',
    teachersCount: 3,
    membersCount: 20,
    files: [
      { name: '工作坊方案.pdf', size: 2048000 },
      { name: '活动照片.jpg', size: 3072000 }
    ]
  },
  {
    id: '12',
    accountId: 'account011',
    accountName: 'K大学',
    workName: '美育改革创新案例',
    name: '李十三',
    school: 'K大学',
    type: '美育改革创新优秀案例申报',
    status: 'pending',
    phone: '12900129000',
    email: 'lishisan@example.com',
    caseName: '高校美育改革创新优秀案例',
    leaderName: '李教授',
    leaderTitle: '教授',
    caseCode: 'CASE002',
    submitUnit: 'K大学',
    leaderUnit: 'K大学音乐学院',
    leaderPhone: '12900129000',
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
    const typeOk = !filterType.value || item.type === filterType.value
    return hit && typeOk
  })
})

// 分页后的数据
const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRegistrations.value.slice(start, end)
})

// 总条数
const total = computed(() => filteredRegistrations.value.length)

// 分页改变
function handlePageChange(page: number) {
  currentPage.value = page
}

// 每页条数改变
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

function viewRegistrationDetail(row: Registration) {
  currentDetail.value = row
  registrationDetailVisible.value = true
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

// 导出报名信息
function exportRegistrationInfo() {
  ElMessage.success('已导出报名信息Excel表格')
}

// 导出报名材料
function exportMaterials() {
  if (!exportMaterialType.value) {
    ElMessage.warning('请先选择材料类型')
    return
  }

  const typeName = materialTypeOptions.find(opt => opt.value === exportMaterialType.value)?.label || '材料'
  ElMessage.success(`已导出${typeName}材料`)
}
</script>

<template>
  <div>
    <!-- 导出功能按钮区域 -->
    <el-card class="mb20">
      <template #header>
        <div class="card-header">
          <span>导出功能</span>
        </div>
      </template>
      <div class="export-actions">
        <el-button type="primary" :icon="Download" @click="exportRegistrationInfo">
          导出报名信息
        </el-button>
        <el-button type="success" :icon="Download" @click="exportMaterials">
          导出报名材料
        </el-button>
        <el-select
          v-model="exportMaterialType"
          placeholder="选择材料类型"
          style="width: 150px"
          clearable
        >
          <el-option
            v-for="option in materialTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <div class="filters">
            <el-input
              v-model="keyword"
              placeholder="搜索大学名称或节目名称"
              clearable
              style="max-width: 260px"
            />
            <el-select
              v-model="filterType"
              clearable
              placeholder="请选择节目类型（全部）"
              style="width: 220px"
              teleported
              :popper-options="{
                placement: 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: { offset: [0, 4] }
                  },
                  {
                    name: 'computeStyles',
                    options: {
                      gpuAcceleration: false,
                      adaptive: false
                    }
                  }
                ]
              }"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in typeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          <span>报名统计</span>
        </div>
      </template>
      <el-table
        :data="paginatedRegistrations"
        stripe
        row-key="id"
      >
        <el-table-column type="index" label="序号" width="80" :index="(index: number) => (currentPage - 1) * pageSize + index + 1" />
        <el-table-column prop="accountName" label="大学名称" min-width="200" />
        <el-table-column prop="workName" label="节目名" min-width="200" />
        <el-table-column prop="type" label="节目类型" min-width="180" />
        <el-table-column prop="accountId" label="账号ID" min-width="150" />
        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
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
  </div>
</template>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: visible;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
  z-index: 10;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.mb20 {
  margin-bottom: 20px;
}

.export-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

// 修复下拉框对齐问题
:deep(.el-select) {
  .el-select__wrapper {
    position: relative;
  }
}

// 确保下拉菜单浮动在表单上方
:deep(.el-select-dropdown) {
  z-index: 3000 !important;
}

:deep(.program-type-select-dropdown) {
  min-width: 220px !important;
  margin-top: 4px !important;
  z-index: 3000 !important;
}
</style>

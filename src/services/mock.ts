import type { UserRole, OperationLog, AuditRecord, Registration, RegistrationStatus } from '@/types'

// 模拟用户数据库
const mockUsers: Record<
  string,
  { password: string; role: UserRole; name?: string; phone?: string }
> = {
  user1: { password: '123456', role: 'user', name: '用户1', phone: '13800138001' },
  user2: { password: '123456', role: 'user', name: '用户2', phone: '13800138002' },
  reviewer1: { password: '123456', role: 'approval', name: '审核员1', phone: '13800138003' },
  reviewer2: { password: '123456', role: 'approval' as UserRole, name: '审核员2', phone: '13800138004' },
  admin1: { password: '123456', role: 'admin', name: '管理员1', phone: '13800138005' },
  admin2: { password: '123456', role: 'admin', name: '管理员2', phone: '13800138006' },
  logger1: { password: '123456', role: 'logaudit', name: '审计员1', phone: '13800138007' },
  logger2: { password: '123456', role: 'logaudit', name: '审计员2', phone: '13800138008' },
}

/**
 * 认证用户
 * @param username 用户名
 * @param password 密码
 * @returns 认证结果，包含用户ID、角色和令牌
 */
export async function authenticate(
  username: string,
  password: string,
): Promise<{ userId: string; role: UserRole; token: string } | null> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = mockUsers[username]
  if (user && user.password === password) {
    return {
      userId: username,
      role: user.role,
      token: `token-${username}-${Date.now()}`,
    }
  }

  return null
}

/**
 * 修改密码
 * @param username 用户名
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @param name 姓名
 * @param phone 电话号
 * @returns 是否修改成功
 */
export async function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
  name: string,
  phone: string,
): Promise<boolean> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = mockUsers[username]
  if (!user) {
    return false
  }

  // 验证旧密码
  if (user.password !== oldPassword) {
    return false
  }

  // 更新密码和用户信息
  mockUsers[username] = {
    ...user,
    password: newPassword,
    name,
    phone,
  }

  return true
}

// 操作日志模拟数据
let operationLogs: OperationLog[] = [
  {
    id: '1',
    userId: 'user1',
    userName: '用户1',
    action: '登录',
    module: '系统登录',
    description: '用户登录系统',
    ip: '192.168.1.100',
    timestamp: '2024-01-15 09:00:00',
    result: 'success',
  },
  {
    id: '2',
    userId: 'user1',
    userName: '用户1',
    action: '提交',
    module: '声乐报名',
    description: '提交声乐作品报名表',
    ip: '192.168.1.100',
    timestamp: '2024-01-15 09:30:00',
    result: 'success',
  },
  {
    id: '3',
    userId: 'reviewer1',
    userName: '审核员1',
    action: '审核',
    module: '报名审核',
    description: '审核通过声乐作品报名表',
    ip: '192.168.1.101',
    timestamp: '2024-01-15 10:00:00',
    result: 'success',
  },
  {
    id: '4',
    userId: 'user2',
    userName: '用户2',
    action: '登录',
    module: '系统登录',
    description: '用户登录系统',
    ip: '192.168.1.102',
    timestamp: '2024-01-15 10:30:00',
    result: 'success',
  },
  {
    id: '5',
    userId: 'admin1',
    userName: '管理员1',
    action: '修改密码',
    module: '用户管理',
    description: '修改用户密码',
    ip: '192.168.1.103',
    timestamp: '2024-01-15 11:00:00',
    result: 'success',
  },
  {
    id: '6',
    userId: 'user3',
    userName: '用户3',
    action: '登录',
    module: '系统登录',
    description: '用户登录系统失败：密码错误',
    ip: '192.168.1.104',
    timestamp: '2024-01-15 11:30:00',
    result: 'failed',
  },
  {
    id: '7',
    userId: 'user1',
    userName: '用户1',
    action: '提交',
    module: '器乐报名',
    description: '提交器乐作品报名表失败：文件格式不支持',
    ip: '192.168.1.100',
    timestamp: '2024-01-15 12:00:00',
    result: 'failed',
  },
  {
    id: '8',
    userId: 'reviewer2',
    userName: '审核员2',
    action: '审核',
    module: '报名审核',
    description: '审核操作失败：网络连接超时',
    ip: '192.168.1.105',
    timestamp: '2024-01-15 12:30:00',
    result: 'failed',
  },
  {
    id: '9',
    userId: 'user2',
    userName: '用户2',
    action: '上传',
    module: '作品提交',
    description: '上传作品文件失败：文件大小超出限制',
    ip: '192.168.1.102',
    timestamp: '2024-01-15 13:00:00',
    result: 'failed',
  },
  {
    id: '10',
    userId: 'admin2',
    userName: '管理员2',
    action: '修改密码',
    module: '用户管理',
    description: '修改用户密码失败：旧密码不正确',
    ip: '192.168.1.106',
    timestamp: '2024-01-15 13:30:00',
    result: 'failed',
  },
  {
    id: '11',
    userId: 'user1',
    userName: '用户1',
    action: '保存',
    module: '表单暂存',
    description: '暂存表单数据失败：数据验证未通过',
    ip: '192.168.1.100',
    timestamp: '2024-01-15 14:00:00',
    result: 'failed',
  },
  {
    id: '12',
    userId: 'reviewer1',
    userName: '审核员1',
    action: '导出',
    module: '数据导出',
    description: '导出数据失败：系统繁忙，请稍后重试',
    ip: '192.168.1.101',
    timestamp: '2024-01-15 14:30:00',
    result: 'failed',
  },
]

const auditRecords: AuditRecord[] = []

/**
 * 获取所有操作日志
 */
export async function fetchOperationLogs(): Promise<OperationLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...operationLogs]
}

/**
 * 根据用户ID推断用户类型
 */
function getUserType(userId: string): 'user' | 'approval' | 'admin' | 'logaudit' | '' {
  if (userId.startsWith('user')) return 'user'
  if (userId.startsWith('reviewer')) return 'approval'
  if (userId.startsWith('admin')) return 'admin'
  if (userId.startsWith('logger')) return 'logaudit'
  return ''
}

/**
 * 获取日志统计
 */
export async function getLogStats(): Promise<{
  total: number
  todayCount: number
  totalByType: { user: number; approval: number; admin: number }
  todayCountByType: { user: number; approval: number; admin: number }
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // 计算今天的新增日志数
  const today = new Date()
  const todayStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const todayLogs = operationLogs.filter((log) => {
    const logDate = new Date(log.timestamp)
    const logDateStr = logDate.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return logDateStr === todayStr
  })

  // 按类型统计总数
  const totalByType = {
    user: 0,
    approval: 0,
    admin: 0,
  }

  // 按类型统计今日新增
  const todayCountByType = {
    user: 0,
    approval: 0,
    admin: 0,
  }

  operationLogs.forEach((log) => {
    const userType = getUserType(log.userId)
    if (userType === 'user') {
      totalByType.user++
    } else if (userType === 'approval') {
      totalByType.approval++
    } else if (userType === 'admin') {
      totalByType.admin++
    }
  })

  todayLogs.forEach((log) => {
    const userType = getUserType(log.userId)
    if (userType === 'user') {
      todayCountByType.user++
    } else if (userType === 'approval') {
      todayCountByType.approval++
    } else if (userType === 'admin') {
      todayCountByType.admin++
    }
  })

  return {
    total: operationLogs.length,
    todayCount: todayLogs.length,
    totalByType,
    todayCountByType,
  }
}

/**
 * 批量删除日志
 * @param logIds 要删除的日志ID数组
 * @param auditorId 审计员ID
 * @param auditorName 审计员姓名
 */
export async function deleteLogs(
  logIds: string[],
  auditorId: string,
  auditorName: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 删除日志
  operationLogs = operationLogs.filter((log) => !logIds.includes(log.id))

  // 创建审计记录
  const auditRecord: AuditRecord = {
    id: `audit-${Date.now()}`,
    auditorId,
    auditorName,
    action: '删除日志',
    targetType: 'log',
    targetId: logIds.join(','),
    targetContent: `删除了 ${logIds.length} 条日志，日志ID：${logIds.join(', ')}`,
    timestamp: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    description: `审计员 ${auditorName} 批量删除了 ${logIds.length} 条操作日志`,
  }

  auditRecords.push(auditRecord)

  return true
}

/**
 * 获取所有审计记录
 */
export async function fetchAuditRecords(): Promise<AuditRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...auditRecords]
}

/**
 * 添加操作日志（供其他模块调用）
 */
export function addOperationLog(log: Omit<OperationLog, 'id'>): void {
  const newLog: OperationLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
  operationLogs.unshift(newLog)

  // 限制日志数量，只保留最近1000条
  if (operationLogs.length > 1000) {
    operationLogs = operationLogs.slice(0, 1000)
  }
}

// 报名记录模拟数据
const registrations: Registration[] = [
  {
    id: 'reg1',
    workName: '春天来了',
    category: '声乐报名',
    submitterName: '用户1',
    submitTime: '2024-01-15 09:00:00',
    status: 'pending',
    school: 'A大学',
    region: '北京市',
    contactName: '张老师',
    contactPhone: '13800138001',
    description:
      '这是一首关于春天的合唱作品，展现了春天的美好景象和人们对春天的向往。作品旋律优美，情感真挚。',
  },
  {
    id: 'reg2',
    workName: '月光曲',
    category: '器乐报名',
    submitterName: '用户2',
    submitTime: '2024-01-15 10:00:00',
    status: 'pending',
    school: 'B大学',
    region: '上海市',
    contactName: '李老师',
    contactPhone: '13800138002',
    description:
      '经典器乐合奏作品，以月光为主题，表现夜晚的宁静与美好。演奏技巧精湛，音乐表现力强。',
  },
  {
    id: 'reg3',
    workName: '舞蹈风采',
    category: '舞蹈报名',
    submitterName: '用户1',
    submitTime: '2024-01-14 14:00:00',
    status: 'approved',
    reviewer: '审核员1',
    reviewTime: '2024-01-14 16:00:00',
    reviewComment: '审核通过',
    school: 'A大学',
    region: '北京市',
    contactName: '张老师',
    contactPhone: '13800138001',
    description: '一个展现青春活力的舞蹈作品，动作优美，表现力强。',
  },
  {
    id: 'reg4',
    workName: '戏曲选段',
    category: '戏曲报名',
    submitterName: '用户3',
    submitTime: '2024-01-14 11:00:00',
    status: 'rejected',
    reviewer: '审核员2',
    reviewTime: '2024-01-14 15:00:00',
    reviewComment: '资料不完整',
    school: 'C大学',
    region: '广东省',
    contactName: '刘老师',
    contactPhone: '13800138003',
    description: '传统戏曲选段表演，需要补充完整的资料。',
  },
  {
    id: 'reg5',
    workName: '朗诵作品',
    category: '朗诵报名',
    submitterName: '用户2',
    submitTime: '2024-01-13 09:30:00',
    status: 'approved',
    reviewer: '审核员1',
    reviewTime: '2024-01-13 11:00:00',
    reviewComment: '审核通过',
    school: 'B大学',
    region: '上海市',
    contactName: '李老师',
    contactPhone: '13800138002',
    description: '一篇富有感情的朗诵作品，表达深刻，声音洪亮。',
  },
  {
    id: 'reg6',
    workName: '书法作品',
    category: '书法作品',
    submitterName: '用户4',
    submitTime: '2024-01-15 08:00:00',
    status: 'pending',
    school: 'A大学',
    region: '北京市',
    contactName: '陈老师',
    contactPhone: '13800138004',
    description: '一幅传统书法作品，笔法娴熟，字体工整。',
  },
  {
    id: 'reg7',
    workName: '绘画作品',
    category: '绘画作品',
    submitterName: '用户1',
    submitTime: '2024-01-14 10:00:00',
    status: 'pending',
    school: 'A大学',
    region: '北京市',
    contactName: '王老师',
    contactPhone: '13800138007',
    description: '一幅展现校园生活的油画作品，色彩鲜明，构图巧妙，体现了学生们的艺术创作能力。',
  },
  {
    id: 'reg8',
    workName: '设计作品',
    category: '设计作品',
    submitterName: '用户5',
    submitTime: '2024-01-13 15:00:00',
    status: 'approved',
    reviewer: '审核员1',
    reviewTime: '2024-01-13 17:00:00',
    reviewComment: '设计优秀',
    school: 'D大学',
    region: '江苏省',
    contactName: '孙老师',
    contactPhone: '13800138005',
    description: '一个创新的设计作品，理念新颖，实用性强。',
  },
  {
    id: 'reg9',
    workName: '声乐作品2',
    category: '声乐报名',
    submitterName: '用户6',
    submitTime: '2024-01-14 16:00:00',
    status: 'pending',
    school: 'B大学',
    region: '上海市',
    contactName: '赵老师',
    contactPhone: '13800138009',
    description: '一首充满活力的声乐作品，展现了学生们的音乐才华和舞台表现力。',
  },
  {
    id: 'reg10',
    workName: '摄影作品',
    category: '摄影作品',
    submitterName: '用户7',
    submitTime: '2024-01-13 14:00:00',
    status: 'rejected',
    reviewer: '审核员2',
    reviewTime: '2024-01-13 18:00:00',
    reviewComment: '不符合要求',
    school: 'C大学',
    region: '广东省',
    contactName: '周老师',
    contactPhone: '13800138007',
    description: '一幅摄影作品，需要进一步改进以符合要求。',
  },
  {
    id: 'reg11',
    workName: '微电影作品',
    category: '微电影作品',
    submitterName: '用户8',
    submitTime: '2024-01-12 10:00:00',
    status: 'pending',
    school: 'E大学',
    region: '江苏省',
    contactName: '钱老师',
    contactPhone: '13800138011',
    description:
      '一部反映大学生活的微电影作品，情节紧凑，拍摄手法新颖，具有很好的观赏性和教育意义。',
  },
  {
    id: 'reg12',
    workName: '器乐作品2',
    category: '器乐报名',
    submitterName: '用户9',
    submitTime: '2024-01-12 14:00:00',
    status: 'approved',
    reviewer: '审核员1',
    reviewTime: '2024-01-12 16:00:00',
    reviewComment: '审核通过',
    school: 'E大学',
    region: '江苏省',
    contactName: '吴老师',
    contactPhone: '13800138009',
    description: '一首优秀的器乐作品，演奏技巧娴熟，音乐表现力强。',
  },
]

/**
 * 获取所有报名记录
 */
export async function fetchRegistrations(status?: RegistrationStatus): Promise<Registration[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  let result = [...registrations]

  if (status !== undefined) {
    result = result.filter((r) => r.status === status)
  }

  return result
}

/**
 * 获取待审核报名记录
 */
export async function fetchPendingRegistrations(): Promise<Registration[]> {
  return fetchRegistrations('pending')
}

/**
 * 审核通过
 */
export async function approveRegistration(
  id: string,
  reviewerId: string,
  reviewerName: string,
  comment?: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const registration = registrations.find((r) => r.id === id)
  if (!registration) {
    return false
  }

  registration.status = 'approved'
  registration.reviewer = reviewerName
  registration.reviewTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  registration.reviewComment = comment || '审核通过'

  return true
}

/**
 * 审核驳回
 */
export async function rejectRegistration(
  id: string,
  reviewerId: string,
  reviewerName: string,
  comment: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const registration = registrations.find((r) => r.id === id)
  if (!registration) {
    return false
  }

  registration.status = 'rejected'
  registration.reviewer = reviewerName
  registration.reviewTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  registration.reviewComment = comment

  return true
}

/**
 * 按学校分组统计数据
 */
function getStatsBySchool(
  regs: Registration[],
  regionFilter?: string,
): Record<
  string,
  {
    total: number
    pending: number
    approved: number
    unReviewed: number
    region: string
  }
> {
  const stats: Record<
    string,
    {
      total: number
      pending: number
      approved: number
      unReviewed: number
      region: string
    }
  > = {}

  // 如果指定了地区筛选，先过滤
  const filteredRegs = regionFilter ? regs.filter((reg) => reg.region === regionFilter) : regs

  filteredRegs.forEach((reg) => {
    const school = reg.school || '未知学校'
    if (!stats[school]) {
      stats[school] = {
        total: 0,
        pending: 0,
        approved: 0,
        unReviewed: 0,
        region: reg.region || '未知地区',
      }
    }

    stats[school].total++

    if (reg.status === 'pending') {
      stats[school].pending++
    } else if (reg.status === 'approved' || reg.status === 'rejected') {
      stats[school].approved++
    } else {
      stats[school].unReviewed++
    }
  })

  return stats
}

/**
 * 获取所有地区列表
 */
export function getAllRegions(): string[] {
  const regions = new Set<string>()
  registrations.forEach((reg) => {
    if (reg.region) {
      regions.add(reg.region)
    }
  })
  return Array.from(regions).sort()
}

/**
 * 获取报名统计
 */
export async function getRegistrationStats(regionFilter?: string): Promise<{
  total: number
  pending: number
  approved: number
  unReviewed: number
  bySchool: Record<
    string,
    {
      total: number
      pending: number
      approved: number
      unReviewed: number
      region: string
    }
  >
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // 如果指定了地区筛选，先过滤
  const filteredRegs = regionFilter
    ? registrations.filter((r) => r.region === regionFilter)
    : registrations

  const total = filteredRegs.length
  const pending = filteredRegs.filter((r) => r.status === 'pending').length
  const approved = filteredRegs.filter(
    (r) => r.status === 'approved' || r.status === 'rejected',
  ).length
  const unReviewed = filteredRegs.filter((r) => !r.status || r.status === 'pending').length

  const bySchool = getStatsBySchool(registrations, regionFilter)

  return {
    total,
    pending,
    approved,
    unReviewed,
    bySchool,
  }
}

// 页面类型定义
export type PageType =
  | 'vocal' // 声乐报名
  | 'instrumental' // 器乐报名
  | 'dance' // 舞蹈报名
  | 'opera' // 戏曲报名
  | 'recitation' // 朗诵报名
  | 'calligraphy' // 书法作品
  | 'painting' // 绘画作品
  | 'design' // 设计作品
  | 'photography' // 摄影作品
  | 'microfilm' // 微电影作品
  | 'artPractice' // 艺术实践工作坊报名
  | 'aestheticInnovation' // 美育改革创新优秀案例申报

/**
 * 获取指定页面类型的人数限制
 * @param pageType 页面类型
 * @returns 最大人数限制，如果未设置则返回undefined
 */
export function getMaxMemberCount(pageType: PageType): number | undefined {
  try {
    const saved = localStorage.getItem('pageMaxMemberCounts')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed[pageType]
    }
  } catch (e) {
    console.error('Failed to parse max member counts:', e)
  }
  return undefined
}

/**
 * 根据页面类型和类别值获取该类别的人数限制
 * @param pageType 页面类型
 * @param categoryValue 类别值（如 'chorus', 'ensemble' 等）
 * @returns 该类别的人数限制，如果未设置则返回undefined
 */
export function getCategoryMemberLimit(
  pageType: PageType,
  categoryValue: string,
): number | undefined {
  try {
    const saved = localStorage.getItem('pageCategories')
    if (saved) {
      const parsed = JSON.parse(saved)
      const categories = parsed[pageType] || []
      const category = categories.find(
        (cat: { value: string; maxMemberCount?: number }) => cat.value === categoryValue,
      )
      return category?.maxMemberCount
    }
  } catch (e) {
    console.error('Failed to parse category member limits:', e)
  }
  return undefined
}

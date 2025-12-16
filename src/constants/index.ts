// 全局常量定义
// Global Constants

import type { UserRole, MenuItem } from '@/types'

// 用户角色常量
export const USER_ROLES: Record<UserRole, string> = {
  user: '用户',
  reviewer: '审核员',
  admin: '管理员',
  logger: '日志员',
  approval: '审批员',
  logaudit: '日志审计员'
}

// 菜单配置
export const MENU_CONFIG: Record<UserRole, MenuItem[]> = {
  user: [
    { index: '/user/info', title: '学生基本信息' },
    { index: '/user/student-basic', title: '学生基本功展示报名' },
    { index: '/user/teacher-basic', title: '教师基本功展示报名' },
    { index: '/user/student-stats', title: '学生基本功报名信息统计' },
    { index: '/user/teacher-stats', title: '教师基本功报名信息统计' }
  ],
  reviewer: [
    { index: '/reviewer/home', title: '审核首页' },
    { index: '/reviewer/approve', title: '报名审核' },
    { index: '/reviewer/schools', title: '学校管理' }
  ],
  admin: [
    { index: '/admin/home', title: '管理首页' },
    { index: '/admin/students', title: '学生管理' },
    { index: '/admin/teachers', title: '教师管理' },
    { index: '/admin/settings', title: '系统设置' }
  ],
  logger: [
    { index: '/logger/home', title: '日志记录' }
  ],
  approval: [
    { index: '/approval/home', title: '审批首页' },
    { index: '/approval/pending', title: '待审批项目' },
    { index: '/approval/history', title: '审批历史' }
  ],
  logaudit: [
    { index: '/logaudit/home', title: '日志审计' },
    { index: '/logaudit/logs', title: '日志查看' },
    { index: '/logaudit/audit', title: '审计记录' }
  ]
}

// 表单验证规则
export const VALIDATION_RULES = {
  required: (message: string) => ({
    required: true,
    message,
    trigger: 'blur'
  }),
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址',
    trigger: 'blur',
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号',
    trigger: 'blur',
  },
  idCard: {
    pattern: /^\d{17}[\dXx]$/,
    message: '请输入有效的身份证号',
    trigger: 'blur',
  }
}

// 表格配置
export const TABLE_CONFIG = {
  defaultPageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xlsx', '.xls'],
  maxCount: 5
}

// Excel模板配置
export const EXCEL_TEMPLATES = {
  studentInfo: {
    filename: '学生基本信息模板.xlsx',
    headers: ['姓名', '性别', '民族', '身份证号码', '班级', '学籍号', '学段', '是否为种子选手', '备注']
  },
  teacherInfo: {
    filename: '教师基本信息模板.xlsx',
    headers: ['姓名', '性别', '民族', '身份证号码', '院系', '职务', '手机', '邮箱', '学段', '是否为种子选手', '备注']
  }
}

// 状态常量
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DRAFT: 'draft'
} as const

export const STATUS_LABELS = {
  [STATUS.PENDING]: '待审核',
  [STATUS.APPROVED]: '已通过',
  [STATUS.REJECTED]: '已拒绝',
  [STATUS.DRAFT]: '草稿'
} as const

// 性别选项
export const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

// 学段选项
export const STAGE_OPTIONS = [
  { label: '本科', value: '本科' },
  { label: '专科', value: '专科' }
]

// 是否选项
export const YES_NO_OPTIONS = [
  { label: '是', value: '是' },
  { label: '否', value: '否' }
]

// 民族选项（常用）
export const NATION_OPTIONS = [
  { label: '汉族', value: '汉族' },
  { label: '蒙古族', value: '蒙古族' },
  { label: '回族', value: '回族' },
  { label: '藏族', value: '藏族' },
  { label: '维吾尔族', value: '维吾尔族' },
  { label: '苗族', value: '苗族' },
  { label: '彝族', value: '彝族' },
  { label: '壮族', value: '壮族' },
  { label: '布依族', value: '布依族' },
  { label: '朝鲜族', value: '朝鲜族' },
  { label: '满族', value: '满族' },
  { label: '侗族', value: '侗族' },
  { label: '瑶族', value: '瑶族' },
  { label: '白族', value: '白族' },
  { label: '土家族', value: '土家族' },
  { label: '哈尼族', value: '哈尼族' },
  { label: '哈萨克族', value: '哈萨克族' },
  { label: '傣族', value: '傣族' },
  { label: '黎族', value: '黎族' },
  { label: '傈僳族', value: '傈僳族' },
  { label: '佤族', value: '佤族' },
  { label: '畲族', value: '畲族' },
  { label: '高山族', value: '高山族' },
  { label: '拉祜族', value: '拉祜族' },
  { label: '水族', value: '水族' },
  { label: '东乡族', value: '东乡族' },
  { label: '纳西族', value: '纳西族' },
  { label: '景颇族', value: '景颇族' },
  { label: '柯尔克孜族', value: '柯尔克孜族' },
  { label: '土族', value: '土族' },
  { label: '达斡尔族', value: '达斡尔族' },
  { label: '仫佬族', value: '仫佬族' },
  { label: '羌族', value: '羌族' },
  { label: '布朗族', value: '布朗族' },
  { label: '撒拉族', value: '撒拉族' },
  { label: '毛南族', value: '毛南族' },
  { label: '仡佬族', value: '仡佬族' },
  { label: '锡伯族', value: '锡伯族' },
  { label: '阿昌族', value: '阿昌族' },
  { label: '普米族', value: '普米族' },
  { label: '塔吉克族', value: '塔吉克族' },
  { label: '怒族', value: '怒族' },
  { label: '乌孜别克族', value: '乌孜别克族' },
  { label: '俄罗斯族', value: '俄罗斯族' },
  { label: '鄂温克族', value: '鄂温克族' },
  { label: '德昂族', value: '德昂族' },
  { label: '保安族', value: '保安族' },
  { label: '裕固族', value: '裕固族' },
  { label: '京族', value: '京族' },
  { label: '塔塔尔族', value: '塔塔尔族' },
  { label: '独龙族', value: '独龙族' },
  { label: '鄂伦春族', value: '鄂伦春族' },
  { label: '赫哲族', value: '赫哲族' },
  { label: '门巴族', value: '门巴族' },
  { label: '珞巴族', value: '珞巴族' },
  { label: '基诺族', value: '基诺族' }
]

// 路由白名单
export const ROUTE_WHITE_LIST = ['/login', '/403', '/404']

// 本地存储键名
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_ROLE: 'role',
  USER_TOKEN: 'token',
  USER_PERMISSIONS: 'permissions',
  USER_TOKEN_EXPIRE: 'token_exp'
} as const

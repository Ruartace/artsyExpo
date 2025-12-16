// 全局类型定义
// Global Type Definitions

// 用户相关类型
export type UserRole = 'user' | 'reviewer' | 'admin' | 'logger' | 'approval' | 'logaudit'

export interface User {
  userId: string
  role: UserRole
  token: string
  permissions: string[]
}

export interface LoginForm {
  account: string
  password: string
}

export interface ChangePasswordForm {
  oldPwd: string
  newPwd: string
  confirmPwd: string
}

// 学生信息相关类型
export interface StudentInfo {
  name: string
  gender: '男' | '女'
  nation: string
  idNo: string
  className: string
  studentNo: string
  stage?: '本科' | '专科'
  isSeed?: '是' | '否'
  remark: string
}

export interface LeaderForm {
  name: string
  gender: '男' | '女'
  deptAndTitle: string
  phone: string
  landline: string
  email: string
}

export interface StudentRow extends StudentInfo {
  index: number
}

// 教师信息相关类型
export interface TeacherInfo {
  name: string
  gender: '男' | '女'
  nation: string
  idNo: string
  department: string
  title: string
  phone: string
  email: string
  stage?: '本科' | '专科'
  isSeed?: '是' | '否'
  remark: string
}

export interface TeacherRow extends TeacherInfo {
  index: number
}

// 基本功展示相关类型
export interface BasicDisplayStudent {
  name: string
  gender: '男' | '女'
  nation: string
  idNo: string
  className: string
  studentNo: string
  stage: '本科' | '专科'
  isSeed: '是' | '否'
  teachingDesign: string
  teachingVideo: string
  photo: string
  remark: string
}

export interface BasicDisplayStudentRow extends BasicDisplayStudent {
  index: number
}

// 表格相关类型
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  formatter?: (row: Record<string, unknown>, column: TableColumn, cellValue: unknown) => string
}

// 搜索相关类型
export interface SearchConfig {
  keyword: string
  placeholder?: string
  clearable?: boolean
}

// 分页相关类型
export interface PaginationConfig {
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
  layout?: string
}

// 表单验证相关类型
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: Record<string, unknown>, value: unknown, callback: (error?: string) => void) => void
}

// API响应相关类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  code: number
  message: string
  data: {
    list: T[]
    total: number
    currentPage: number
    pageSize: number
  }
  success: boolean
}

// 文件上传相关类型
export interface UploadFile {
  name: string
  url: string
  status: 'ready' | 'uploading' | 'success' | 'fail'
  percentage?: number
  raw?: File
}

// 菜单相关类型
export interface MenuItem {
  index: string
  title: string
  icon?: string
  children?: MenuItem[]
}

// 路由相关类型
export interface RouteMeta {
  title?: string
  roles?: UserRole[]
  requiresAuth?: boolean
  layout?: string
}

// 统计相关类型
export interface StatisticsItem {
  label: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
}

// 导出相关类型
export interface ExportConfig {
  filename: string
  headers: string[]
  data: Record<string, unknown>[]
  sheetName?: string
}

// 标签页相关类型
export type { TabItem, TabsState } from './tabs'

// 操作日志类型
export interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  description: string
  ip: string
  timestamp: string
  result: string
}

// 审计记录类型
export interface AuditRecord {
  id: string
  auditorId: string
  auditorName: string
  action: string
  targetType: string
  targetId: string
  targetContent: string
  timestamp: string
  description: string
}

// 报名记录类型
export interface Registration {
  id: string
  workName: string
  category: string
  submitterName: string
  submitTime: string
  status: RegistrationStatus
  school: string
  region: string
  contactName: string
  contactPhone: string
  description: string
  reviewer?: string
  reviewTime?: string
  reviewComment?: string
}

// 报名状态类型
export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

import { httpPost, httpGet, httpPatch } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的书法/篆刻作品数据结构
 */
export interface CalligraphySubmission {
  id: number
  title: string
  description: string
  height_cm: number | null // 原 artwork_length
  width_cm: number | null // 原 artwork_width
  creation_time: string // 原 creation_date
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  // is_original: boolean // 后端数据暂未包含
  calligraphy_type_name: string // 原 performance_form
  calligraphy_type_id?: number // 原 performance_form_id
  group_name?: string // 原 group
  group_id?: number
  artwork_file: string | null // 原 image_file
  status: string
  rejection_reason: string | null
  user_id: number
  created_at: string
  updated_at: string
  students?: CalligraphyParticipant[] // 原 authors
  instructor_name?: string // 原 tutor_name
  // 兼容旧字段/前端兼容
  performance_form?: string
  performance_form_id?: number
  artwork_length?: number
  artwork_width?: number
  creation_date?: string
  group?: string
  tutor_name?: string
  image_file?: string | null
}

export interface CalligraphyParticipant {
  id: number
  name: string
  gender: 'male' | 'female' | null
  id_card: string
  ethnicity?: string // 后端返回暂无
  age?: number // 后端返回暂无
  contact: string | null
  role?: 'author' | 'tutor' // 后端返回暂无
  submission_id: number | null
  grade?: string // 后端返回暂无
  student_id?: string | null
  school?: string // 后端返回暂无
}

export interface CalligraphyCategory {
  id: number
  name: string
  code?: string
  is_active?: number | boolean
}

export interface GroupCategory {
  id: number
  code: string
  name: string
  is_active: boolean
  order: number
}

/**
 * 辅助函数：适配列表响应（支持直接数组、分页results等结构）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptListResponse<T>(res: any): HttpResponse<T[]> {
  let list: T[] = []
  if (res.data && Array.isArray(res.data)) {
    list = res.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (res.data && Array.isArray((res.data as any).data)) {
    // 处理后端返回 { success: true, data: [...] } 的嵌套结构
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list = (res.data as any).data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (res.data && Array.isArray((res.data as any).results)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list = (res.data as any).results
  } else if (res.results && Array.isArray(res.results)) {
    // 处理直接返回分页结果的情况
    list = res.results
  } else if (Array.isArray(res)) {
    // 处理直接返回数组的情况
    list = res
  }

  // 构造标准的 HttpResponse
  return {
    code: res.code || 200,
    message: res.message || res.msg || 'success',
    data: list,
  }
}

/**
 * 提交/暂存书法/篆刻作品报名
 */
export async function saveCalligraphySubmission(data: {
  id?: number | string
  title: string
  description: string
  height_cm?: number | null
  width_cm?: number | null
  creation_time: string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  calligraphy_type_name?: string
  calligraphy_type_id?: number | string
  group_name?: string
  group_id?: number | string
  instructor_name?: string
  artwork_file?: string | null
}): Promise<HttpResponse<CalligraphySubmission>> {
  if (data.id) {
    return httpPatch<CalligraphySubmission>(`/calligraphy/applications/${data.id}/`, data)
  }
  return httpPost<CalligraphySubmission>('/calligraphy/applications/', data)
}

/**
 * 获取书法/篆刻作品报名详情
 */
export async function getCalligraphySubmission(
  id: number | string,
): Promise<HttpResponse<CalligraphySubmission>> {
  return httpGet<CalligraphySubmission>(`/calligraphy/applications/${id}/`)
}

/**
 * 获取书法/篆刻作品报名列表
 */
export async function getCalligraphySubmissionList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<CalligraphySubmission[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return httpGet<any>('/calligraphy/applications/', params).then((res) =>
    adaptListResponse<CalligraphySubmission>(res),
  )
}

/**
 * 正式提交报名表
 */
export async function submitCalligraphySubmission(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/craftwork/applications/${id}/submit/`)
}

/**
 * 上传书法/篆刻作品文件
 */
export async function uploadCalligraphyFile(
  submissionId: number | string,
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('artwork_file', file) // 注意：后端返回是 artwork_file，上传字段名可能也变了，保险起见改为 artwork_file，或者需要确认上传接口定义。之前是 image_file。这里根据返回字段 artwork_file 猜测上传也是 artwork_file。
  return httpPost<void>(`/calligraphy/submissions/${submissionId}/upload/`, formData)
}

/**
 * 添加书法/篆刻作品相关人员 (作者)
 */
export async function addCalligraphyAuthor(
  submissionId: number | string,
  data: {
    name: string
    gender: 'male' | 'female'
    id_card: string
    ethnicity?: string
    age?: number
    contact: string
    role?: string
    grade?: string
    student_id?: string
    school?: string
  },
): Promise<HttpResponse<CalligraphyParticipant>> {
  return httpPost<CalligraphyParticipant>(
    `/calligraphy/participant/${submissionId}/add-student/`,
    data,
  )
}

/**
 * 删除书法/篆刻作品相关人员
 */
export async function deleteCalligraphyParticipant(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/calligraphy/participants/${id}/delete/`)
}

/**
 * 获取书法/篆刻作品相关人员
 */
export async function getCalligraphyParticipants(
  applicationId: number | string,
): Promise<HttpResponse<CalligraphyParticipant[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return httpGet<any>(`/calligraphy/applications/${applicationId}/`).then((res) => {
    // 假设后端返回的 structure 中，participants 数据在 students 字段中
    // 根据之前的 interface 定义：students?: CalligraphyParticipant[]
    const data = res.data || res
    const list = data.students || []
    return {
      code: res.code || 200,
      message: res.message || 'success',
      data: list,
    }
  })
}

/**
 * 获取书法/篆刻作品类型列表
 */
export async function getCalligraphyCategories(): Promise<HttpResponse<CalligraphyCategory[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return httpGet<any>('/calligraphy/get-calligraphy-categories/').then((res) =>
    adaptListResponse<CalligraphyCategory>(res),
  )
}

/**
 * 获取组别分类列表 (复用通用的)
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return httpGet<any>('/competition-configs/admin/group-categories/').then((res) =>
    adaptListResponse<GroupCategory>(res),
  )
}

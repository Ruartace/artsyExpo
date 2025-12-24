import { httpPost, httpGet } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的朗诵作品数据结构
 */
export interface RecitationSubmission {
  id: number
  title: string
  description: string
  duration?: number // 兼容
  duration_minutes?: number
  duration_seconds?: number
  performance_type?: string // 兼容前端
  performance_type_id?: number // 兼容
  performance_form_id?: number
  performance_form_name?: string
  group?: string // 兼容前端
  group_id?: number
  group_name?: string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  is_original: boolean
  performer_count: number
  status: string
  rejection_reason?: string | null
  user_id: number
  created_at: string
  updated_at: string
  image_file?: string | null
  video_file?: string | null
  // 关联信息
  participants?: RecitationParticipant[]
  teachers?: RecitationParticipant[]
  students?: RecitationParticipant[]
}

export interface RecitationParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity?: string
  role: 'teacher' | 'student' | 'student_accompanist' | 'teacher_accompanist' | 'accompanist'
  submission_id: number | null
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
  phone?: string
  contact?: string // 后端返回的是 contact
  title?: string // 职称
  org?: string // 单位
  age?: number
  grade?: string
  student_id?: string
}

export interface RecitationCategory {
  id: number
  name: string
  code?: string
}

export interface GroupCategory {
  id: number
  code: string
  name: string
  is_active: boolean
  order: number
}

/**
 * 提交/暂存朗诵作品报名
 */
export async function saveRecitationSubmission(data: {
  id?: number | string
  title: string
  description: string
  duration?: number
  performance_type?: string
  performance_type_id?: number | string
  performance_form_id?: number | string
  group?: string
  group_id?: number | string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  performer_count: number
  is_original: boolean
  image_file?: string | null
}): Promise<HttpResponse<RecitationSubmission>> {
  return httpPost<RecitationSubmission>('/recitationperformance/applications/', data)
}

/**
 * 获取朗诵作品报名详情
 */
export async function getRecitationSubmission(
  id: number | string,
): Promise<HttpResponse<RecitationSubmission>> {
  return httpGet<RecitationSubmission>(`/recitationperformance/applications/${id}/`)
}

/**
 * 获取朗诵作品报名列表
 */
export async function getRecitationSubmissionList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<RecitationSubmission[]>> {
  return httpGet<RecitationSubmission[]>('/recitationperformance/applications/', params)
}

/**
 * 正式提交报名表
 */
export async function submitRecitationSubmission(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/recitationperformance/applications/${id}/submit/`)
}

/**
 * 上传朗诵作品文件
 */
export async function uploadRecitationFile(
  submissionId: number | string,
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('image_file', file)
  return httpPost<void>(`/recitationperformance/submissions/${submissionId}/upload/`, formData)
}

/**
 * 添加朗诵作品相关人员
 */
export async function addRecitationParticipant(
  submissionId: number | string,
  data: {
    name: string
    gender: 'male' | 'female'
    id_card: string
    ethnicity: string
    role: string
    phone?: string
    major?: string
    region?: string
    school?: string
    dept?: string
    instrument?: string
    title?: string
    org?: string
    age?: number
    grade?: string
    student_id?: string
  },
): Promise<HttpResponse<RecitationParticipant>> {
  return httpPost<RecitationParticipant>(
    `/recitationperformance/participant/${submissionId}/add-participant/`,
    data,
  )
}

/**
 * 删除朗诵作品相关人员
 */
export async function deleteRecitationParticipant(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/recitationperformance/participants/${id}/delete/`)
}

/**
 * 获取朗诵作品类型列表
 */
export async function getRecitationCategories(): Promise<HttpResponse<RecitationCategory[]>> {
  return httpGet<RecitationCategory[]>(
    '/recitationperformance/get-recitationperformance-categories/',
  )
}

/**
 * 获取组别分类列表
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

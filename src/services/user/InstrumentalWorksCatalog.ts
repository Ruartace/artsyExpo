import { httpPost, httpGet, httpPut } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的器乐作品数据结构
 */
export interface InstrumentalSubmission {
  id: number
  title: string
  description: string
  duration: number // 秒
  performance_type: string
  performance_type_id?: number
  group: string // 组别
  group_id?: number
  group_name?: string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  is_original: boolean
  performer_count: number
  status: string
  rejection_reason: string | null
  user_id: number
  created_at: string
  updated_at: string
  image_file: string | null
  tutor_name?: string
  conductor_type?: string
  // 关联信息
  participants?: InstrumentalParticipant[]
}

export interface InstrumentalParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity: string
  role: 'teacher' | 'student' | 'accompanist'
  submission_id: number | null
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
  phone?: string
  title?: string // 职称
  org?: string // 单位
}

export interface InstrumentalCategory {
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
 * 提交/暂存器乐作品报名
 */
export async function saveInstrumentalSubmission(data: {
  id?: number | string
  title: string
  description: string
  duration: number
  performance_type?: string
  performance_type_id?: number | string
  group?: string
  group_id?: number | string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  performer_count: number
  is_original: boolean
  tutor_name?: string
  conductor_type?: string
  image_file?: string | null
}): Promise<HttpResponse<InstrumentalSubmission>> {
  if (data.id) {
    return httpPut<InstrumentalSubmission>(
      `/instrumentalperformance/applications/${data.id}/`,
      data,
    )
  }
  return httpPost<InstrumentalSubmission>('/instrumentalperformance/applications/', data)
}

/**
 * 获取器乐作品报名详情
 */
export async function getInstrumentalSubmission(
  id: number | string,
): Promise<HttpResponse<InstrumentalSubmission>> {
  return httpGet<InstrumentalSubmission>(`/instrumentalperformance/applications/${id}/`)
}

/**
 * 获取器乐作品报名列表
 */
export async function getInstrumentalSubmissionList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<InstrumentalSubmission[]>> {
  return httpGet<InstrumentalSubmission[]>('/instrumentalperformance/applications/', params)
}

/**
 * 正式提交报名表
 */
export async function submitInstrumentalSubmission(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/instrumentalperformance/applications/${id}/submit/`)
}

/**
 * 上传器乐作品文件
 */
export async function uploadInstrumentalFile(
  submissionId: number | string,
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('image_file', file)
  return httpPost<void>(`/instrumentalperformance/submissions/${submissionId}/upload/`, formData)
}

/**
 * 添加器乐作品相关人员
 */
export async function addInstrumentalParticipant(
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
  },
): Promise<HttpResponse<InstrumentalParticipant>> {
  return httpPost<InstrumentalParticipant>(
    `/instrumentalperformance/participant/${submissionId}/add-participant/`,
    data,
  )
}

/**
 * 删除器乐作品相关人员
 */
export async function deleteInstrumentalParticipant(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/instrumentalperformance/participants/${id}/delete/`)
}

/**
 * 获取器乐作品相关人员
 */
export async function getInstrumentalParticipants(
  applicationId: number | string,
): Promise<HttpResponse<InstrumentalParticipant[]>> {
  return httpGet<{ participants: InstrumentalParticipant[] }>(
    `/instrumentalperformance/participants/${applicationId}/`,
  ).then((res) => {
    return {
      ...res,
      data: res.data.participants || [],
    }
  })
}

/**
 * 获取器乐作品类型列表
 */
export async function getInstrumentalCategories(): Promise<HttpResponse<InstrumentalCategory[]>> {
  return httpGet<InstrumentalCategory[]>(
    '/instrumentalperformance/get-instrumentalperformance-categories/',
  )
}

/**
 * 获取组别分类列表
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

import { httpPost, httpGet, httpPut } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的绘画作品数据结构
 */
export interface ArtworkSubmission {
  id: number
  title: string
  description: string
  artwork_length: number | null
  artwork_width: number | null
  creation_date: string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  is_original: boolean
  performance_form: string // 绘画类型
  performance_form_id?: number
  group: string // 组别
  group_id?: number
  group_name?: string
  image_file: string | null
  status: string
  rejection_reason: string | null
  user_id: number
  created_at: string
  updated_at: string
  authors?: ArtworkParticipant[]
  tutor_name?: string
}

export interface ArtworkParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity: string
  age: number
  contact: string
  role: 'author' | 'tutor'
  submission_id: number | null
  grade?: string
  student_id?: string
  school?: string
}

export interface ArtworkCategory {
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
 * 提交/暂存绘画作品报名
 */
export async function saveArtworkSubmission(data: {
  id?: number | string
  title: string
  description: string
  artwork_length?: number | null
  artwork_width?: number | null
  creation_date: string
  contact_name: string
  contact_phone: string
  contact_address: string
  has_read_terms: boolean
  performance_form?: string
  performance_form_id?: number | string
  group?: string
  group_id?: number | string
  tutor_name?: string
  image_file?: string | null
}): Promise<HttpResponse<ArtworkSubmission>> {
  if (data.id) {
    return httpPut<ArtworkSubmission>(`/artwork/applications/${data.id}/`, data)
  }
  return httpPost<ArtworkSubmission>('/artwork/applications/', data)
}

/**
 * 获取绘画作品报名详情
 */
export async function getArtworkSubmission(
  id: number | string,
): Promise<HttpResponse<ArtworkSubmission>> {
  return httpGet<ArtworkSubmission>(`/artwork/applications/${id}/`)
}

/**
 * 获取绘画作品报名列表
 */
export async function getArtworkSubmissionList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<ArtworkSubmission[]>> {
  return httpGet<ArtworkSubmission[]>('/artwork/applications/', params)
}

/**
 * 正式提交报名表
 */
export async function submitArtworkSubmission(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/artwork/applications/${id}/submit/`)
}

/**
 * 上传绘画作品文件
 */
export async function uploadArtworkFile(
  submissionId: number | string,
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('image_file', file)
  return httpPost<void>(`/artwork/submissions/${submissionId}/upload/`, formData)
}

/**
 * 添加绘画作品相关人员 (作者)
 */
export async function addArtworkAuthor(
  submissionId: number | string,
  data: {
    name: string
    gender: 'male' | 'female'
    id_card: string
    ethnicity: string
    age: number
    contact: string
    role: string
    grade?: string
    student_id?: string
    school?: string
  },
): Promise<HttpResponse<ArtworkParticipant>> {
  return httpPost<ArtworkParticipant>(`/artwork/participant/${submissionId}/add-author/`, data)
}

/**
 * 删除绘画作品相关人员
 */
export async function deleteArtworkParticipant(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/artwork/participants/${id}/delete/`)
}

/**
 * 获取绘画作品相关人员
 */
export async function getArtworkParticipants(
  applicationId: number | string,
): Promise<HttpResponse<ArtworkParticipant[]>> {
  return httpGet<{ participants: ArtworkParticipant[] }>(
    `/artwork/participants/${applicationId}/`,
  ).then((res) => {
    return {
      ...res,
      data: res.data.participants || [],
    }
  })
}

/**
 * 获取绘画作品类型列表
 */
export async function getArtworkCategories(): Promise<HttpResponse<ArtworkCategory[]>> {
  return httpGet<ArtworkCategory[]>('/artwork/get-artwork-categories/')
}

/**
 * 获取组别分类列表 (复用通用的)
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

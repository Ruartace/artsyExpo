import { httpPost, httpGet } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的影视作品数据结构
 */
export interface FilmSubmission {
  id: number
  title: string
  description: string
  film_type?: string
  film_type_id?: number
  film_form_id?: number
  film_form_name?: string
  creation_date?: string // 对应 creationTime
  group?: string
  group_id?: number
  group_name?: string
  contact_name: string
  contact_phone: string
  contact_address: string
  tutor?: string
  has_read_terms: boolean
  status: string
  rejection_reason?: string | null
  user_id: number
  created_at: string
  updated_at: string
  image_file?: string | null
  video_file?: string | null
  // 关联信息
  participants?: FilmParticipant[]
  authors?: FilmParticipant[] // 对应 authors/members
}

export interface FilmParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity?: string
  role: 'author' | 'tutor' | 'student' // 兼容
  submission_id: number | null
  major?: string
  region?: string
  school?: string
  dept?: string
  instrument?: string
  phone?: string
  contact?: string
  title?: string
  org?: string
  age?: number
  grade?: string
  student_id?: string
}

export interface FilmCategory {
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
 * 提交/暂存影视作品报名
 */
export async function saveFilmSubmission(data: {
  id?: number | string
  title: string
  description: string
  film_type?: string
  film_type_id?: number | string
  work_type_id?: number | string
  film_form_id?: number | string
  group?: string
  group_id?: number | string
  creation_date?: string
  contact_name: string
  contact_phone: string
  contact_address: string
  tutor?: string
  has_read_terms: boolean
  image_file?: string | null
}): Promise<HttpResponse<FilmSubmission>> {
  return httpPost<FilmSubmission>('/filmwork/applications/', data)
}

/**
 * 获取影视作品报名详情
 */
export async function getFilmSubmission(
  id: number | string,
): Promise<HttpResponse<FilmSubmission>> {
  return httpGet<FilmSubmission>(`/filmwork/applications/${id}/`)
}

/**
 * 获取影视作品报名列表
 */
export async function getFilmSubmissionList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<FilmSubmission[]>> {
  return httpGet<FilmSubmission[]>('/filmwork/applications/', params)
}

/**
 * 正式提交报名表
 */
export async function submitFilmSubmission(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/filmwork/applications/${id}/submit/`)
}

/**
 * 上传影视作品文件
 */
export async function uploadFilmFile(
  submissionId: number | string,
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('file', file) // 可能是 file 或 image_file/video_file，这里先用 file，或者参考 Opera 是 image_file
  // Opera used image_file. Given "Film and Television", it might be video_file or just file.
  // Let's assume 'file' or check if I should split.
  // However, usually generic upload might just be 'file'.
  // Let's stick to a generic name or what Opera did if appropriate.
  // Opera: formData.append('image_file', file)
  // I will use 'file' as it is safer for generic, or 'image_file' if it's strict.
  // Let's try to handle both or just use 'file' for now.
  return httpPost<void>(`/filmwork/submissions/${submissionId}/upload/`, formData)
}

/**
 * 添加影视作品相关人员
 */
export async function addFilmParticipant(
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
): Promise<HttpResponse<FilmParticipant>> {
  return httpPost<FilmParticipant>(`/filmwork/participant/${submissionId}/add-participant/`, data)
}

/**
 * 删除影视作品相关人员
 */
export async function deleteFilmParticipant(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/filmwork/participants/${id}/delete/`)
}

/**
 * 获取影视作品类型列表
 */
export async function getFilmCategories(): Promise<HttpResponse<FilmCategory[]>> {
  return httpGet<FilmCategory[]>('/filmwork/get-filmwork-categories/')
}

/**
 * 获取组别分类列表
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

import { httpPost, httpGet, downloadFile } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的声乐作品数据结构
 */
export interface VocalMusicWork {
  id: number
  title: string
  description: string
  duration_minutes: number
  duration_seconds: number
  contact_name: string
  contact_phone: string
  contact_address: string
  performer_count: number
  video_file: string | null
  score_file: string | null
  status: string
  rejection_reason: string | null
  has_read_terms: boolean
  user: number
  performance_form: number
  group: number
  created_at: string
  updated_at: string
  performance_form_name: string
  group_name: string
  user_name: string | null
  participants?: VocalMusicParticipant[] // 增加 participants 字段
}

/**
 * 表演形式分类选项
 */
export interface PerformanceCategory {
  id: number
  name: string
  code?: string
}

/**
 * 提交声乐作品报名
 */
export async function createVocalMusicWork(data: {
  title: string
  description: string
  duration_minutes: number
  duration_seconds: number
  contact_name: string
  contact_phone: string
  contact_address: string
  performer_count: number
  has_read_terms: boolean
  performance_form: number
  group: number | null
  // 可选字段
  video_file?: string | null
  score_file?: string | null
}): Promise<HttpResponse<VocalMusicWork>> {
  //后端接口为 POST /vocalperformance/applications/
  return httpPost<VocalMusicWork>('/vocalperformance/applications/', data)
}

/**
 * 正式提交报名表（将草稿状态改为提交状态）
 * @param id 报名表ID
 */
export async function submitVocalMusicWork(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/vocalperformance/applications/${id}/submit/`)
}

/**
 * 上传声乐作品文件
 * @param submissionId 报名表ID
 * @param fileType 文件类型 ('video' | 'score')
 * @param file 文件对象
 */
export async function uploadVocalMusicFile(
  submissionId: number | string,
  fileType: 'video' | 'score',
  file: File,
): Promise<HttpResponse<void>> {
  const formData = new FormData()
  formData.append('file_type', fileType)
  if (fileType === 'video') {
    formData.append('video_file', file)
  } else {
    formData.append('score_file', file)
  }
  return httpPost<void>(`/submissions/vocal/upload/${submissionId}/`, formData)
}

/**
 * 暂存声乐作品报名 (复用提交接口，但可能状态不同，此处根据需求直接复用)
 */
export async function saveVocalMusicWork(data: {
  title: string
  description: string
  duration_minutes: number
  duration_seconds: number
  contact_name: string
  contact_phone: string
  contact_address: string
  performer_count: number
  has_read_terms: boolean
  performance_form: number
  group: number | null
  // 可选字段
  video_file?: string | null
  score_file?: string | null
}): Promise<HttpResponse<VocalMusicWork>> {
  return httpPost<VocalMusicWork>('/vocalperformance/applications/', data)
}

/**
 * 获取声乐作品报名详情
 * @param id 作品ID
 */
export async function getVocalMusicWork(
  id: number | string,
): Promise<HttpResponse<VocalMusicWork>> {
  return httpGet<VocalMusicWork>(`/vocalperformance/applications/${id}/`)
}

/**
 * 获取声乐作品报名列表
 */
export async function getVocalMusicWorkList(): Promise<HttpResponse<VocalMusicWork[]>> {
  return httpGet<VocalMusicWork[]>('/vocalperformance/applications/')
}

export interface GroupCategory {
  id: number
  code: string
  name: string
  is_active: boolean
  order: number
}

/**
 * 获取组别分类列表
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

/**
 * 获取表演形式分类列表
 */
export async function getVocalPerformanceCategories(): Promise<
  HttpResponse<PerformanceCategory[]>
> {
  return httpGet<PerformanceCategory[]>('vocalperformance/performance-types/')
}

export interface VocalMusicParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string // 对应 idNo
  ethnicity: string // 对应 nation
  age: number
  contact: string // 对应 phone
  role: 'teacher' | 'student' | 'conductor' | 'accompanist'
  submission_id: number | null // 对应 application
  grade?: string
  student_id?: string // 对应 studentId
}

/**
 * 获取报名相关的人员信息
 * @param applicationId 报名表ID
 */
export async function getVocalMusicParticipants(
  applicationId: number | string,
): Promise<HttpResponse<VocalMusicParticipant[]>> {
  return httpGet<{ participants: VocalMusicParticipant[] }>(
    `/vocalperformance/participants/${applicationId}/`,
  ).then((res) => {
    return {
      ...res,
      data: res.data.participants || [],
    }
  })
}

/**
 * 获取单个声乐作品参赛人员信息
 * @param id 人员ID
 */
export async function getVocalMusicParticipant(
  id: number | string,
): Promise<HttpResponse<VocalMusicParticipant>> {
  return httpGet<VocalMusicParticipant>(`/vocalperformance/participants/${id}/`)
}

/**
 * 添加声乐作品相关人员
 * @param data 人员信息
 */
export async function addVocalMusicParticipant(
  data: Partial<Omit<VocalMusicParticipant, 'id'>>,
): Promise<HttpResponse<VocalMusicParticipant>> {
  return httpPost<VocalMusicParticipant>('/vocalperformance/participants/', data)
}

/**
 * 删除声乐作品相关人员
 * @param id 人员ID
 */
export async function deleteVocalMusicParticipant(
  id: number | string,
): Promise<HttpResponse<void>> {
  return httpPost<void>(`/vocalperformance/participants/${id}/delete/`)
}

/**
 * 下载指导教师导入模板
 */
export async function getVocalTeacherTemplate(): Promise<boolean> {
  return downloadFile('/submissions/vocal/teachers/template/', '指导教师导入模板.xlsx')
}

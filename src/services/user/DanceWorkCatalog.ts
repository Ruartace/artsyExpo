import { httpPost, httpGet, httpPut } from '@/utils/request'
import type { HttpResponse } from '@/utils/request'

/**
 * 后端返回的舞蹈作品数据结构
 */
export interface DanceWork {
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
  is_original: boolean
  user_id: number
  performance_form_id: number
  performance_form_name: string
  group_id: number
  group_name: string
  created_at: string
  updated_at: string
  teachers?: DanceParticipant[]
  students?: DanceParticipant[]
  // keeping these for backward compatibility if needed, or remove them if sure
  user?: number
  performance_form?: string
  group?: string
  participants?: DanceParticipant[]
}

export interface DanceParticipant {
  id: number
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity: string
  age: number
  contact: string
  role: 'teacher' | 'student' | 'leader'
  submission_id: number | null
  grade?: string
  student_id?: string
  school?: string
}

export interface GroupCategory {
  id: number
  code: string
  name: string
  is_active: boolean
  order: number
}

/**
 * 提交舞蹈作品报名
 */
export async function createDanceWork(data: {
  title: string
  description: string
  duration_minutes: number
  duration_seconds: number
  contact_name: string
  contact_phone: string
  contact_address: string
  performer_count: number
  has_read_terms: boolean
  performance_form?: number | string
  performance_form_id?: number | string
  group?: number | string | null
  group_id?: number | string | null
  is_original: boolean
  video_file?: string | null
  score_file?: string | null
}): Promise<HttpResponse<DanceWork>> {
  return httpPost<DanceWork>('/danceperformance/applications/', data)
}

/**
 * 暂存舞蹈作品报名
 */
export async function saveDanceWork(data: {
  id?: number | string
  title: string
  description: string
  duration_minutes: number
  duration_seconds: number
  contact_name: string
  contact_phone: string
  contact_address: string
  performer_count: number
  has_read_terms: boolean
  performance_form?: number | string
  performance_form_id?: number | string
  group?: number | string | null
  group_id?: number | string | null
  is_original: boolean
  video_file?: string | null
  score_file?: string | null
}): Promise<HttpResponse<DanceWork>> {
  if (data.id) {
    return httpPut<DanceWork>(`/danceperformance/applications/${data.id}/`, data)
  }
  return httpPost<DanceWork>('/danceperformance/applications/', data)
}

/**
 * 获取舞蹈作品报名详情
 */
export async function getDanceWork(id: number | string): Promise<HttpResponse<DanceWork>> {
  return httpGet<DanceWork>(`/danceperformance/applications/${id}/`)
}

/**
 * 获取舞蹈作品报名列表
 */
export async function getDanceWorkList(
  params?: Record<string, unknown>,
): Promise<HttpResponse<DanceWork[]>> {
  return httpGet<DanceWork[]>('/danceperformance/applications/', params)
}

/**
 * 正式提交报名表
 */
export async function submitDanceWork(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/danceperformance/applications/${id}/submit/`)
}

/**
 * 上传舞蹈作品文件
 */
export async function uploadDanceWorkFile(
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
  return httpPost<void>(`/danceperformance/submissions/${submissionId}/upload/`, formData)
}

/**
 * 获取报名相关的人员信息
 */
export async function getDanceParticipants(
  applicationId: number | string,
): Promise<HttpResponse<DanceParticipant[]>> {
  return httpGet<{ participants: DanceParticipant[] }>(
    `/danceperformance/participants/${applicationId}/`,
  ).then((res) => {
    return {
      ...res,
      data: res.data.participants || [],
    }
  })
}

/**
 * 添加舞蹈作品相关人员 - 老师
 */
export async function addDanceTeacher(
  submissionId: number | string,
  data: {
    name: string
    gender: 'male' | 'female'
    id_card: string
    ethnicity: string
    age: number
    contact: string
    role: string
    school?: string // 老师可能有学校/单位
  },
): Promise<HttpResponse<DanceParticipant>> {
  return httpPost<DanceParticipant>(
    `/danceperformance/participant/${submissionId}/add-teacher/`,
    data,
  )
}

/**
 * 添加舞蹈作品相关人员 - 学生
 */
export async function addDanceStudent(
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
): Promise<HttpResponse<DanceParticipant>> {
  return httpPost<DanceParticipant>(
    `/danceperformance/participant/${submissionId}/add-student/`,
    data,
  )
}

/**
 * 添加舞蹈作品相关人员
 */
export async function addDanceParticipant(data: {
  name: string
  gender: 'male' | 'female'
  id_card: string
  ethnicity: string
  age: number
  contact: string
  role: string
  submission_id: number
  grade?: string
  student_id?: string
  school?: string
}): Promise<HttpResponse<DanceParticipant>> {
  if (data.role === 'teacher') {
    return addDanceTeacher(data.submission_id, {
      name: data.name,
      gender: data.gender,
      id_card: data.id_card,
      ethnicity: data.ethnicity,
      age: data.age,
      contact: data.contact,
      role: data.role,
      school: data.school,
    })
  } else {
    // assume student
    return addDanceStudent(data.submission_id, {
      name: data.name,
      gender: data.gender,
      id_card: data.id_card,
      ethnicity: data.ethnicity,
      age: data.age,
      contact: data.contact,
      role: data.role,
      grade: data.grade,
      student_id: data.student_id,
      school: data.school,
    })
  }
}

/**
 * 删除舞蹈作品相关人员
 */
export async function deleteDanceParticipant(id: number | string): Promise<HttpResponse<void>> {
  return httpPost<void>(`/danceperformance/participants/${id}/delete/`)
}
/**
 * 获取组别分类列表
 */
export async function getGroupCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/competition-configs/admin/group-categories/')
}

/**
 * 获取舞蹈专场组别分类列表
 */
export async function getDancePerformanceCategories(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/danceperformance/get-danceperformance-categories/')
}

/**
 * 获取舞蹈专场表演形式列表
 */
export async function getDancePerformanceForms(): Promise<HttpResponse<GroupCategory[]>> {
  return httpGet<GroupCategory[]>('/danceperformance/get-danceperformance-forms/')
}

export async function getDanceStudentTemplate() {
  return httpGet('/danceperformance/participants/export-student-template/', {
    responseType: 'blob',
  })
}

// 占位
export async function getDanceTeacherTemplate() {
  return httpGet('/danceperformance/participants/export-teacher-template/', {
    responseType: 'blob',
  })
}

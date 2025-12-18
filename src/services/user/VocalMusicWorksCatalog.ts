import { httpPost, httpGet } from '@/utils/request'
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
  rejection_reason: string
  has_read_terms: boolean
  user: number
  performance_form: number
  group: number
  created_at: string
  updated_at: string
  performance_form_name: string
  group_name: string
  user_name: string | null
}

/**
 * 表演形式分类选项
 */
export interface PerformanceCategory {
  id: number
  name: string
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
  group: number
  // 可选字段
  video_file?: string | null
  score_file?: string | null
}): Promise<HttpResponse<VocalMusicWork>> {
  //后端接口为 POST /vocalperformance/applications/
  return httpPost<VocalMusicWork>('/vocalperformance/applications/', data)
}

/**
 * 获取表演形式分类列表
 */
export async function getVocalPerformanceCategories(): Promise<
  HttpResponse<PerformanceCategory[]>
> {
  return httpGet<PerformanceCategory[]>('vocalperformance/get-vocalperformance-categories/')
}

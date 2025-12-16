// 数组工具函数
// Array Utilities

import type { StudentRow, TeacherRow, BasicDisplayStudentRow } from '@/types'

/**
 * 数组去重
 * @param array 数组
 * @param key 去重的键名（可选）
 * @returns 去重后的数组
 */
export function uniqueArray<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }

  const seen = new Set()
  return array.filter((item) => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 * @param array 数组
 * @param key 分组的键名
 * @returns 分组后的对象
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

/**
 * 数组排序
 * @param array 数组
 * @param key 排序的键名
 * @param order 排序顺序
 * @returns 排序后的数组
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * 数组分页
 * @param array 数组
 * @param page 页码（从1开始）
 * @param pageSize 每页大小
 * @returns 分页后的数组和总数
 */
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number,
): { data: T[]; total: number } {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: array.slice(start, end),
    total: array.length,
  }
}

/**
 * 数组搜索
 * @param array 数组
 * @param keyword 关键词
 * @param keys 搜索的键名数组
 * @returns 搜索结果
 */
export function searchArray<T>(array: T[], keyword: string, keys: (keyof T)[]): T[] {
  if (!keyword.trim()) return array

  const lowerKeyword = keyword.toLowerCase()
  return array.filter((item) =>
    keys.some((key) => {
      const value = item[key]
      return value && String(value).toLowerCase().includes(lowerKeyword)
    }),
  )
}

/**
 * 数组过滤空值
 * @param array 数组
 * @returns 过滤后的数组
 */
export function filterEmpty<T>(array: T[]): T[] {
  return array.filter((item) => item !== null && item !== undefined && item !== '')
}

/**
 * 数组扁平化
 * @param array 数组
 * @param depth 扁平化深度
 * @returns 扁平化后的数组
 */
export function flattenArray<T>(array: T[], depth: number = 1): T[] {
  return array.flat(depth) as T[]
}

/**
 * 数组求交集
 * @param arrays 数组数组
 * @returns 交集数组
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return arrays[0] || []

  return arrays.reduce((acc, curr) => acc.filter((item) => curr.includes(item)))
}

/**
 * 数组求并集
 * @param arrays 数组数组
 * @returns 并集数组
 */
export function union<T>(...arrays: T[][]): T[] {
  return uniqueArray(flattenArray(arrays) as T[])
}

/**
 * 数组求差集
 * @param array1 数组1
 * @param array2 数组2
 * @returns 差集数组
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => !array2.includes(item))
}

/**
 * 数组随机打乱
 * @param array 数组
 * @returns 打乱后的数组
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }
  return result
}

/**
 * 数组取前N项
 * @param array 数组
 * @param n 数量
 * @returns 前N项数组
 */
export function takeArray<T>(array: T[], n: number): T[] {
  return array.slice(0, n)
}

/**
 * 数组取后N项
 * @param array 数组
 * @param n 数量
 * @returns 后N项数组
 */
export function takeRightArray<T>(array: T[], n: number): T[] {
  return array.slice(-n)
}

/**
 * 数组求和
 * @param array 数字数组
 * @returns 总和
 */
export function sumArray(array: number[]): number {
  return array.reduce((sum, num) => sum + num, 0)
}

/**
 * 数组求平均值
 * @param array 数字数组
 * @returns 平均值
 */
export function averageArray(array: number[]): number {
  if (array.length === 0) return 0
  return sumArray(array) / array.length
}

/**
 * 数组求最大值
 * @param array 数字数组
 * @returns 最大值
 */
export function maxArray(array: number[]): number {
  return Math.max(...array)
}

/**
 * 数组求最小值
 * @param array 数字数组
 * @returns 最小值
 */
export function minArray(array: number[]): number {
  return Math.min(...array)
}

/**
 * 学生信息搜索
 * @param students 学生数组
 * @param keyword 关键词
 * @returns 搜索结果
 */
export function searchStudents(students: StudentRow[], keyword: string): StudentRow[] {
  const searchKeys: (keyof StudentRow)[] = [
    'name',
    'gender',
    'nation',
    'idNo',
    'className',
    'studentNo',
    'stage',
    'isSeed',
    'remark',
  ]
  return searchArray(students, keyword, searchKeys)
}

/**
 * 教师信息搜索
 * @param teachers 教师数组
 * @param keyword 关键词
 * @returns 搜索结果
 */
export function searchTeachers(teachers: TeacherRow[], keyword: string): TeacherRow[] {
  const searchKeys: (keyof TeacherRow)[] = [
    'name',
    'gender',
    'nation',
    'idNo',
    'department',
    'title',
    'phone',
    'email',
    'stage',
    'isSeed',
    'remark',
  ]
  return searchArray(teachers, keyword, searchKeys)
}

/**
 * 基本功展示学生搜索
 * @param students 学生数组
 * @param keyword 关键词
 * @returns 搜索结果
 */
export function searchBasicDisplayStudents(
  students: BasicDisplayStudentRow[],
  keyword: string,
): BasicDisplayStudentRow[] {
  const searchKeys: (keyof BasicDisplayStudentRow)[] = [
    'name',
    'gender',
    'nation',
    'idNo',
    'className',
    'studentNo',
    'stage',
    'isSeed',
    'remark',
  ]
  return searchArray(students, keyword, searchKeys)
}

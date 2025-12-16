// 表单验证工具函数
// Form Validation Utilities

import type { FormRule } from '@/types'
import { VALIDATION_RULES } from '@/constants'

/**
 * 创建必填验证规则
 * @param message 错误提示信息
 * @returns 验证规则对象
 */
export function createRequiredRule(message: string): FormRule {
  return { ...VALIDATION_RULES.required(message), trigger: 'blur' }
}

/**
 * 创建邮箱验证规则
 * @returns 验证规则对象
 */
export function createEmailRule(): FormRule {
  return { ...VALIDATION_RULES.email, trigger: 'blur' }
}

/**
 * 创建手机号验证规则
 * @returns 验证规则对象
 */
export function createPhoneRule(): FormRule {
  return { ...VALIDATION_RULES.phone, trigger: 'blur' }
}

/**
 * 创建身份证验证规则
 * @returns 验证规则对象
 */
export function createIdCardRule(): FormRule {
  return { ...VALIDATION_RULES.idCard, trigger: 'blur' }
}

/**
 * 创建长度验证规则
 * @param min 最小长度
 * @param max 最大长度
 * @param message 错误提示信息
 * @returns 验证规则对象
 */
export function createLengthRule(min: number, max: number, message: string): FormRule {
  return {
    min,
    max,
    message,
    trigger: 'blur'
  }
}

/**
 * 创建自定义验证规则
 * @param validator 验证函数
 * @param message 错误提示信息
 * @returns 验证规则对象
 */
export function createCustomRule(
  validator: (rule: Record<string, unknown>, value: unknown, callback: (error?: string) => void) => void,
  message: string
): FormRule {
  return {
    validator,
    message,
    trigger: 'blur'
  }
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 是否通过验证
 */
export function validatePasswordStrength(password: string): boolean {
  // 至少8位，包含字母和数字
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return pattern.test(password)
}

/**
 * 验证确认密码
 * @param password 原密码
 * @param confirmPassword 确认密码
 * @returns 是否匹配
 */
export function validateConfirmPassword(password: string, confirmPassword: string): boolean {
  return password === confirmPassword
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型
 * @returns 是否通过验证
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  return allowedTypes.includes(fileExtension)
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 是否通过验证
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 验证身份证号码
 * @param idCard 身份证号码
 * @returns 是否有效
 */
export function validateIdCard(idCard: string): boolean {
  const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!pattern.test(idCard)) return false

  // 18位身份证校验码验证
  if (!idCard || idCard.length !== 18) return false
  let sum = 0
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] as const
  for (let i = 0; i < 17; i++) {
    if (typeof idCard[i] !== 'string') return false
    sum += parseInt(idCard[i] as string, 10) * weights[i]!
  }
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  const checkCode = checkCodes[sum % 11]
  if (!idCard || typeof idCard[17] !== 'string') return false
  return idCard[17].toUpperCase() === checkCode
}

/**
 * 验证手机号码
 * @param phone 手机号码
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/
  return pattern.test(phone)
}

/**
 * 验证邮箱地址
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}


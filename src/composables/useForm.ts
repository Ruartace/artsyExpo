// 表单相关组合式函数
// Form Composable

import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormRule } from '@/types'
import { createRequiredRule, createEmailRule, createPhoneRule, createIdCardRule } from '@/utils/validation'

/**
 * 表单相关组合式函数
 * @param initialData 初始数据
 * @param rules 验证规则
 * @returns 表单相关的方法和状态
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string, any>>(
  initialData: T,
  rules: Partial<Record<keyof T, FormRule[]>> = {}
) {
  // 表单数据
  const formData = reactive<T>({ ...initialData })
  const originalData = ref<T>({ ...initialData })

  // 表单状态
  const loading = ref(false)
  const submitting = ref(false)
  const dirty = ref(false)
  const valid = ref(true)

  // 验证规则
  const formRules = reactive<Partial<Record<keyof T, FormRule[]>>>(rules)

  // 字段错误信息
  const fieldErrors = reactive<Partial<Record<keyof T, string>>>({})

  // 计算属性
  const isDirty = computed(() => dirty.value)
  const isValid = computed(() => valid.value)
  const hasErrors = computed(() => Object.keys(fieldErrors).length > 0)

  /**
   * 设置表单数据
   * @param data 数据
   */
  const setFormData = (data: Partial<T>) => {
    Object.assign(formData, data)
    checkDirty()
  }

  /**
   * 重置表单数据
   */
  const resetForm = () => {
    Object.assign(formData, originalData.value)
    clearErrors()
    dirty.value = false
  }

  /**
   * 清空表单数据
   */
  const clearForm = () => {
    Object.keys(formData).forEach(key => {
      const typedKey = key as keyof T
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (Array.isArray((formData as any)[typedKey])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (formData as any)[typedKey] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (typeof (formData as any)[typedKey] === 'object' && (formData as any)[typedKey] !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (formData as any)[typedKey] = {}
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (formData as any)[typedKey] = ''
      }
    })
    clearErrors()
    dirty.value = false
  }

  /**
   * 检查表单是否被修改
   */
  const checkDirty = () => {
    dirty.value = JSON.stringify(formData) !== JSON.stringify(originalData.value)
  }

  /**
   * 验证单个字段
   * @param field 字段名
   * @param value 字段值
   * @returns 是否有效
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (field: keyof T, value: any): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldRules = (formRules as any)[field]
    if (!fieldRules) return true

    for (const rule of fieldRules) {
      if (rule.required && (!value || value === '')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldErrors as any)[field] = rule.message || `${String(field)}不能为空`
        return false
      }

      if (rule.min && value && value.length < rule.min) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldErrors as any)[field] = rule.message || `${String(field)}长度不能少于${rule.min}位`
        return false
      }

      if (rule.max && value && value.length > rule.max) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldErrors as any)[field] = rule.message || `${String(field)}长度不能超过${rule.max}位`
        return false
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldErrors as any)[field] = rule.message || `${String(field)}格式不正确`
        return false
      }

      if (rule.validator) {
        let isValid = true
        rule.validator(rule, value, (error?: string) => {
          if (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fieldErrors as any)[field] = error
            isValid = false
          }
        })
        if (!isValid) return false
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (fieldErrors as any)[field]
    return true
  }

  /**
   * 验证整个表单
   * @returns 是否有效
   */
  const validateForm = (): boolean => {
    clearErrors()
    let isValid = true

    Object.keys(formData).forEach(key => {
      const typedKey = key as keyof T
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!validateField(typedKey, (formData as any)[typedKey])) {
        isValid = false
      }
    })

    valid.value = isValid
    return isValid
  }

  /**
   * 清空错误信息
   */
  const clearErrors = () => {
    Object.keys(fieldErrors).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (fieldErrors as any)[key]
    })
    valid.value = true
  }

  /**
   * 获取字段错误信息
   * @param field 字段名
   * @returns 错误信息
   */
  const getFieldError = (field: keyof T): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (fieldErrors as any)[field] || ''
  }

  /**
   * 设置字段错误信息
   * @param field 字段名
   * @param error 错误信息
   */
  const setFieldError = (field: keyof T, error: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fieldErrors as any)[field] = error
  }

  /**
   * 提交表单
   * @param submitFn 提交函数
   * @returns 提交结果
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitForm = async (submitFn: (data: T) => Promise<any>): Promise<boolean> => {
    if (!validateForm()) {
      ElMessage.error('请检查表单填写是否正确')
      return false
    }

    submitting.value = true
    try {
      await submitFn(formData as T)
      ElMessage.success('提交成功')
      originalData.value = { ...formData }
      dirty.value = false
      return true
    } catch (error) {
      ElMessage.error('提交失败，请稍后再试')
      console.error('Submit error:', error)
      return false
    } finally {
      submitting.value = false
    }
  }

  /**
   * 添加验证规则
   * @param field 字段名
   * @param rules 规则数组
   */
  const addRules = (field: keyof T, rules: FormRule[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formRules as any)[field] = rules
  }

  /**
   * 移除验证规则
   * @param field 字段名
   */
  const removeRules = (field: keyof T) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (formRules as any)[field]
  }

  /**
   * 获取表单数据（只读）
   * @returns 表单数据
   */
  const getFormData = (): Readonly<T> => {
    return { ...formData } as T
  }

  /**
   * 检查字段是否被修改
   * @param field 字段名
   * @returns 是否被修改
   */
  const isFieldDirty = (field: keyof T): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (formData as any)[field] !== originalData.value[field]
  }

  /**
   * 监听字段变化
   * @param field 字段名
   * @param callback 回调函数
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchField = (field: keyof T, callback: (value: any) => void) => {
    // 这里可以使用Vue的watch，但为了简化，我们提供一个基础实现
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalValue = (formData as any)[field]
    const checkValue = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((formData as any)[field] !== originalValue) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback((formData as any)[field])
      }
    }

    // 简单的轮询检查（实际项目中建议使用Vue的watch）
    const interval = setInterval(checkValue, 100)

    return () => clearInterval(interval)
  }

  return {
    // 状态
    formData,
    originalData,
    loading,
    submitting,
    dirty,
    valid,
    formRules,
    fieldErrors,

    // 计算属性
    isDirty,
    isValid,
    hasErrors,

    // 方法
    setFormData,
    resetForm,
    clearForm,
    checkDirty,
    validateField,
    validateForm,
    clearErrors,
    getFieldError,
    setFieldError,
    submitForm,
    addRules,
    removeRules,
    getFormData,
    isFieldDirty,
    watchField
  }
}

// 常用验证规则组合
export const commonRules = {
  required: (message: string) => createRequiredRule(message),
  email: createEmailRule(),
  phone: createPhoneRule(),
  idCard: createIdCardRule(),

  // 密码规则
  password: (minLength: number = 6): FormRule[] => [
    createRequiredRule('请输入密码'),
    {
      min: minLength,
      message: `密码长度不能少于${minLength}位`,
      trigger: 'blur' as const
    }
  ],

  // 确认密码规则
  confirmPassword: (passwordField: string): FormRule[] => [
    createRequiredRule('请确认密码'),
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordField) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur' as const
    }
  ],

  // 用户名规则
  username: [
    createRequiredRule('请输入用户名'),
    {
      min: 3,
      max: 20,
      message: '用户名长度为3-20位',
      trigger: 'blur' as const
    }
  ],

  // 姓名规则
  name: [
    createRequiredRule('请输入姓名'),
    {
      min: 2,
      max: 10,
      message: '姓名长度为2-10位',
      trigger: 'blur' as const
    }
  ]
}

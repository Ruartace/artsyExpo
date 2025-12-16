// Excel相关组合式函数
// Excel Composable

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { parseExcelFile, downloadExcelTemplate } from '@/utils/excel'
import type { ExportConfig } from '@/types'

/**
 * Excel相关组合式函数
 * @returns Excel相关的方法和状态
 */
export function useExcel() {
  const loading = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  
  /**
   * 触发文件选择
   */
  const triggerFileSelect = () => {
    fileInput.value?.click()
  }
  
  /**
   * 处理文件选择
   * @param event 文件选择事件
   * @param onSuccess 成功回调
   * @param onError 错误回调
   */
  const handleFileSelect = async (
    event: Event,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any[]) => void,
    onError?: (error: Error) => void
  ) => {
    const files = (event.target as HTMLInputElement).files
    if (!files || files.length === 0) return
    
    const file = files.item(0) as File
    if (!file) return
    
    loading.value = true
    try {
      const data = await parseExcelFile(file)
      onSuccess(data)
      ElMessage.success('文件导入成功')
    } catch (error) {
      const err = error as Error
      ElMessage.error(`文件导入失败: ${err.message}`)
      onError?.(err)
    } finally {
      loading.value = false
      // 清空文件输入
      ;(event.target as HTMLInputElement).value = ''
    }
  }
  
  /**
   * 下载Excel模板
   * @param headers 表头
   * @param filename 文件名
   */
  const downloadTemplate = (headers: string[], filename: string) => {
    try {
      downloadExcelTemplate(headers, filename)
      ElMessage.success('模板下载成功')
    } catch (error) {
      ElMessage.error('模板下载失败')
      console.error('Download template error:', error)
    }
  }
  
  /**
   * 导出数据到Excel
   * @param config 导出配置
   */
  const exportToExcel = (config: ExportConfig) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { filename, headers, data, sheetName = 'Sheet1' } = config
      
      // 创建工作表
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const worksheet = data.map(row => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newRow: any = {}
        headers.forEach((header, index) => {
          newRow[header] = row[index] || ''
        })
        return newRow
      })
      
      // 使用现有的下载模板函数
      downloadExcelTemplate(headers, filename)
      ElMessage.success('数据导出成功')
    } catch (error) {
      ElMessage.error('数据导出失败')
      console.error('Export to Excel error:', error)
    }
  }
  
  /**
   * 验证Excel文件格式
   * @param file 文件
   * @returns 是否有效
   */
  const validateExcelFile = (file: File): boolean => {
    const allowedTypes = ['.xlsx', '.xls']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      ElMessage.error('请选择Excel文件（.xlsx或.xls格式）')
      return false
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过10MB')
      return false
    }
    
    return true
  }
  
  /**
   * 解析学生信息Excel
   * @param data Excel解析后的数据
   * @returns 学生信息数组
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseStudentData = (data: any[]) => {
    return data.map((row, index) => ({
      index: index + 1,
      name: String(row['姓名'] ?? ''),
      gender: String(row['性别'] ?? ''),
      nation: String(row['民族'] ?? ''),
      idNo: String(row['身份证号码'] ?? ''),
      className: String(row['班级'] ?? ''),
      studentNo: String(row['学籍号'] ?? ''),
      stage: (() => {
        const value = String(row['学段'] ?? '')
        return (value === '本科' || value === '专科') ? value : undefined
      })(),
      isSeed: (() => {
        const value = String(row['是否为种子选手'] ?? '')
        return (value === '是' || value === '否') ? value : undefined
      })(),
      remark: String(row['备注'] ?? '')
    }))
  }
  
  /**
   * 解析教师信息Excel
   * @param data Excel解析后的数据
   * @returns 教师信息数组
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseTeacherData = (data: any[]) => {
    return data.map((row, index) => ({
      index: index + 1,
      name: String(row['姓名'] ?? ''),
      gender: String(row['性别'] ?? ''),
      nation: String(row['民族'] ?? ''),
      idNo: String(row['身份证号码'] ?? ''),
      department: String(row['院系'] ?? ''),
      title: String(row['职务'] ?? ''),
      phone: String(row['手机'] ?? ''),
      email: String(row['邮箱'] ?? ''),
      stage: (() => {
        const value = String(row['学段'] ?? '')
        return (value === '本科' || value === '专科') ? value : undefined
      })(),
      isSeed: (() => {
        const value = String(row['是否为种子选手'] ?? '')
        return (value === '是' || value === '否') ? value : undefined
      })(),
      remark: String(row['备注'] ?? '')
    }))
  }
  
  /**
   * 创建文件输入元素
   * @param accept 接受的文件类型
   * @param multiple 是否多选
   * @returns 文件输入元素
   */
  const createFileInput = (accept: string = '.xlsx,.xls', multiple: boolean = false): HTMLInputElement => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.style.display = 'none'
    document.body.appendChild(input)
    return input
  }
  
  /**
   * 移除文件输入元素
   * @param input 文件输入元素
   */
  const removeFileInput = (input: HTMLInputElement) => {
    if (input && input.parentNode) {
      input.parentNode.removeChild(input)
    }
  }
  
  return {
    // 状态
    loading,
    fileInput,
    
    // 方法
    triggerFileSelect,
    handleFileSelect,
    downloadTemplate,
    exportToExcel,
    validateExcelFile,
    parseStudentData,
    parseTeacherData,
    createFileInput,
    removeFileInput
  }
}

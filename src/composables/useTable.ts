// 表格相关组合式函数
// Table Composable

import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { PaginationConfig, TableColumn } from '@/types'
import { TABLE_CONFIG } from '@/constants'

/**
 * 表格相关组合式函数
 * @param options 配置选项
 * @returns 表格相关的方法和状态
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTable<T = any>(options: {
  data?: T[]
  columns?: TableColumn[]
  pageSize?: number
  searchKeys?: (keyof T)[]
} = {}) {
  // 表格数据
  const tableData = ref<T[]>(options.data || [])
  const originalData = ref<T[]>(options.data || [])
  
  // 搜索
  const searchKeyword = ref('')
  const searchKeys = ref<(keyof T)[]>(options.searchKeys || [])
  
  // 分页
  const pagination = reactive<PaginationConfig>({
    currentPage: 1,
    pageSize: options.pageSize || TABLE_CONFIG.defaultPageSize,
    total: 0,
    pageSizes: TABLE_CONFIG.pageSizes,
    layout: TABLE_CONFIG.layout
  })
  
  // 排序
  const sortConfig = ref<{
    prop: string
    order: 'ascending' | 'descending'
  } | null>(null)
  
  // 选择
  const selectedRows = ref<T[]>([])
  const selectedRowKeys = ref<(string | number)[]>([])
  
  // 加载状态
  const loading = ref(false)
  
  // 计算属性
  const filteredData = computed(() => {
    let data = [...originalData.value]
    
    // 搜索过滤
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      data = data.filter(item => 
        searchKeys.value.some(key => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (item as any)[key]
          return value && String(value).toLowerCase().includes(keyword)
        })
      )
    }
    
    // 排序
    if (sortConfig.value) {
      const { prop, order } = sortConfig.value
      data.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aVal = (a as any)[prop]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bVal = (b as any)[prop]
        
        if (aVal < bVal) return order === 'ascending' ? -1 : 1
        if (aVal > bVal) return order === 'ascending' ? 1 : -1
        return 0
      })
    }
    
    return data
  })
  
  const paginatedData = computed(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredData.value.slice(start, end)
  })
  
  const totalPages = computed(() => 
    Math.ceil(filteredData.value.length / pagination.pageSize)
  )
  
  // 方法
  /**
   * 设置表格数据
   * @param data 数据
   */
  const setTableData = (data: T[]) => {
    tableData.value = data
    originalData.value = [...data]
    pagination.total = data.length
    pagination.currentPage = 1
  }
  
  /**
   * 添加数据
   * @param item 数据项
   */
  const addRow = (item: T) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalData.value.push(item as any)
    pagination.total = originalData.value.length
  }
  
  /**
   * 更新数据
   * @param index 索引
   * @param item 数据项
   */
  const updateRow = (index: number, item: T) => {
    if (index >= 0 && index < originalData.value.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      originalData.value[index] = item as any
    }
  }
  
  /**
   * 删除数据
   * @param index 索引
   */
  const removeRow = (index: number) => {
    if (index >= 0 && index < originalData.value.length) {
      originalData.value.splice(index, 1)
      pagination.total = originalData.value.length
    }
  }
  
  /**
   * 批量删除数据
   * @param indices 索引数组
   */
  const removeRows = (indices: number[]) => {
    indices.sort((a, b) => b - a) // 从后往前删除
    indices.forEach(index => {
      if (index >= 0 && index < originalData.value.length) {
        originalData.value.splice(index, 1)
      }
    })
    pagination.total = originalData.value.length
  }
  
  /**
   * 清空数据
   */
  const clearData = () => {
    originalData.value = []
    pagination.total = 0
    pagination.currentPage = 1
    selectedRows.value = []
    selectedRowKeys.value = []
  }
  
  /**
   * 搜索
   * @param keyword 关键词
   */
  const search = (keyword: string) => {
    searchKeyword.value = keyword
    pagination.currentPage = 1
  }
  
  /**
   * 清空搜索
   */
  const clearSearch = () => {
    searchKeyword.value = ''
    pagination.currentPage = 1
  }
  
  /**
   * 排序
   * @param prop 属性
   * @param order 顺序
   */
  const sort = (prop: string, order: 'ascending' | 'descending') => {
    sortConfig.value = { prop, order }
  }
  
  /**
   * 清空排序
   */
  const clearSort = () => {
    sortConfig.value = null
  }
  
  /**
   * 分页改变
   * @param page 页码
   * @param size 每页大小
   */
  const handlePageChange = (page: number, size?: number) => {
    pagination.currentPage = page
    if (size) {
      pagination.pageSize = size
    }
  }
  
  /**
   * 选择改变
   * @param selection 选中的行
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectionChange = (selection: T[], row?: T) => {
    selectedRows.value = selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedRowKeys.value = selection.map((item: any) => item.id || item.index)
  }
  
  /**
   * 全选
   * @param selection 选中的行
   */
  const handleSelectAll = (selection: T[]) => {
    selectedRows.value = selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedRowKeys.value = selection.map((item: any) => item.id || item.index)
  }
  
  /**
   * 刷新数据
   */
  const refresh = () => {
    pagination.currentPage = 1
    clearSearch()
    clearSort()
  }
  
  /**
   * 导出数据
   * @param filename 文件名
   */
  const exportData = (filename: string) => {
    try {
      const data = filteredData.value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvContent = convertToCSV(data as any[])
      downloadCSV(csvContent, filename)
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('Export error:', error)
    }
  }
  
  /**
   * 转换为CSV格式
   * @param data 数据
   * @returns CSV字符串
   */
  const convertToCSV = (data: T[]): string => {
    if (data.length === 0) return ''
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers = Object.keys(data[0] as any)
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (row as any)[header]
          return typeof value === 'string' ? `"${value}"` : value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }
  
  /**
   * 下载CSV文件
   * @param content CSV内容
   * @param filename 文件名
   */
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return {
    // 状态
    tableData,
    originalData,
    searchKeyword,
    searchKeys,
    pagination,
    sortConfig,
    selectedRows,
    selectedRowKeys,
    loading,
    
    // 计算属性
    filteredData,
    paginatedData,
    totalPages,
    
    // 方法
    setTableData,
    addRow,
    updateRow,
    removeRow,
    removeRows,
    clearData,
    search,
    clearSearch,
    sort,
    clearSort,
    handlePageChange,
    handleSelectionChange,
    handleSelectAll,
    refresh,
    exportData
  }
}

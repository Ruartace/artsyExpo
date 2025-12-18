// 标签页相关组合式函数
// Tabs Composable

import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TabItem } from '@/types/tabs'
type TabClickArg = {
  paneName?: string | number | null
  props?: { name?: string | number | null }
  name?: string | number | null
}

/**
 * 标签页相关组合式函数
 * @returns 标签页相关的方法和状态
 */
export function useTabs() {
  const route = useRoute()
  const router = useRouter()

  // 标签页列表
  const tabs = ref<TabItem[]>([])
  // 当前激活的标签页
  const activeTab = ref<string>('')

  /**
   * 添加标签页
   * @param tab 标签页信息
   */
  const addTab = (tab: TabItem) => {
    // 检查标签页是否已存在
    const existingTab = tabs.value.find(t => t.path === tab.path)
    if (!existingTab) {
      tabs.value.push({
        ...tab,
        closable: tab.closable !== false // 默认可关闭
      })
    }
    activeTab.value = tab.path
  }

  /**
   * 移除标签页
   * @param path 标签页路径
   */
  const removeTab = (path: string) => {
    // 解码路径，确保匹配正确
    const decodedPath = decodeURIComponent(path)
    const index = tabs.value.findIndex(t => decodeURIComponent(t.path) === decodedPath)
    if (index === -1) return

    tabs.value.splice(index, 1)

    // 如果移除的是当前激活的标签页，切换到最后一个标签页
    if (activeTab.value === path) {
      const lastTab = tabs.value[tabs.value.length - 1]
      if (lastTab) {
        activeTab.value = lastTab.path
        router.push(lastTab.path)
      } else {
        // 如果没有标签页了，跳转到首页
        router.push('/user/home')
      }
    }
  }

  /**
   * 清空所有标签页
   */
  const clearTabs = () => {
    tabs.value = []
    activeTab.value = ''
  }

  /**
   * 关闭其他标签页
   * @param path 保留的标签页路径
   */
  const closeOtherTabs = (path: string) => {
    tabs.value = tabs.value.filter(t => t.path === path)
    activeTab.value = path
  }

  /**
   * 关闭所有标签页
   */
  const closeAllTabs = () => {
    clearTabs()
    router.push('/user/home')
  }

  /**
   * 处理标签页点击
   * @param tab 标签页对象
   */
  const handleTabClick = (tab: TabClickArg) => {
    const raw = tab?.paneName ?? tab?.props?.name ?? tab?.name ?? activeTab.value
    const targetPath = typeof raw === 'number' ? String(raw) : (raw || '')
    if (!targetPath) return
    activeTab.value = targetPath as string
    router.push(targetPath)
  }

  /**
   * 处理标签页移除
   * @param path 标签页路径
   */
  const handleTabRemove = (path: string) => {
    removeTab(path)
  }

  /**
   * 根据路由名称获取标签页标题
   * @param routeName 路由名称
   * @param path 路由路径
   * @returns 标签页标题
   */
  const getTabTitle = (routeName: string | symbol | undefined, path: string): string => {
    if (!routeName || typeof routeName !== 'string') {
      // 根据路径生成标题
      const pathMap: Record<string, string> = {
        '/user': '用户首页',
        '/user/info': '学生基本信息',
        '/user/student-basic': '学生基本功展示报名',
        '/user/teacher-basic': '教师基本功展示报名',
        '/user/student-stats': '学生基本功报名信息统计',
        '/user/teacher-stats': '教师基本功报名信息统计',
        '/reviewer/dashboard': '审核首页',
        '/reviewer/approval': '审批中心',
        '/admin/home': '管理员',
        '/logger/home': '日志记录',
      }
      const pathMap2: Record<string, string> = {
        '/user/home': '用户首页',
        '/user/VocalMusic': '声乐作品报名',
        '/user/DanceWork': '舞蹈作品报名',
        '/user/artwork-submission': '绘画作品报名',
        '/user/instrumental-works': '器乐作品报名',
        '/user/opera-works': '歌剧作品报名',
        '/user/Film-Television': '影视作品报名',
        '/user/recitation-works': '朗诵作品报名',
        '/user/handwriting-works': '书法、篆刻作品报名',
        '/user/handicraft-production': '手工艺制作报名',
        '/user/art-practice-works': '艺术实践作品报名',
        '/user/schools-works': '中小学美育改革创新优秀成果',
        '/approval': '审核首页',
        '/approval/approval': '审批中心',
        '/approval/statistics': '报名统计',
        '/approval/account': '账号管理',
        '/admin': '管理员',
        '/admin/approval': '审核报名',
        '/admin/statistics': '报名统计',
        '/admin/account': '账号管理',
        '/admin/tips': '提示管理',
        '/admin/category': '类型管理',
        '/logaudit': '日志记录',
        '/logaudit/logs': '操作日志',
        '/logaudit/audit': '审计记录',
      }
      return pathMap2[path] ?? pathMap[path] ?? path
    }

    // 根据路由名称映射标题
    const nameMap: Record<string, string> = {
      '首页': '用户首页',
      'user-info': '学生基本信息',
      'user-student-basic': '学生基本功展示报名',
      'user-teacher-basic': '教师基本功展示报名',
      'user-student-stats': '学生基本功报名信息统计',
      'user-teacher-stats': '教师基本功报名信息统计',
      'reviewer-dashboard': '审核首页',
      'reviewer-approval': '审批中心',
      'admin-home': '管理员',
      'logger-home': '日志记录',
    }

    const nameMap2: Record<string, string> = {
      '首页': '用户首页',
      '舞蹈作品报名': '舞蹈作品报名',
      '声乐作品报名': '声乐作品报名',
      '绘画作品报名': '绘画作品报名',
      '器乐作品报名': '器乐作品报名',
      '歌剧作品报名': '歌剧作品报名',
      '影视作品报名': '影视作品报名',
      '朗诵作品报名': '朗诵作品报名',
      '书法、篆刻作品报名': '书法、篆刻作品报名',
      '手工艺制作报名': '手工艺制作报名',
      '艺术实践作品报名': '艺术实践作品报名',
      '中小学美育改革创新优秀成果': '中小学美育改革创新优秀成果',
      'approval-home': '审核首页',
      'approval-page': '审批中心',
      'approval-statistics': '报名统计',
      'approval-account': '账号管理',
      'admin-home': '管理员',
      'admin-approval': '审核报名',
      'admin-statistics': '报名统计',
      'admin-account': '账号管理',
      'admin-tips': '提示管理',
      'admin-category': '类型管理',
      'logaudit-home': '日志记录',
      'logaudit-logs': '操作日志',
      'logaudit-audit': '审计记录',
    }
    return nameMap2[routeName] ?? nameMap[routeName] ?? routeName
  }

  // 监听路由变化，自动添加标签页
  watch(
    () => route.path,
    (newPath) => {
      if (newPath === '/login' || newPath === '/404' || newPath === '/403') {
        return
      }

      const tabTitle = route.meta?.title as string || getTabTitle(route.name, newPath)
      addTab({
        path: newPath,
        title: tabTitle,
        closable: true
      })
    },
    { immediate: true }
  )

  return {
    // 状态
    tabs,
    activeTab,

    // 方法
    addTab,
    removeTab,
    clearTabs,
    closeOtherTabs,
    closeAllTabs,
    handleTabClick,
    handleTabRemove
  }
}

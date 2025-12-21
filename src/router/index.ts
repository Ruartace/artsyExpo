import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/user/home',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/loginModle.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/403.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404.vue'),
      meta: { layout: 'blank' },
    },
    // 用户端
    {
      path: '/user',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { roles: ['user'] },
      children: [
        { path: '', redirect: { name: '首页' } },
        { path: 'home', name: '首页', component: () => import('@/views/user/HomeView.vue') },
        {
          path: 'handicraft-production',
          name: '手工艺制作报名',
          component: () => import('@/views/user/HandicraftProductionForm.vue'),
        },
        {
          path: 'DanceWork',
          name: '舞蹈作品报名',
          component: () => import('@/views/user/DanceWorkCatalog.vue'),
        },
        {
          path: 'VocalMusic/:id?',
          name: '声乐作品报名',
          component: () => import('@/views/user/VocalMusicWorksCatalog.vue'),
        },
        {
          path: 'artwork-submission',
          name: '绘画作品报名',
          component: () => import('@/views/user/ArtworkSubmissionForm.vue'),
        },
        {
          path: 'instrumental-works',
          name: '器乐作品报名',
          component: () => import('@/views/user/InstrumentalWorksCatalog.vue'),
        },
        {
          path: 'opera-works',
          name: '歌剧作品报名',
          component: () => import('@/views/user/OperaWorkCatalog.vue'),
        },
        {
          path: 'Film-Television',
          name: '影视作品报名',
          component: () => import('@/views/user/FilmAndTelevisionWorksCatalog.vue'),
        },
        {
          path: 'recitation-works',
          name: '朗诵作品报名',
          component: () => import('@/views/user/RecitationWorksSubmissionForm.vue'),
        },
        {
          path: 'handwriting-works',
          name: '书法、篆刻作品报名',
          component: () => import('@/views/user/CalligraohyArtworkSubmissionForm.vue'),
        },
        {
          path: 'art-practice-works',
          name: '艺术实践作品报名',
          component: () => import('@/views/user/ArtPracticeWorksheet.vue'),
        },
        {
          path: 'schools-works',
          name: '中小学美育改革创新优秀成果',
          component: () => import('@/views/user/OAAERandIFPandSecondarySchools.vue'),
        },
      ],
    },
    // 审核端路由（使用默认布局）
    {
      path: '/approval',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { roles: ['approval'], requiresAuth: true },
      children: [
        {
          path: '',
          name: 'approval-home',
          component: () => import('@/views/reviewer/IndexPage.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'approval',
          name: 'approval-page',
          component: () => import('@/views/reviewer/ApprovalPage.vue'),
          meta: { title: '审核报名' },
        },
        {
          path: 'statistics',
          name: 'approval-statistics',
          component: () => import('@/views/reviewer/StatisticsPage.vue'),
          meta: { title: '报名统计' },
        },
        {
          path: 'account',
          name: 'approval-account',
          component: () => import('@/views/reviewer/AccountPage.vue'),
          meta: { title: '账号管理' },
        },
      ],
    },
    // 管理员端路由（使用默认布局）
    {
      path: '/admin',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { roles: ['admin'], requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-home',
          component: () => import('@/views/reviewer/IndexPage.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'approval',
          name: 'admin-approval',
          component: () => import('@/views/reviewer/ApprovalPage.vue'),
          meta: { title: '审核报名' },
        },
        {
          path: 'statistics',
          name: 'admin-statistics',
          component: () => import('@/views/reviewer/StatisticsPage.vue'),
          meta: { title: '报名统计' },
        },
        {
          path: 'account',
          name: 'admin-account',
          component: () => import('@/views/reviewer/AccountPage.vue'),
          meta: { title: '账号管理' },
        },
        {
          path: 'tips',
          name: 'admin-tips',
          component: () => import('@/views/admin/TipsManagement.vue'),
          meta: { title: '提示管理' },
        },
        {
          path: 'category',
          name: 'admin-category',
          component: () => import('@/views/admin/CategoryManagement.vue'),
          meta: { title: '类型管理' },
        },
      ],
    },
    // 日志审计员端路由
    {
      path: '/logaudit',
      name: 'logaudit-home',
      component: () => import('@/views/logger/LogAuditHomePage.vue'),
      meta: { roles: ['logaudit'], requiresAuth: true, title: '首页' },
    },
    {
      path: '/logaudit/logs',
      name: 'logaudit-logs',
      component: () => import('@/views/logger/LogView.vue'),
      meta: { roles: ['logaudit'], requiresAuth: true, title: '操作日志' },
    },
    {
      path: '/logaudit/audit',
      name: 'logaudit-audit',
      component: () => import('@/views/logger/AuditRecord.vue'),
      meta: { roles: ['logaudit'], requiresAuth: true, title: '审计记录' },
    },
  ],
})

setupRouterGuards(router)

export default router

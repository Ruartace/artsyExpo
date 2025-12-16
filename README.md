# one

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
### 安装依赖，scss 插件，element-plus图标，xlsx 插件
```sh
npm install -D sass-embedded 
npm install element-plus @element-plus/icons-vue 
npm install xlsx 
```

## 前端页面开发代码规范（项目组）

- 框架与语言：使用 Vue 3 + TypeScript。
- 组件库：统一使用 Element Plus（主题色使用其默认主题）。
- 代码组织：可复用组件必须封装；按 `assets / components / services / composables / layouts / views / router / stores / utils` 组织；页面均路由懒加载。
- 命名规范：文件与变量采用小驼峰；样式统一使用 SCSS；页面级唯一选择器可用 id，其余使用 class；id 仅用于交互。
- 注释规范：为每个封装功能与关键逻辑编写清晰注释（功能、参数、返回值、思路）。多人协作需同步更新注释。
- 接口测试：在浏览器开发者工具 Network 栏抓包核对请求与响应。
- 响应式设计：使用 flex/grid 与 rem/vw，避免写死布局。
- 性能优化：图片压缩、路由懒加载、库按需引入、UI 抽公共组件。
- Git 规范：统一使用 Git 提交至远程仓库，分支协作开发。
- Mock：支持使用 mock 数据并可随时替换为真实接口。

### 目录结构（核心）

```
src/
  assets/
    styles/            # 全局 SCSS（main.scss）
  components/
    base/              # 基础组件
    common/            # 通用组件
  composables/
    usePermission.ts   # 权限逻辑
    useRequest.ts      # 请求封装
  layouts/
    BlankLayout.vue
    DefaultLayout.vue
  router/
    guards.ts
    index.ts
  services/
    mock.ts            # mock 数据示例
  stores/
    user.ts            # 登录与角色状态
  utils/
    request.ts         # 请求工具（可替换为 fetch/axios）
  views/
    403.vue
    404.vue
    login.vue
    user/
      UserIndexPage.vue
    reviewer/
      IndexPage.vue
      ApprovalPage.vue
    admin/
      IndexPage.vue
    logger/
      IndexPage.vue
```

### 角色与页面说明

- 用户端：报名页面（示例见 `views/user/UserIndexPage.vue`），注释信息动态映射；表单支持模糊搜索。
- 审核员端：`reviewer/IndexPage` 查看报名概览；`reviewer/ApprovalPage` 批量拒绝、按分类拒绝、同类一起操作；支持模糊搜索与类型筛选。
- 管理员端：与用户端类似但字段可编辑，支持保存；可配置报名人数上下限；管理账号与人员列表。
- 日志记录员端：日志列表仅查看与导出，不可修改；支持模糊搜索；导出使用 `xlsx`。
## 主要表单（11个）中文描述：
- 1.ArtPracticeWorksheet.vue：艺术实践工作表单
- 2.ArtworkSubmissionForm.vue :绘画作品表单
- 3.CalligraohyArtworkSubmissionForm.vue：书法作品表单
- 4.DanceWorkCatalog.vue：舞蹈作品表单
- 5.FilmAndTelevisionWorksCatalog.vue：影视作品表单
- 6.HandicraftProductionForm.vue：手工艺制作表单
- 7.InstrumentalWorksCatalog.vue：器乐作品表单
- 8.OperaWorkCatalog.vue：戏曲作品表单
- 9.OAAERandIFPandSecondarySchools.vue：中小学美育改革创新优秀成果表单
- 10.RecitationWorksSubmissionForm.vue：朗诵作品表单
- 11.VocalMusicWorksCatalog.vue：声乐作品表单
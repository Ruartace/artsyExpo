/// <reference types="vite/client" />

// 声明所有以 .vue 结尾的文件模块，使 TypeScript 能够识别 .vue 单文件组件
declare module '*.vue' {
  // 从 Vue 中导入 DefineComponent 类型，用于描述组件定义
  import type { DefineComponent } from 'vue'
  // 定义并导出一个默认的组件常量，其类型为 DefineComponent，泛型参数分别表示 props、emit 和 其他选项
  const component: DefineComponent<object, object, unknown>
  export default component
}

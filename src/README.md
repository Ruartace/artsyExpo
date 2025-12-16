# TypeScript 封装架构说明

## 📁 项目结构

```
src/
├── types/           # 类型定义
│   └── index.ts     # 全局类型定义
├── constants/       # 常量定义
│   └── index.ts     # 全局常量
├── utils/           # 工具函数
│   ├── validation.ts    # 表单验证工具
│   ├── format.ts        # 格式化工具
│   ├── array.ts         # 数组操作工具
│   ├── storage.ts       # 本地存储工具
│   └── excel.ts         # Excel操作工具
├── composables/     # 组合式函数
│   ├── useAuth.ts       # 认证相关
│   ├── useTable.ts      # 表格相关
│   ├── useForm.ts       # 表单相关
│   └── useExcel.ts      # Excel相关
├── stores/          # 状态管理
│   └── user.ts      # 用户状态（已重构）
└── assets/styles/   # 样式文件
    ├── variables.scss   # SCSS变量
    ├── layout.scss     # 布局样式
    ├── components.scss # 组件样式
    └── main.scss       # 主样式文件
```

## 🎯 封装优势

### 1. **类型安全**
- 统一的类型定义，避免类型错误
- 完整的TypeScript支持
- 编译时类型检查

### 2. **代码复用**
- 组合式函数可在多个组件中复用
- 工具函数统一管理
- 常量集中定义

### 3. **维护性**
- 模块化设计，职责清晰
- 易于测试和调试
- 便于团队协作

### 4. **可扩展性**
- 易于添加新功能
- 支持插件化扩展
- 向后兼容

## 📋 主要模块说明

### 类型定义 (`types/index.ts`)
```typescript
// 用户相关类型
export type UserRole = 'user' | 'reviewer' | 'admin' | 'logger'
export interface User { ... }
export interface LoginForm { ... }

// 表单相关类型
export interface FormRule { ... }
export interface ChangePasswordForm { ... }

// 表格相关类型
export interface TableColumn { ... }
export interface PaginationConfig { ... }
```

### 常量定义 (`constants/index.ts`)
```typescript
// 用户角色常量
export const USER_ROLES = { ... }

// 菜单配置
export const MENU_CONFIG = { ... }

// 表单验证规则
export const VALIDATION_RULES = { ... }

// 表格配置
export const TABLE_CONFIG = { ... }
```

### 工具函数 (`utils/`)
- **validation.ts**: 表单验证工具
- **format.ts**: 数据格式化工具
- **array.ts**: 数组操作工具
- **storage.ts**: 本地存储工具
- **excel.ts**: Excel操作工具

### 组合式函数 (`composables/`)
- **useAuth.ts**: 认证相关逻辑
- **useTable.ts**: 表格操作逻辑
- **useForm.ts**: 表单处理逻辑
- **useExcel.ts**: Excel操作逻辑

## 🔧 使用示例

### 在组件中使用认证功能
```typescript
import { useAuth } from '@/composables/useAuth'

const { login, logout, isLoggedIn, currentUser } = useAuth()
```

### 在组件中使用表单功能
```typescript
import { useForm } from '@/composables/useForm'
import { commonRules } from '@/composables/useForm'

const { formData, validateForm, submitForm } = useForm(
  { username: '', password: '' },
  {
    username: commonRules.username,
    password: commonRules.password(6)
  }
)
```

### 在组件中使用表格功能
```typescript
import { useTable } from '@/composables/useTable'

const { tableData, search, pagination, exportData } = useTable({
  data: [],
  searchKeys: ['name', 'email']
})
```

## 🎨 样式封装

### SCSS变量 (`assets/styles/variables.scss`)
```scss
// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;

// 尺寸变量
$sidebar-width: 220px;
$header-height: 60px;

// 字体变量
$font-size-base: 14px;
$font-weight-bold: 600;
```

### 组件样式 (`assets/styles/components.scss`)
```scss
// 卡片组件样式
.card-header { ... }

// 表格工具栏样式
.action-toolbar { ... }

// 表单样式
.form-section { ... }
```

## 🚀 最佳实践

### 1. **类型优先**
- 先定义类型，再实现功能
- 使用严格的TypeScript配置
- 避免使用`any`类型

### 2. **组合式函数**
- 单一职责原则
- 可复用的逻辑封装
- 清晰的输入输出

### 3. **工具函数**
- 纯函数设计
- 完整的错误处理
- 详细的文档注释

### 4. **常量管理**
- 集中定义常量
- 使用有意义的命名
- 分组管理相关常量

## 📈 性能优化

### 1. **按需导入**
```typescript
// 只导入需要的函数
import { formatDate, formatCurrency } from '@/utils/format'
```

### 2. **组合式函数缓存**
```typescript
// 使用computed缓存计算结果
const filteredData = computed(() => {
  return searchArray(data.value, keyword.value, searchKeys.value)
})
```

### 3. **样式优化**
```scss
// 使用SCSS变量减少重复
.button {
  background: $primary-color;
  color: $text-primary;
}
```

## 🔄 迁移指南

### 从旧代码迁移到新架构

1. **导入类型**
```typescript
// 旧代码
const user: any = { ... }

// 新代码
import type { User } from '@/types'
const user: User = { ... }
```

2. **使用组合式函数**
```typescript
// 旧代码
const loading = ref(false)
const formData = reactive({ ... })

// 新代码
import { useForm } from '@/composables/useForm'
const { formData, loading } = useForm({ ... })
```

3. **使用工具函数**
```typescript
// 旧代码
const formatDate = (date) => { ... }

// 新代码
import { formatDate } from '@/utils/format'
```

## 🎉 总结

通过TypeScript封装，我们实现了：

- ✅ **类型安全**: 完整的TypeScript支持
- ✅ **代码复用**: 高度模块化的设计
- ✅ **维护性**: 清晰的代码结构
- ✅ **可扩展性**: 易于添加新功能
- ✅ **性能优化**: 按需导入和缓存
- ✅ **团队协作**: 统一的代码规范

这种架构为项目提供了坚实的基础，支持长期维护和扩展。

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

## 绘画限制尺寸：
```typescript
//新增computed，之后其他计算就不多提computed
import { reactive, ref, computed } from 'vue'

/* ---- 尺寸限制计算属性 ---- */
const sizeLimit = computed(() => {
  if (baseForm.performanceType === 'painting') {
    return {
      maxLength: 138,
      maxWidth: 69,
      description: '国画尺寸不超过四尺宣纸（69cm×138cm）对开'
    }
  } else {
    return {
      maxLength: 60,
      maxWidth: 40,
      description: '其他画种尺寸不超过对开（40cm×60cm）'
    }
  }
})
//填写框第一次填写可能为空
const lengthExceeded = computed(() => {
  return baseForm.artworkLength !== null && baseForm.artworkLength > sizeLimit.value.maxLength
})

const widthExceeded = computed(() => {
  return baseForm.artworkWidth !== null && baseForm.artworkWidth > sizeLimit.value.maxWidth
})
```

```html
   <!-- 作品尺寸 -->
        <el-row :gutter="24">
          <el-col :span="24">
            <div class="size-limit-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ sizeLimit.description }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="作品长度" required :error="lengthExceeded ? `长度不能超过${sizeLimit.maxLength}cm` : ''">
              <div class="dimension">
                <el-input 
                  v-model.number="baseForm.artworkLength" 
                  type="number" 
                  min="0" 
                  :max="sizeLimit.maxLength"
                  placeholder="请填写作品长边" 
                  :class="{ 'input-error': lengthExceeded }"
                />
                <span class="unit">cm</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="作品宽度" required :error="widthExceeded ? `宽度不能超过${sizeLimit.maxWidth}cm` : ''">
              <div class="dimension">
                <el-input 
                  v-model.number="baseForm.artworkWidth" 
                  type="number" 
                  min="0" 
                  :max="sizeLimit.maxWidth"
                  placeholder="请填写作品宽边" 
                  :class="{ 'input-error': widthExceeded }"
                />
                <span class="unit">cm</span>
              </div>
            </el-form-item>
```
```scss
.size-limit-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #1e40af;
  font-size: 14px;
  margin-bottom: 16px;
}

.input-error {
  :deep(.el-input__wrapper) {
    border-color: #f56565 !important;
    box-shadow: 0 0 0 1px #f56565 inset !important;
  }
}
// 调节输入框宽度使输入框提示完全显现
.duration,
.dimension {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  .el-input {
    min-width: 140px;
    max-width: 200px;
  }
  .unit {
    color: #606266;
    font-size: 14px;
  }
}
```

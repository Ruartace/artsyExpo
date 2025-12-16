<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
// 403 页面组件
</script>

<template>
  <el-result icon="warning" title="403" sub-title="无权限访问该页面">
    <template #extra>
      <el-button type="primary" @click="$router.replace('/login')">返回登录</el-button>
    </template>
  </el-result>
</template>
<!-- <template
>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import ActionToolbar from '@/components/common/ActionToolbar.vue'

type LeaderForm = {
  name: string
  phone: string
  gender?: string
  landline?: string
  deptAndTitle?: string
  email?: string
}
type StuRow = {
  index: number
  name?: string
  gender?: string
  nation?: string
  age?: string
  major?: string
  className?: string
  studentNo?: string
  workName?: string
  idNo?: string
  phone?: string
  teachingDesign?: string // 文件名占位
  teachingVideo?: string // 文件名占位
  avatar?: string // 文件名占位
}

const leader = reactive<LeaderForm>({ name: '', phone: '' })
const rowsBachelor = ref<StuRow[]>([])
const rowsJunior = ref<StuRow[]>([])
const keyword = ref('')
const filterFn = (arr?: StuRow[]) =>
  (arr ?? []).filter((r) => Object.values(r).filter(Boolean).join(',').includes(keyword.value))

function addRow(target: 'bachelor' | 'junior') {
  const list = target === 'bachelor' ? rowsBachelor : rowsJunior
  list.value.push({ index: list.value.length + 1 })
}
function clearRows(target: 'bachelor' | 'junior') {
  const list = target === 'bachelor' ? rowsBachelor : rowsJunior
  list.value = []
}
function removeRow(target: 'bachelor' | 'junior', row: StuRow) {
  const list = target === 'bachelor' ? rowsBachelor : rowsJunior
  list.value = list.value.filter((r) => r !== row).map((r, i) => ({ ...r, index: i + 1 }))
}
function submit() {
  /* TODO 对接后端 */
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>学生基本功展示报名</span>
        <el-input v-model="keyword" placeholder="模糊搜索" clearable style="max-width: 260px" />
      </div>
    </template>

    <el-form label-width="100" class="mb12">
      <el-row :gutter="16">
        <el-col :span="6"
          ><el-form-item label="姓名"
            ><el-input v-model="leader.name" placeholder="请输入姓名" /></el-form-item
        ></el-col>
        <el-col :span="6"
          ><el-form-item label="性别"
            ><el-select v-model="leader.gender" placeholder="请选择" clearable
              ><el-option label="男" value="男" /><el-option
                label="女"
                value="女" /></el-select></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="院系及职务"
            ><el-input
              v-model="leader.deptAndTitle"
              placeholder="请输入院系（部门）及职务" /></el-form-item
        ></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="6"
          ><el-form-item label="手机"
            ><el-input v-model="leader.phone" placeholder="请输入手机号" /></el-form-item
        ></el-col>
        <el-col :span="10"
          ><el-form-item label="座机"
            ><el-input v-model="leader.landline" placeholder="请输入联系座机" /></el-form-item
        ></el-col>
        <el-col :span="8"
          ><el-form-item label="邮箱"
            ><el-input v-model="leader.email" placeholder="请输入联系邮箱" /></el-form-item
        ></el-col>
      </el-row>
    </el-form>

    <el-divider content-position="left">参展学生名单（本科）</el-divider>
    <ActionToolbar
      :keyword="keyword"
      :importable="false"
      :downloadable="false"
      :addable="true"
      :clearable="true"
      @add="() => addRow('bachelor')"
      @clear="() => clearRows('bachelor')"
      @update:keyword="(v:string)=> (keyword=v)"
      @search="() => {}"
    />
    <el-table :data="filterFn(rowsBachelor)" border stripe class="mb12">
      <el-table-column prop="index" label="序号" width="80" />
      <el-table-column label="姓名" min-width="120"
        ><template #default="{ row }"><el-input v-model="row.name" /></template
      ></el-table-column>
      <el-table-column label="性别" width="120"
        ><template #default="{ row }"
          ><el-select v-model="row.gender" clearable
            ><el-option label="男" value="男" /><el-option
              label="女"
              value="女" /></el-select></template
      ></el-table-column>
      <el-table-column label="民族" min-width="100"
        ><template #default="{ row }"><el-input v-model="row.nation" /></template
      ></el-table-column>
      <el-table-column label="年龄" width="100"
        ><template #default="{ row }"><el-input v-model="row.age" /></template
      ></el-table-column>
      <el-table-column label="专业" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.major" /></template
      ></el-table-column>
      <el-table-column label="班级" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.className" /></template
      ></el-table-column>
      <el-table-column label="学号" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.studentNo" /></template
      ></el-table-column>
      <el-table-column label="曲目名称" min-width="160"
        ><template #default="{ row }"
          ><el-input v-model="row.workName" placeholder="请输入曲目名称" /></template
      ></el-table-column>
      <el-table-column label="身份证号" min-width="200"
        ><template #default="{ row }"><el-input v-model="row.idNo" /></template
      ></el-table-column>
      <el-table-column label="电话号" min-width="150"
        ><template #default="{ row }"><el-input v-model="row.phone" /></template
      ></el-table-column>
      <el-table-column label="教学设计" min-width="140"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="教学视频" min-width="140"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="一寸免冠照片" min-width="160"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="操作" width="100"
        ><template #default="{ row }"
          ><el-button type="danger" @click="removeRow('bachelor', row)">删除</el-button></template
        ></el-table-column
      >
    </el-table>

    <el-divider content-position="left">参展学生名单（专科）</el-divider>
    <ActionToolbar
      :keyword="keyword"
      :importable="false"
      :downloadable="false"
      :addable="true"
      :clearable="true"
      @add="() => addRow('junior')"
      @clear="() => clearRows('junior')"
      @update:keyword="(v:string)=> (keyword=v)"
      @search="() => {}"
    />
    <el-table :data="filterFn(rowsJunior)" border stripe class="mb12">
      <el-table-column prop="index" label="序号" width="80" />
      <el-table-column label="姓名" min-width="120"
        ><template #default="{ row }"><el-input v-model="row.name" /></template
      ></el-table-column>
      <el-table-column label="性别" width="120"
        ><template #default="{ row }"
          ><el-select v-model="row.gender" clearable
            ><el-option label="男" value="男" /><el-option
              label="女"
              value="女" /></el-select></template
      ></el-table-column>
      <el-table-column label="民族" min-width="100"
        ><template #default="{ row }"><el-input v-model="row.nation" /></template
      ></el-table-column>
      <el-table-column label="年龄" width="100"
        ><template #default="{ row }"><el-input v-model="row.age" /></template
      ></el-table-column>
      <el-table-column label="专业" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.major" /></template
      ></el-table-column>
      <el-table-column label="班级" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.className" /></template
      ></el-table-column>
      <el-table-column label="学号" min-width="140"
        ><template #default="{ row }"><el-input v-model="row.studentNo" /></template
      ></el-table-column>
      <el-table-column label="曲目名称" min-width="160"
        ><template #default="{ row }"
          ><el-input v-model="row.workName" placeholder="请输入曲目名称" /></template
      ></el-table-column>
      <el-table-column label="身份证号" min-width="200"
        ><template #default="{ row }"><el-input v-model="row.idNo" /></template
      ></el-table-column>
      <el-table-column label="电话号" min-width="150"
        ><template #default="{ row }"><el-input v-model="row.phone" /></template
      ></el-table-column>
      <el-table-column label="教学设计" min-width="140"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="教学视频" min-width="140"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="一寸免冠照片" min-width="160"
        ><template #default><el-button>点击上传</el-button></template></el-table-column
      >
      <el-table-column label="操作" width="100"
        ><template #default="{ row }"
          ><el-button type="danger" @click="removeRow('junior', row)">删除</el-button></template
        ></el-table-column
      >
    </el-table>

    <el-button type="primary" @click="submit">立即报名</el-button>
  </el-card>
</template>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mb12 {
  margin-bottom: 12px;
}
.tools {
  margin: 8px 0;
}
</style>


</template> -->


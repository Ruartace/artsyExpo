// 定义表格列的类型
export type RosterColumn = {
  prop: string
  label: string
  width?: number
  type?: 'text' | 'select'
  options?: Array<{ label: string; value: string }>
}

// 指导教师表格列定义
export const teacherColumns: RosterColumn[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  {
    prop: 'gender',
    label: '性别',
    width: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'phone', label: '联系方式', width: 160 },
]

// 参赛学生表格列定义
export const memberColumns: RosterColumn[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  {
    prop: 'gender',
    label: '性别',
    width: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'grade', label: '年级', width: 100 },
  { prop: 'studentId', label: '学籍号', width: 160 },
  { prop: 'phone', label: '联系方式', width: 160 },
]

// 老师指挥表格列定义
export const accompColumns: RosterColumn[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  {
    prop: 'gender',
    label: '性别',
    width: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'phone', label: '联系方式', width: 160 },
]

// 老师伴奏表格列定义
export const accompanimentColumns: RosterColumn[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'idNo', label: '身份证号', width: 200 },
  { prop: 'nation', label: '民族', width: 100 },
  { prop: 'age', label: '年龄', width: 100 },
  {
    prop: 'gender',
    label: '性别',
    width: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'phone', label: '联系方式', width: 160 },
]

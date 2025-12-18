import type { Column } from '@/types/roster'

export const memberColumns: Column[] = [
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
  { prop: 'school', label: '学校', width: 100 },
  { prop: 'studentId', label: '学籍号', width: 160 },
  { prop: 'phone', label: '联系方式', width: 160 },
  {
    prop: 'batch',
    label: '批次',
    width: 180,
    type: 'select',
    options: [
      { label: '第一批次', value: '1' },
      { label: '第二批次', value: '2' },
    ],
  },
]

export const teacherColumns: Column[] = [
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
  { prop: 'school', label: '学校', width: 100 },
  { prop: 'phone', label: '联系方式', width: 160 },
  {
    prop: 'batch',
    label: '批次',
    width: 180,
    type: 'select',
    options: [
      { label: '第一批次', value: '1' },
      { label: '第二批次', value: '2' },
    ],
  },
]

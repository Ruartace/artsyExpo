import type { Column } from '@/types/roster'

// 指导教师表格列定义
export const teacherColumns: Column[] = [
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'id_card', label: '身份证号', minWidth: 200, maxLength: 18 },
  { prop: 'ethnicity', label: '民族', minWidth: 100 },
  { prop: 'age', label: '年龄', minWidth: 100, type: 'number', min: 4, max: 120 },
  {
    prop: 'gender',
    label: '性别',
    minWidth: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'contact', label: '联系方式', minWidth: 160, maxLength: 11 },
]

// 参赛学生表格列定义
export const memberColumns: Column[] = [
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'id_card', label: '身份证号', minWidth: 200, maxLength: 18 },
  { prop: 'ethnicity', label: '民族', minWidth: 100 },
  { prop: 'age', label: '年龄', minWidth: 100, type: 'number', min: 4, max: 120 },
  {
    prop: 'gender',
    label: '性别',
    minWidth: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'grade', label: '年级', minWidth: 100 },
  { prop: 'student_id', label: '学籍号', minWidth: 160 },
  { prop: 'contact', label: '联系方式', minWidth: 160, maxLength: 11 },
]

// 老师指挥表格列定义
export const accompColumns: Column[] = [
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'id_card', label: '身份证号', minWidth: 200, maxLength: 18 },
  { prop: 'ethnicity', label: '民族', minWidth: 100 },
  { prop: 'age', label: '年龄', minWidth: 100, type: 'number', min: 4, max: 120 },
  {
    prop: 'gender',
    label: '性别',
    minWidth: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'contact', label: '联系方式', minWidth: 160, maxLength: 11 },
]

// 老师伴奏表格列定义
export const accompanimentColumns: Column[] = [
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'id_card', label: '身份证号', minWidth: 200, maxLength: 18 },
  { prop: 'ethnicity', label: '民族', minWidth: 100 },
  { prop: 'age', label: '年龄', minWidth: 100, type: 'number', min: 4, max: 120 },
  {
    prop: 'gender',
    label: '性别',
    minWidth: 150,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'contact', label: '联系方式', minWidth: 160, maxLength: 11 },
]

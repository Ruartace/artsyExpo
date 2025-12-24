import type { Column } from '@/types/roster'

export const memberColumns: Column[] = [
  { prop: 'name', label: '作者姓名', minWidth: 100 },
  { prop: 'id_card', label: '身份证号', minWidth: 180 },
  {
    prop: 'gender',
    label: '性别',
    minWidth: 80,
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  { prop: 'ethnicity', label: '民族', minWidth: 80 },
  { prop: 'age', label: '年龄', minWidth: 80 },
  { prop: 'student_id', label: '学籍号', minWidth: 140 },
  { prop: 'contact', label: '联系方式', minWidth: 120 },
  { prop: 'school', label: '学校', minWidth: 140 },
  { prop: 'grade', label: '年级', minWidth: 100 },
]

export const baseFormDefaults = {
  performanceType: '',
  categoryPath: [],
  artworkName: '',
  performerCount: null,
  creationTime: '',
  song1: '',
  song2: '',
  minutes: 0,
  seconds: 0,
  song1HasChinese: true,
  song1IsOriginal: false,
  song2HasChinese: true,
  song2IsOriginal: false,
  contact: '',
  phone: '',
  address: '',
  group: '',
  leader: '',
  tutor: '',
  conductor: '',
  notice: false,
  contactUnit: '',
  contactPosition: '',
  email: '',
  intro: ''
}

export const categoryOptions = [
  {
    label: '（一）教学案例',
    value: 'teachingCase',
    children: [
      { label: '1. 艺术课程活力课堂', value: '1' },
      { label: '2. 跨学科美育教学课例', value: '2' },
      { label: '3. 数字技术在美育教学中的应用', value: '3' },
      { label: '4. 美育课后服务教学实践', value: '4' }
    ]
  },
  {
    label: '（二）教学研究',
    value: 'teachingResearch',
    children: [
      { label: '1. 传承中华优秀传统文化教育实践研究', value: '1' },
      { label: '2. 艺术课程教学方法创新方法', value: '2' }
    ]
  },
  {
    label: '（三）实践活动',
    value: 'practiceActivity',
    children: [
      { label: '2. 中小学美育浸润行动实践', value: '2' },
      { label: '3. 常态化学生全员艺术展演实践', value: '3' },
      { label: '4. 城乡中小学美育交流帮扶实践', value: '4' },
    ]
  },
  {
    label: '（四）校园文化',
    value: 'campusCulture',
    children: [
      { label: '1. 中华传统传统文化艺术传承学校建设', value: '1' },
      { label: '2. 中小学艺术团建设', value: '2' },
      { label: '3. 最美校园建设', value: '3' },
      { label: '4. 社会资源整合与美育条件保障', value: '4' }
    ]
  }
]

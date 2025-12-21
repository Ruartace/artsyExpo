export type Column = {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  type?: 'text' | 'select' | 'number'
  options?: Array<{ label: string; value: string }>
  maxLength?: number
  min?: number
  max?: number
}

export type RosterItem = Record<string, string | number | null>

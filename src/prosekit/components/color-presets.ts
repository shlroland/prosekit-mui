export type EditorColorPreset = {
  key: string
  label: string
  value: string | null
}

export type EditorColorPresetGroup = {
  key: string
  label: string
  presets: EditorColorPreset[]
}

export const textColorPresetGroups: EditorColorPresetGroup[] = [
  {
    key: 'neutral',
    label: '基础',
    presets: [
      { key: 'default', label: '默认文字', value: null },
      { key: 'slate', label: '石墨', value: '#111827' },
      { key: 'gray', label: '灰色', value: '#64748b' },
      { key: 'white', label: '白色', value: '#ffffff' },
    ],
  },
  {
    key: 'semantic',
    label: '主题',
    presets: [
      { key: 'blue', label: '蓝色', value: '#2563eb' },
      { key: 'green', label: '绿色', value: '#16a34a' },
      { key: 'amber', label: '琥珀', value: '#d97706' },
      { key: 'red', label: '红色', value: '#dc2626' },
    ],
  },
  {
    key: 'extended',
    label: '扩展',
    presets: [
      { key: 'cyan', label: '青色', value: '#0891b2' },
      { key: 'violet', label: '紫色', value: '#7c3aed' },
      { key: 'pink', label: '粉色', value: '#db2777' },
      { key: 'brown', label: '棕色', value: '#a16207' },
    ],
  },
]

export const backgroundColorPresetGroups: EditorColorPresetGroup[] = [
  {
    key: 'neutral',
    label: '基础',
    presets: [
      { key: 'default', label: '透明背景', value: null },
      { key: 'gray', label: '浅灰', value: '#f3f4f6' },
      { key: 'slate', label: '雾灰', value: '#e2e8f0' },
      { key: 'stone', label: '石色', value: '#f5f5f4' },
    ],
  },
  {
    key: 'warm',
    label: '暖色',
    presets: [
      { key: 'yellow', label: '浅黄', value: '#fef3c7' },
      { key: 'orange', label: '浅橙', value: '#ffedd5' },
      { key: 'red', label: '浅红', value: '#fee2e2' },
      { key: 'pink', label: '浅粉', value: '#fce7f3' },
    ],
  },
  {
    key: 'cool',
    label: '冷色',
    presets: [
      { key: 'green', label: '浅绿', value: '#dcfce7' },
      { key: 'cyan', label: '浅青', value: '#cffafe' },
      { key: 'blue', label: '浅蓝', value: '#dbeafe' },
      { key: 'purple', label: '浅紫', value: '#ede9fe' },
    ],
  },
]

export const textColorPresets = textColorPresetGroups.flatMap((group) => group.presets)

export const backgroundColorPresets = backgroundColorPresetGroups.flatMap((group) => group.presets)

export function getPresetSwatchColor(preset: EditorColorPreset, fallback: string) {
  return preset.value ?? fallback
}

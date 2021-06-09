/**
 * 项目类型选项
 */
export const projectTypeOptions = [
  { key: 'executable', name: 'Executable' },
  { key: 'library', name: 'Library' },
]

/**
 * 电路板类型选项
 */
export const boardTypeOptions = [
  { key: 'SwiftIOBoard', name: 'SwiftIOBoard' },
  { key: 'SwiftIOFeather', name: 'SwiftIOFeather' },
]

/**
 * 默认项目类型
 */
export const defaultProjectType = projectTypeOptions[0].key

/**
 * 默认电路板类型
 */
export const defaultBoardType = boardTypeOptions[0].key

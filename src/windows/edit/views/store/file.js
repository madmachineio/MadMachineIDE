import { observable, action, computed } from 'mobx'
import { cloneDeep } from 'lodash'

const { clipboard, remote } = require('electron')

class FileStore {
  // 是否是示例项目
  @observable isExample = false

  // 项目名称
  @observable projectName = ''

  // 编辑文件列表
  @observable files = []

  // 编辑过的文件
  @observable editFileMap = {}

  // 编辑过的文件内容
  @observable editFileContentMap = {}

  // 当前编辑文件
  @observable activeFile = {}

  // 当前编辑文件的editor对象
  @observable activeEditor = null

  // 文件管理。所有文件或者文件夹
  @observable folders = {
    key: [],
  }

  @observable editFontSize = 14

  // 右键菜单 点击文件或者文件夹
  @observable managerContentFile = {}

  // 复制或者剪切文件或文件夹路径
  @observable copyFileData = null

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @computed get windowTitle() {
    let title = 'MadMachine'
    if (this.projectName) {
      title = this.projectName
      if (this.activeFile && this.activeFile.name) {
        title = `${this.activeFile.name} - ${this.projectName}`
      }
    }

    this.rootStore.editWindow.editWindow.setTitle(title)

    return title
  }

  @action getIsExample() {
    return this.rootStore.editWindow.isExample
  }

  // 设置当前是否有文件未保存
  setEditStatus() {
    const isEdit = Object.keys(this.editFileMap).reduce((flag, key) => flag || this.editFileMap[key], false)
    this.rootStore.editWindow.setEditStatus(isEdit)
  }

  setProjectExample(isExample) {
    this.isExample = isExample
  }

  /**
   * 刷新文件管理
   */
  @action refreshFiles() {
    this.rootStore.editWindow.fileManager.refreshPathFiles(this.folders.path)
  }

  @action setProjectName(projectName) {
    this.projectName = projectName
  }

  /**
   * 编辑文件管理
   */
  @action setFilesData(files) {
    this.files = files
    if (!this.activeFile) {
      this.setActiveFile(this.files[0])
    }
  }

  @action setActiveFile(file) {
    this.activeFile = file
  }

  @action setActiveEditor(editor) {
    this.activeEditor = editor
  }

  @action openFile(file) {
    this.setActiveFile(file)

    this.rootStore.editWindow.fileManager.openFile(file.path)
  }

  @action realRemoveOpenFile(file) {
    if (file.path === this.activeFile.path) {
      const activeFile = this.files.find(m => m.path !== file.path) || {}
      this.setActiveFile(activeFile)
    }

    this.editFileMap = {
      ...this.editFileMap,
      [file.path]: false,
    }
    this.setEditStatus()

    this.rootStore.editWindow.fileManager.removeOpenFile(file.path)
  }

  @action removeOpenFile(file) {
    if (this.editFileMap[file.path]) {
      this.rootStore.editWindow.fileSaveDialog(file.name, (type) => {
        switch (type) {
          case 2:
            this.saveFile(file)
            this.realRemoveOpenFile(file)
            break
          case 1:
            this.realRemoveOpenFile(file)
            break
          case 0:
          default:
        }
      })
    } else {
      this.realRemoveOpenFile(file)
    }
  }

  // 编辑文件状态
  @action editFile(file) {
    const { path } = file
    this.editFileMap = {
      ...this.editFileMap,
      [path]: true,
    }

    this.setEditStatus()
  }

  @action editFileContent(path, content) {
    this.editFileContentMap = {
      ...this.editFileContentMap,
      [path]: content,
    }
  }

  @action saveFile(file = this.activeFile) {
    if (!file) {
      return
    }

    this.rootStore.editWindow.saveFile(this.folders.path, file.path, this.editFileContentMap[file.path] || file.fileData || '')

    this.editFileMap = {
      ...this.editFileMap,
      [file.path]: false,
    }
    this.editFileContentMap = {
      ...this.editFileContentMap,
      [file.path]: '',
    }

    this.setEditStatus()
  }

  @action saveAllFile(isTip = true) {
    const saveFiles = this.files
      .filter(m => this.editFileMap[m.path])
      .map(file => ({
        ...file,
        fileData: this.editFileContentMap[file.path] || file.fileData || '',
      }))

    this.rootStore.editWindow.saveAllFile(this.folders.path, saveFiles, isTip, () => {
      saveFiles.forEach((file) => {
        this.editFileMap = {
          ...this.editFileMap,
          [file.path]: false,
        }
        this.editFileContentMap = {
          ...this.editFileContentMap,
          [file.path]: '',
        }
      })
    })

    this.setEditStatus()
  }

  /**
   * 文件管理
   */
  @action setFoldersData(folders) {
    this.folders = cloneDeep(folders)

    const mianFile = folders.children.find(m => m.name === 'main.swift')
    if (mianFile && !this.activeFile) {
      this.openFile(mianFile)
    }
  }

  @action openFolderData(folder) {
    this.setActiveFile(folder)

    this.rootStore.editWindow.fileManager.readeFolderSave(folder.path)
  }

  /**
   * 右键菜单
   */
  @action findFileByPath(path) {
    const filePath = path || this.folders.path

    let result = null
    const findFile = (data, p) => {
      if (data.path === p) {
        result = data
      } else {
        (data.children || []).forEach(item => findFile(item, p))
      }
    }

    findFile(this.folders, filePath)

    this.managerContentFile = result
    return this.managerContentFile
  }

  // 新建文件
  @action createFile() {
    this.rootStore.editWindow.fileManager.createFolderFile(this.managerContentFile.path)
  }

  // 新建文件夹
  @action createFolder() {
    this.rootStore.editWindow.fileManager.createFolderFolder(this.managerContentFile.path)
  }

  // 真实创建文件
  @action realCreateFile(name) {
    this.rootStore.editWindow.fileManager.realCreateFile(this.managerContentFile.path || this.folders.path, name)
  }

  // 真实创建文件夹
  @action realCreateFolder(name) {
    this.rootStore.editWindow.fileManager.realCreateFolder(this.managerContentFile.path, name)
  }

  // 在系统文件管理中显示当前目录或文件
  @action showInExplorer() {
    const splitTag = remote.getCurrentWindow().editWindow.getPlatform() === 'win32' ? '\\' : '/'
    let filePath = this.managerContentFile.path
    if (!this.managerContentFile.isDirectory) {
      filePath = this.managerContentFile.path
        .split(splitTag)
        .slice(0, -1)
        .join(splitTag)
    }
    this.rootStore.editWindow.fileManager.showInExplorer(filePath)
  }

  // 复制路径
  @action copyPath(data = this.managerContentFile.path) {
    clipboard.writeText(data)
  }

  // 重命名
  @action rename() {
    this.rootStore.editWindow.fileManager.rename(this.managerContentFile.path)
  }

  // 真实重命名
  @action realRename(newName) {
    this.rootStore.editWindow.fileManager.realRename(this.managerContentFile.path, newName)
  }

  // 删除文件或者文件夹
  @action delFile() {
    this.rootStore.editWindow.fileManager.delFile(this.managerContentFile.path)

    this.removeOpenFile(this.managerContentFile)
  }

  // 复制 文件夹或文件
  @action copyFile() {
    this.copyFileData = {
      path: this.managerContentFile.path,
      type: 'copy',
    }
  }

  // 剪切 文件夹或文件
  @action cutFile() {
    this.copyFileData = {
      path: this.managerContentFile.path,
      type: 'cut',
    }
  }

  // 粘贴文件或文件夹
  @action pasteFile() {
    if (!this.copyFileData) {
      return
    }

    this.rootStore.editWindow.fileManager.parseFile({
      ...this.copyFileData,
      targetPath: this.managerContentFile.path,
    })

    this.copyFileData = null
  }

  @action setFontSize(fontSize) {
    this.editFontSize = fontSize
  }
}

export default FileStore

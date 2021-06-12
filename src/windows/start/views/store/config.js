import { observable, action } from 'mobx'
import { defaultProjectType, defaultBoardType } from '../components/new/config'

// const { ipcRenderer } = require('electron')

class Config {
  @observable isCreate = false

  // 完整创建路径
  @observable createPath = ''

  // 最近打开项目
  @observable historyProject = []

  // 系统类型
  @observable sysType = ''

  /**
   * 电路板类型
   */
  @observable boardType = defaultBoardType

  /**
   * 项目类型
   */
  @observable projectType = defaultProjectType

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @action setIsCreate(isCreate) {
    this.isCreate = isCreate
  }

  @action initDefaultPath() {
    this.createPath = this.rootStore.window.getDefaultPath()
  }

  @action selectPath() {
    this.rootStore.window.selectDir((folder) => {
      this.createPath = Array.isArray(folder) ? folder[0] : folder
    })
  }

  @action setCreatePath(path) {
    this.createPath = path
  }

  @action createProject() {
    console.log('emit mobx createProject')
    this.rootStore.window.createProject(this.createPath, this.projectType, this.boardType)
  }

  @action openExistingProject() {
    this.rootStore.window.openExistingProject()
  }

  @action setHistoryPorject(historyProject) {
    this.historyProject = historyProject
      .map(item => ({
        ...item,
      }))
      .reverse()
  }

  @action openProject(projectFile) {
    this.rootStore.window.openProject(projectFile)
  }

  @action setSysType(sysType) {
    this.sysType = sysType
  }

  /**
   * 设置电路板类型
   * @param {*} boardType
   */
  @action setBoardType(boardType) {
    this.boardType = boardType
  }

  /**
   * 设置项目类型
   * @param {*} projectType
   */
  @action setProjectType(projectType) {
    this.projectType = projectType
  }
}

export default Config

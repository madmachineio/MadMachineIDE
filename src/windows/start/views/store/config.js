import { observable, action } from 'mobx'

// const { ipcRenderer } = require('electron')

class Config {
  @observable isCreate = false

  @observable createPath = ''

  @observable historyProject = []

  @observable sysType = ''

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
    this.rootStore.window.createProject(this.createPath)
  }

  @action openExistProject() {
    this.rootStore.window.openExistProject()
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
}

export default Config

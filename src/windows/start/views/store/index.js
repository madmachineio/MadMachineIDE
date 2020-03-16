import ConfigStore from './config'

const { ipcRenderer, remote } = require('electron')

class RootStore {
  constructor() {
    this.window = remote.getCurrentWindow().window

    this.initEvents()
    this.initStore()
  }

  initStore() {
    this.configStore = new ConfigStore(this)
  }

  initEvents() {
    ipcRenderer.on('SET-WEB-THEME', (event, themeName) => {
      document.querySelector('html').setAttribute('data-theme', themeName)
    })

    ipcRenderer.on('HISTORY_PROJECT', (event, historyProject) => {
      this.configStore.setHistoryPorject(historyProject)
    })

    ipcRenderer.on('IS_CREATE', (event, isCreate) => {
      this.configStore.setIsCreate(isCreate)
    })

    ipcRenderer.on('SYSTEM_TYPE', (event, sysType) => {
      this.configStore.setSysType(sysType)
    })
  }
}

export default RootStore

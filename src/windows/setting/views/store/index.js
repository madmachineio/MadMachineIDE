import SettingConfig from './setting'

const { ipcRenderer } = require('electron')

class RootStore {
  constructor() {
    this.initEvents()
    this.initStore()
  }

  initStore() {
    this.settingStore = new SettingConfig(this)
  }

  initEvents() {
    ipcRenderer.on('SET-WEB-THEME', (event, themeName) => {
      document.querySelector('html').setAttribute('data-theme', themeName)

      this.settingStore.setTheme(themeName, false)
    })
  }
}

export default RootStore

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
    ipcRenderer.on('SET-WEB-THEME', () => {
      document.querySelector('html').setAttribute('data-theme', 'white')

      // this.settingStore.setTheme(themeName, false)
    })
  }
}

export default RootStore

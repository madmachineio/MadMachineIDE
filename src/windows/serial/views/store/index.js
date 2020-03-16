import SerialStore from './serial'

const { ipcRenderer, remote } = require('electron')

class RootStore {
  constructor() {
    this.serialWindow = remote.getCurrentWindow().serialWindow

    this.initEvents()
    this.initStore()
  }

  initStore() {
    this.serialStore = new SerialStore(this)
  }

  initEvents() {
    ipcRenderer.on('SET-WEB-THEME', (event, themeName) => {
      document.querySelector('html').setAttribute('data-theme', themeName)
    })

    ipcRenderer.on('SERIAL-PORT-LIST', (event, list) => {
      this.serialStore.setList(list)
    })
    ipcRenderer.on('SERIAL-STATUS', (event, status) => {
      this.serialStore.setStatus(status)
    })
    ipcRenderer.on('SERIAL-MESSAGE', (event, message) => {
      this.serialStore.setMessage(message)
    })
    ipcRenderer.on('CONNECT-MESSAGE', (event, message) => {
      this.serialStore.setConnectMessage(message)
    })
  }
}

export default RootStore

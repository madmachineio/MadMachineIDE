import UserStore from './user'

const { ipcRenderer } = require('electron')

class RootStore {
  constructor() {
    this.initEvents()
    this.initStore()
  }

  initStore() {
    this.userStore = new UserStore(this)
  }

  initEvents() {
    ipcRenderer.on('SET-WEB-THEME', () => {
      document.querySelector('html').setAttribute('data-theme', 'white')
    })

    ipcRenderer.on('INIT_USER_INFO', (event, userInfo) => {
      this.userStore.setUserInfo(userInfo)
    })
  }
}

export default RootStore

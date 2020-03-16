import { observable, action } from 'mobx'

const { ipcRenderer } = require('electron')

class Config {
  @observable themeName = 'black'

  @action setTheme(theme, isSave = true) {
    this.themeName = theme

    if (isSave) {
      ipcRenderer.send('SET_THEME_NAME', this.themeName)
    }
  }
}

export default Config

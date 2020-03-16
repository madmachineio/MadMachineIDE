import { observable, action } from 'mobx'
import { debounce } from 'lodash'

class Config {
  // 文件管理是否打开
  @observable fileManagerShow = true

  // 文件管理宽度
  @observable fileManagerWdith = 300

  // 控制台高度
  @observable consoleHeight = 31

  // 最后一次控制台高度
  @observable lastConsoleHeight = 31

  @observable themeName = 'white'

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @action setTheme(name) {
    this.themeName = name
  }

  @action setManageWidth(width) {
    this.fileManagerWdith = width

    this.rootStore.editWindow.setConfig('LAYOUT.FILEMANAGE.WIDTH', width)
  }

  @action setFileManageShow(isShow) {
    this.fileManagerShow = isShow
  }

  @action setConsoleHeight(height) {
    this.flagLastHeight(this.consoleHeight)

    this.consoleHeight = height

    this.rootStore.editWindow.setConfig('LAYOUT.CONSOLE.HEIGHT', height)
  }

  @action flagLastHeight = debounce((height) => {
    if (height !== '80%') {
      this.lastConsoleHeight = height
    }
  }, 500)
}

export default Config

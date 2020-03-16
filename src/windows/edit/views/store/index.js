import FileStore from './file'
import ConsoleStore from './console'
import ConfigStore from './config'
import UsbStore from './usb'
import UserStore from './user'
import ExampleStore from './example'

import emitter from '@/utils/emitter'

const { ipcRenderer, remote } = require('electron')

class RootStore {
  constructor() {
    this.editWindow = remote.getCurrentWindow().editWindow

    this.initEvents()
    this.initStore()
  }

  initStore() {
    this.fileStore = new FileStore(this)
    this.consoleStore = new ConsoleStore(this)
    this.configStore = new ConfigStore(this)
    this.usbStore = new UsbStore(this)
    this.userStore = new UserStore(this)
    this.exampleStore = new ExampleStore(this)
  }

  initEvents() {
    ipcRenderer.on('SET-WEB-THEME', (event, themeName) => {
      document.querySelector('html').setAttribute('data-theme', themeName)

      this.configStore.setTheme(themeName)
    })

    ipcRenderer.on('PROJECT_EXAMPLE', (event, isExample) => {
      this.fileStore.setProjectExample(isExample)
    })
    ipcRenderer.on('OPEN_FILES', (event, files) => {
      this.fileStore.setFilesData(files)
    })
    ipcRenderer.on('PORJECT_NAME', (event, projectName) => {
      this.fileStore.setProjectName(projectName)
    })

    ipcRenderer.on('OPEN_FOLDERS', (event, folders) => {
      this.fileStore.setFoldersData(folders)
    })

    ipcRenderer.on('FILE_SAVE_ALL', (event, isTip) => {
      this.fileStore.saveAllFile(isTip)
    })
    ipcRenderer.on('FILE_SAVE', () => {
      this.fileStore.saveFile()
    })

    ipcRenderer.on('CONSOLE_MESSAGE', (event, message) => {
      this.consoleStore.setConsoleContent(message)
    })
    ipcRenderer.on('CONSOLE_STATUS', (event, status) => {
      this.consoleStore.setConsoleRun(status)
    })

    ipcRenderer.on('USB_DEVICE_ADD', (event, dir) => {
      this.usbStore.setUsbDir(dir, true)
    })

    ipcRenderer.on('USB_DEVICE_REMOVE', (event, dir) => {
      this.usbStore.setUsbDir(dir, false)
    })

    ipcRenderer.on('COPY_FILE_PROGRESS', (event, progress) => {
      this.usbStore.setCopyProgress(progress)
    })

    ipcRenderer.on('INIT_USER_INFO', (event, userInfo) => {
      this.userStore.initUserInfo(userInfo)
    })
    ipcRenderer.on('INIT_USB_TIP_FLAG', (event, flag) => {
      this.usbStore.setShowTipFlag(flag)
    })

    ipcRenderer.on('EXAMPLE_LIST_PROJECT', (event, list) => {
      this.exampleStore.setList(list)
    })

    ipcRenderer.on('INIT_FILEMANAGER_WIDTH', (event, width) => {
      this.configStore.setManageWidth(width)
    })

    ipcRenderer.on('INIT_CONSOLE_HEIGHT', (event, height) => {
      this.configStore.setConsoleHeight(height)
    })

    ipcRenderer.on('SET_FONT_SIEZ', (event, fontsize) => {
      this.fileStore.setFontSize(fontsize)
    })

    ipcRenderer.on('FILE_EDIT_UNDO', () => {
      emitter.emit('FILE_EDIT_UNDO')
    })
    ipcRenderer.on('FILE_EDIT_REDO', () => {
      emitter.emit('FILE_EDIT_REDO')
    })
  }
}

export default RootStore

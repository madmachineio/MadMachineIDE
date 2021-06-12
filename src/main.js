/* eslint-disable import/no-webpack-loader-syntax */
import {
  app, Menu, dialog, shell,
} from 'electron'
import os from 'os'

import { trackEvent, pv, enableTrack } from './utils/ga'
import EditWindow from './windows/edit'
import SettingWindow from './windows/setting'
import UserWindow from './windows/user'
import AboutWindow from './windows/about'
import MenuManager from './modules/menuManager'
import StartWindow from './windows/start'
import { fromatPath, exsitProjectFile } from './utils/path'

import UpdateManager from './modules/updateManager'
import InitManager from './modules/initManager'

if (os.platform() === 'win32') {
  global.PATH_SPLIT = '\\'
  global.PATH_SPLIT_REG = '\\\\'
} else {
  global.PATH_SPLIT = '/'
  global.PATH_SPLIT_REG = '/'
}
// Share with renderer process
global.trackEvent = trackEvent
global.pv = pv
global.enableTrack = enableTrack

class Main {
  constructor() {
    this.editWindows = []
    this.settingWindow = null
    this.serialWindow = null
    this.userWindow = null
    this.aboutWindow = null
    this.startWindow = null

    this.openFilePath = ''

    this.updater = null
    this.init = null

    this.setAppUserModelId()
    this.initAppEvent()
  }

  createEditWindow(projectFile, isExample = false) {
    console.log(`创建编辑窗口 ${projectFile}`)
    if (!isExample && !exsitProjectFile(projectFile)) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Open Project',
        message: 'Project not found',
        buttons: ['Sure'],
        defaultId: 0,
      })
      return false
    }

    let isOpen = false
    this.editWindows.forEach((win) => {
      if (win.projectFile === projectFile) {
        isOpen = true
        win.editWindow.focus()
      }
    })

    if (!isOpen) {
      const editWindow = new EditWindow(this, projectFile, isExample)

      const lastOne = this.editWindows.slice(-1)[0]
      if (lastOne) {
        const pos = lastOne.editWindow.getPosition()
        editWindow.editWindow.setPosition(pos[0] + 20, pos[1] + 20, false)
      }

      this.editWindows.push(editWindow)
    }

    if (this.startWindow) {
      this.startWindow.window.close()
    }

    return true
  }

  removeEditWindow(id) {
    this.editWindows = this.editWindows.filter(m => m.id !== id)

    if (!this.editWindows || !this.editWindows.length) {
      app.quit()
    }
  }

  getActivedEditWindow() {
    return this.editWindows.filter(m => m.editWindow.isFocused())[0]
  }

  // 显示用户登录
  showUserView() {
    if (!this.userWindow) {
      this.userWindow = new UserWindow(this)
    }
  }

  openCommunity() {
    shell.openExternal('https://discord.gg/zZ9bFHK')
  }

  removeUserView() {
    this.userWindow = null
  }

  // 显示设置页面
  showSettingViwe() {
    if (!this.settingWindow) {
      this.settingWindow = new SettingWindow(this)
    }
  }

  removeSettingView() {
    this.settingWindow = null
  }

  // 显示关于
  showAboutView() {
    if (!this.aboutWindow) {
      this.aboutWindow = new AboutWindow(this)
    }
  }

  removeAboutView() {
    this.aboutWindow = null
  }

  // 启动页
  showStartView(opts) {
    if (!this.startWindow) {
      this.startWindow = new StartWindow(this, opts)

      if (os.platform() === 'darwin') {
        Menu.getApplicationMenu().items.forEach((item, index) => {
          if (index === 1 || index === 2) {
            const submenu = item.submenu.items || []
            submenu.forEach((m) => {
              const menuItem = m
              menuItem.visible = false
            })
          }
        })
      }
    }
  }

  removeStartView() {
    this.startWindow = null

    if (os.platform() === 'darwin') {
      Menu.getApplicationMenu().items.forEach((item, index) => {
        if (index === 1 || index === 2) {
          const submenu = item.submenu.items || []
          submenu.forEach((m) => {
            const menuItem = m
            menuItem.visible = true
          })
        }
      })
    }

    if (!this.editWindows || !this.editWindows.length) {
      app.quit()
    }
  }

  updateManager() {
    if (this.updater) {
      return
    }

    this.updater = new UpdateManager()
  }

  initManager() {
    if (this.init) {
      return
    }

    this.init = new InitManager()
  }

  setAppUserModelId() {
    app.setAppUserModelId('com.madmachine.app')
  }

  initAppEvent() {
    if (os.platform() !== 'darwin') {
      const file = process.argv[1] || ''
      this.openFilePath = /\.mmp$/.test(file) ? file : ''
    }

    app.on('open-file', (event, path) => {
      event.preventDefault()

      if (fromatPath(path).ext === '.mmp') {
        this.openFilePath = path
      }

      if (app.isReady()) {
        this.createEditWindow(this.openFilePath)
        this.openFilePath = ''
      }
    })

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      trackEvent('App', 'Startup')

      if (os.platform() === 'darwin') {
        const menu = new MenuManager(this)
        Menu.setApplicationMenu(Menu.buildFromTemplate(menu.initMacMenu()))
      } else {
        Menu.setApplicationMenu(null)
      }

      if (this.openFilePath) {
        this.createEditWindow(this.openFilePath)
        this.openFilePath = ''
      } else {
        this.showStartView()
      }

      this.updateManager()
      this.initManager()
    })


    // Quit when all windows are closed.
    app.on('window-all-closed', () => this.appAllClosed())

    app.on('activate', () => this.appActivate())
  }

  appAllClosed() {
    trackEvent('App', 'Exit')

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }

  appActivate() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (!this.editWindow) {
    //   this.createEditWindow()
    // }
  }
}


new Main()

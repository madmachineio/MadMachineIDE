import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'
import os from 'os'

import { getConfig, setConfig } from '../../config'

class UserWindow {
  constructor(parent) {
    this.userWindow = null
    this.parent = parent

    this.createWindow()
    this.loadPage()

    this.initEvent()
  }

  createWindow() {
    this.userWindow = new BrowserWindow({
      // parent: this.parent,
      title: 'User Login',
      width: 420,
      height: os.platform() === 'win32' ? 320 : 290,
      // backgroundColor: getConfig('THEME.BG_COLOR'),
      show: false,
      modal: true,
      alwaysOnTop: true,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      resizable: false,
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
      // titleBarStyle: 'hidden',
      webPreferences: {
        // javascript: true,
        // plugins: true,
        nodeIntegration: true, // 不集成 Nodejs
        // webSecurity: false,
        // preload: path.join(__dirname, '../../../public/renderer.js'), // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
      },
    })
  }

  loadPage() {
    const url = getConfig('USER_WINDOW.URL')
    this.userWindow.loadURL(
      /http:\/\//g.test(url)
        ? url
        : formatUrl({
          pathname: path.join(__dirname, url),
          protocol: 'file',
          slashes: true,
        }),
    )
  }

  initEvent() {
    let saveUserInfoHandle = null
    let cancelUserInfoHandle = null
    let setThemeHandle = null

    this.userWindow.webContents.on('dom-ready', this.domReady.bind(this))

    this.userWindow.on('closed', () => {
      this.parent.removeUserView()
    })

    this.userWindow.on('close', () => {
      ipcMain.removeListener('SAVE_USER_INFO', saveUserInfoHandle)
      ipcMain.removeListener('CANCEL_USER_INFO', cancelUserInfoHandle)
      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
    })

    ipcMain.on(
      'SAVE_USER_INFO',
      (saveUserInfoHandle = (event, userInfo) => {
        setConfig('USER.INFO', userInfo)

        this.userWindow.close()
      }),
    )

    ipcMain.on(
      'CANCEL_USER_INFO',
      (cancelUserInfoHandle = () => {
        this.userWindow.close()
      }),
    )

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        this.setTheme(themeName)
      }),
    )
  }

  domReady() {
    this.userWindow.show()

    if (getConfig('DEBUG')) {
      this.userWindow.webContents.openDevTools()
    }

    this.setTheme()
    this.setUserInfo()
  }

  setTheme(themeName) {
    this.userWindow.webContents.send(
      'SET-WEB-THEME',
      themeName || getConfig('THEME.NAME'),
    )
  }

  setUserInfo() {
    this.userWindow.webContents.send('INIT_USER_INFO', getConfig('USER.INFO'))
  }

  close() {
    if (this.userWindow) {
      this.userWindow.close()
    }
  }
}

export default UserWindow

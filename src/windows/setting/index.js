import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'

import { getConfig, setConfig } from '../../config'

class SettingWindow {
  constructor(parent) {
    this.settingWindow = null
    this.parent = parent

    this.createWindow()
    this.loadPage()

    this.initEvent()
  }

  createWindow() {
    this.settingWindow = new BrowserWindow({
      // parent: this.parent,
      title: 'Preferences',
      width: 420,
      height: 250,
      backgroundColor: getConfig('THEME.BG_COLOR'),
      show: false,
      modal: true,
      alwaysOnTop: true,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      resizable: false,
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
      // titleBarStyle: 'hidden',
      // webPreferences: {
      //   javascript: true,
      //   plugins: true,
      //   nodeIntegration: true, // 不集成 Nodejs
      //   webSecurity: false,
      //   preload: path.join(__dirname, '../../../public/renderer.js'), // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
      // },
    })
  }

  loadPage() {
    const url = getConfig('SETTING_WINDOW.URL')
    this.settingWindow.loadURL(
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
    let setThemeHandle = null
    let setFontHandle = null

    this.settingWindow.on('closed', () => {
      this.parent.removeSettingView()
    })

    this.settingWindow.webContents.on('dom-ready', this.domReady.bind(this))

    this.settingWindow.on('close', () => {
      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
      ipcMain.removeListener('SET_FONT_SIZE', setFontHandle)
    })

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        setConfig('THEME.NAME', themeName)
        setConfig('THEME.BG_COLOR', themeName === 'black' ? '#252531' : '#ffffff')

        this.setTheme(themeName)
      }),
    )

    ipcMain.on(
      'SET_FONT_SIZE',
      (setFontHandle = (event, val) => {
        const fontSize = (getConfig('EDITER.FONTSIZE') || 14) + val
        setConfig('EDITER.FONTSIZE', fontSize)
      }),
    )
  }

  domReady() {
    this.settingWindow.show()

    if (getConfig('DEBUG')) {
      this.settingWindow.webContents.openDevTools()
    }

    this.setTheme()
  }

  setTheme(themeName) {
    this.settingWindow.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }

  close() {
    if (this.settingWindow) {
      this.settingWindow.close()
    }
  }
}

export default SettingWindow

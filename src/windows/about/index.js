import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'

import { getConfig, setConfig } from '../../config'

class AboutWindow {
  constructor(parent) {
    this.window = null
    this.parent = parent

    this.createWindow()
    this.setMenu()
    this.loadPage()

    this.initEvent()
  }

  createWindow() {
    this.window = new BrowserWindow({
      // parent: this.parent,
      title: 'About',
      width: 330,
      height: 180,
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
    const url = getConfig('ABOUT_WINDOW.URL')
    this.window.loadURL(
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

    this.window.on('closed', () => {
      this.parent.removeAboutView()
    })

    this.window.webContents.on('dom-ready', this.domReady.bind(this))

    this.window.on('close', () => {
      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
    })

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        setConfig('THEME.NAME', themeName)

        this.setTheme(themeName)
      }),
    )
  }

  setMenu() {
    this.window.setMenu(null)
  }

  domReady() {
    this.window.show()

    if (getConfig('DEBUG')) {
      this.window.webContents.openDevTools()
    }

    this.setTheme()
  }

  setTheme(themeName) {
    this.window.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }

  close() {
    if (this.window) {
      this.window.close()
    }
  }
}

export default AboutWindow

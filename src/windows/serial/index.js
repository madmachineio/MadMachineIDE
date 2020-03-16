import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { EventEmitter } from 'events'
import { format as formatUrl } from 'url'

import { getConfig } from '../../config'
import SerialManager from '../../modules/serialManager'

class SerialWindow {
  constructor(parent) {
    this.serialWindow = null
    this.parent = parent

    this.eventEmitter = new EventEmitter()
    this.serialManager = new SerialManager(this.eventEmitter, this)

    this.createWindow()
    this.loadPage()

    this.initEvent()
  }

  createWindow() {
    this.serialWindow = new BrowserWindow({
      parent: this.parent.editWindow,
      title: 'Serial',
      width: 800,
      height: 500,
      // backgroundColor: '#252531',
      show: false,
      // modal: true,
      alwaysOnTop: true,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      resizable: false,
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
      webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: true, // 不集成 Nodejs
        webSecurity: false,
      },
    })

    this.serialWindow.serialWindow = this
  }

  loadPage() {
    const url = getConfig('SERIAL_WINDOW.URL')
    this.serialWindow.loadURL(
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

    this.serialWindow.on('closed', () => {
      this.parent.removeSerialView()

      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
    })

    this.serialWindow.webContents.on('dom-ready', this.domReady.bind(this))

    this.serialWindow.on('close', () => {
      this.serialManager.destory()
    })

    this.eventEmitter.on('status', (status) => {
      this.serialWindow.webContents.send('SERIAL-STATUS', status)
    })
    this.eventEmitter.on('message', (message) => {
      this.serialWindow.webContents.send('SERIAL-MESSAGE', message)
    })
    this.eventEmitter.on('connect-message', (message) => {
      this.serialWindow.webContents.send('CONNECT-MESSAGE', message)
    })
    this.eventEmitter.on('SERIAL-LIST', (list) => {
      this.serialWindow.webContents.send('SERIAL-PORT-LIST', list)
    })

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        this.setTheme(themeName)
      }),
    )
  }

  domReady() {
    this.serialWindow.show()

    this.serialManager.initSerialList()

    if (getConfig('DEBUG')) {
      this.serialWindow.webContents.openDevTools()
    }

    this.setTheme()
  }

  setTheme(themeName) {
    this.serialWindow.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }
}

export default SerialWindow

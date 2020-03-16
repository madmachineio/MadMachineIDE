import {
  app, BrowserWindow, ipcMain, dialog,
} from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

import { format as formatUrl } from 'url'
import { getConfig } from '../../config'
import { mkdirsSync, exsitProject } from '../../utils/path'

const getNewProjectPath = (opath, index = 0) => {
  let realPath = opath
  if (index > 0) {
    realPath = opath + index
  }
  if (fs.existsSync(realPath)) {
    return getNewProjectPath(opath, index + 1)
  }
  return realPath
}

class Start {
  constructor(parent, opts = {}) {
    this.window = null
    this.parent = parent
    this.opts = opts

    this.createWindow()
    this.loadPage()

    this.initEvent()
  }

  createWindow() {
    this.window = new BrowserWindow({
      // parent: this.parent,
      title: 'Welcome to MadMachine',
      width: 800,
      height: 470,
      backgroundColor: getConfig('THEME.BG_COLOR'),
      show: false,
      modal: false,
      alwaysOnTop: false,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      resizable: false,
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
    })

    this.window.window = this
  }

  loadPage() {
    const url = getConfig('START_WINDOW.URL')
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
      this.parent.removeStartView()
    })

    this.window.webContents.on('dom-ready', this.domReady.bind(this))

    this.window.on('close', () => {
      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
    })

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        this.setTheme(themeName)
      }),
    )
  }

  domReady() {
    this.window.show()

    if (getConfig('DEBUG')) {
      this.window.webContents.openDevTools()
    }

    this.setTheme()
    this.setHistoryProject()
    this.setCreate()

    this.window.webContents.send('SYSTEM_TYPE', os.platform())
  }

  setCreate() {
    this.window.webContents.send('IS_CREATE', this.opts.new || false)
  }

  setTheme(themeName) {
    this.window.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }

  setHistoryProject() {
    this.window.webContents.send('HISTORY_PROJECT', (getConfig('PROJECT.HISTORY') || []).filter(m => exsitProject(m.folderPath)))
  }

  getDefaultPath() {
    return getNewProjectPath(path.resolve(app.getPath('documents'), 'MadMachine', 'untitled'))
  }

  selectDir(next) {
    dialog.showOpenDialog(
      {
        properties: ['openDirectory'],
      },
      (folders) => {
        if (folders) {
          next(folders)
        }
      },
    )
  }

  createProject(createPath) {
    mkdirsSync(createPath)

    const projectName = createPath.split(global.PATH_SPLIT).slice(-1)[0]
    const openPath = path.resolve(createPath, `${projectName}.mmswift`)
    fs.writeFileSync(openPath, '')

    const result = this.parent.createEditWindow(openPath)
    if (result) {
      this.window.close()
    }
  }

  openProject(projectFile) {
    if (this.parent.createEditWindow(projectFile)) {
      this.window.close()
    }
  }

  openExistProject() {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'MadMachine', extensions: ['mmswift'] }],
        properties: ['openFile', 'createDirectory'],
      },
      (files) => {
        if (files) {
          this.parent.createEditWindow(files[0])

          this.window.close()
        }
      },
    )
  }

  close() {
    if (this.window) {
      this.window.close()
    }
  }
}

export default Start

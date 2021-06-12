import {
  app, BrowserWindow, ipcMain, dialog,
} from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { EventEmitter } from 'events'

import { format as formatUrl } from 'url'
import { getConfig } from '../../config'
import { mkdirsSync, exsitProject } from '../../utils/path'
import ConsoleManager from '../../modules/consoleManager'

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

    this.eventEmitter = new EventEmitter()
    this.consoleManager = new ConsoleManager(this.eventEmitter, this)

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
      resizable: false, // TODO:
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
      webPreferences: {
        nodeIntegration: true,
      },
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
    let setHeightHandle = null

    this.window.on('closed', () => {
      this.parent.removeStartView()
    })

    this.window.webContents.on('dom-ready', this.domReady.bind(this))

    this.window.on('close', () => {
      ipcMain.removeListener('SET_THEME_NAME', setThemeHandle)
      ipcMain.removeListener('SET_WINDOW_HEIGHT', setHeightHandle)
    })

    ipcMain.on(
      'SET_THEME_NAME',
      (setThemeHandle = (event, themeName) => {
        this.setTheme(themeName)
      }),
    )

    // 监听修改高度
    ipcMain.on(
      'SET_WINDOW_HEIGHT',
      (setHeightHandle = (e, data) => {
        // console.log(`SET_WINDOW_HEIGHT ${data}`)
        this.window.setSize(800, data, true)
      }),
    )
  }

  domReady() {
    if (getConfig('DEBUG')) {
      this.window.webContents.openDevTools()
    }

    this.setTheme()
    this.setHistoryProject()
    this.setCreate()

    this.window.webContents.send('SYSTEM_TYPE', os.platform())

    setTimeout(() => {
      this.window.show()
    }, 500)
  }

  setCreate() {
    this.window.webContents.send('IS_CREATE', this.opts.new || false)
  }

  setTheme(themeName) {
    this.window.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }

  setHistoryProject() {
    this.window.webContents.send(
      'HISTORY_PROJECT',
      (getConfig('PROJECT.HISTORY') || [])
        .filter(m => exsitProject(m.folderPath) && !m.folderPath.includes('MadMachine/projects')),
)
  }

  getDefaultPath() {
    return getNewProjectPath(path.resolve(app.getPath('documents'), 'MadMachine', 'Projects', 'untitled'))
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

  /**
   * 新建项目
   * @param {*} createPath 项目路径
   * @param {*} projectType 项目类型
   * @param {*} boardType 电路板类型
   */
  async createProject(createPath, projectType, boardType) {
    console.log('emit root store createProject')

    // 检查项目文件夹是否已存在
    const isDirExist = fs.existsSync(createPath)
    if (isDirExist) {
      dialog.showMessageBox({
        title: 'Fail to create',
        type: 'info',
        message: 'The project already exists, please reselect',
      })
      return
    }

    mkdirsSync(createPath)

    const projectName = 'Package' // createPath.split(global.PATH_SPLIT).slice(-1)[0]
    const openPath = path.resolve(createPath, `${projectName}.mmp`)
    // fs.writeFileSync(openPath, '')
    const initProjectResult = await this.consoleManager.initProject(createPath, projectType, boardType)

    // 新建失败
    if (!initProjectResult.result) {
      console.log('新建项目失败')
      dialog.showMessageBox({
        title: 'Fail to create',
        type: 'error',
        message: initProjectResult.msg,
      })
      return
    }

    // 根据新建路径打开窗口
    const dirPathSplits = openPath.split(global.PATH_SPLIT_REG)
    // dirPathSplits.splice(dirPathSplits.length - 1, 1)
    dirPathSplits[dirPathSplits.length - 1] = 'Sources'
    const dirPath = dirPathSplits.join(global.PATH_SPLIT_REG)

    console.log(`新项目地址 ${dirPath}`)
    console.log(fs.readdirSync(dirPath))
    const result = this.parent.createEditWindow(openPath)
    console.log('打开新项目结束')
    console.log(fs.readdirSync(dirPath))
    if (result) {
      console.log('打开新项目成功')
      this.window.close()
      return
    }

    console.log('打开新项目失败')
  }

  openProject(projectFile) {
    if (this.parent.createEditWindow(projectFile)) {
      this.window.close()
    }
  }

  openExistingProject() {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'MadMachine', extensions: ['mmp'] }],
        properties: ['openFile', 'createDirectory'],
      },
      (files) => {
        if (files) {
          this.parent.createEditWindow(files[0])
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

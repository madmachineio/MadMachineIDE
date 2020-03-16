import {
  app, BrowserWindow, ipcMain, dialog,
} from 'electron'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { EventEmitter } from 'events'
import { format as formatUrl } from 'url'

import FileManager from '../../modules/fileManager'
import ConsoleManager from '../../modules/consoleManager'
import UsbManager from '../../modules/usbManager'
import ExampleManager from '../../modules/exampleManager'
import MenuManager from '../../modules/menuManager'

import SerialWindow from '../serial'

import { getConfig, setConfig } from '../../config'

class EditWindow {
  constructor(main, projectFile, isExample) {
    this.id = `${new Date().getTime()}${Math.ceil(Math.random() * 100000)}`

    this.app = main
    this.projectFile = projectFile
    this.isExample = isExample
    this.editWindow = null
    this.serialWindow = null

    this.fileIsEdit = false

    this.eventEmitter = new EventEmitter()

    this.fileManager = new FileManager(this.eventEmitter, this)
    this.consoleManager = new ConsoleManager(this.eventEmitter, this)
    this.usbManager = new UsbManager(this.eventEmitter, this)
    this.exampleManager = new ExampleManager(this.eventEmitter, this)

    this.createWindow()
    this.setMenu()
    this.loadPage()

    this.initDev()

    this.initEvent()
  }

  createWindow() {
    this.editWindow = new BrowserWindow({
      title: 'MadMachine',
      width: getConfig('EDIT_WINDOW.WIDTH'),
      height: getConfig('EDIT_WINDOW.HEIGHT'),
      minWidth: 700,
      minHeight: 500,
      backgroundColor: getConfig('THEME.BG_COLOR'),
      show: false,
      titleBarStyle: 'hidden',
      icon: path.resolve(__dirname, 'resources/logo/icon.ico'),
      webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: true, // 不集成 Nodejs
        webSecurity: false,
      },
    })

    this.editWindow.editWindow = this
  }

  setMenu() {
    const menu = new MenuManager(this.app, this)
    this.editWindow.setMenu(menu.initMenu())
  }

  loadPage() {
    const url = getConfig('EDIT_WINDOW.URL')
    this.editWindow.loadURL(
      /http:\/\//g.test(url)
        ? url
        : formatUrl({
          pathname: path.join(__dirname, url),
          protocol: 'file',
          slashes: true,
        }),
    )
  }

  initDev() {
    if (getConfig('DEBUG')) {
      this.editWindow.webContents.openDevTools()
    }
  }

  initEvent() {
    let userInfoHandle = null
    let themeNameHandle = null
    let fontSizeHandle = null

    this.editWindow.on('closed', () => this.closedHandle())

    this.editWindow.on('ready-to-show', () => this.readyHandle())

    this.editWindow.webContents.on('dom-ready', this.domReady.bind(this))

    const closeHandle = () => {
      this.eventEmitter.removeAllListeners()

      ipcMain.removeListener('SAVE_USER_INFO', userInfoHandle)
      ipcMain.removeListener('SET_THEME_NAME', themeNameHandle)
      ipcMain.removeListener('SET_FONT_SIZE', fontSizeHandle)
    }
    this.editWindow.on('close', (event) => {
      if (this.fileIsEdit) {
        event.preventDefault()
        dialog.showMessageBox(
          {
            type: 'none',
            buttons: ['Cancel', 'Don\'t Save', 'Save'],
            defaultId: 2,
            title: 'Close',
            message: `Do you want to save changes made to "${this.fileManager.projectName}" ?`,
            cancelId: 0,
          },
          (response) => {
            let ret = true
            switch (response) {
              case 0:
                event.preventDefault()
                ret = false
                break
              case 1:
                closeHandle()
                ret = true
                this.fileIsEdit = false
                this.editWindow.close()
                break
              case 2:
                this.saveAllEditFiles(false)
                this.fileIsEdit = false
                this.editWindow.close()
                ret = true
                break
              default:
                closeHandle()
                ret = true
            }

            return ret
          },
        )
      } else {
        closeHandle()
      }
    })

    this.eventEmitter.on('OPEN_FILES', (files) => {
      this.editWindow.webContents.send('OPEN_FILES', files)
    })
    this.eventEmitter.on('OPEN_PROJECT_NAME', (projectName) => {
      this.editWindow.webContents.send('PORJECT_NAME', projectName)
    })
    this.eventEmitter.on('OPEN_FOLDERS', (folders) => {
      this.editWindow.webContents.send('OPEN_FOLDERS', folders)
    })

    // 控制台
    this.eventEmitter.on('message', (message) => {
      this.editWindow.webContents.send('CONSOLE_MESSAGE', message)
    })

    this.eventEmitter.on('status', (status) => {
      this.editWindow.webContents.send('CONSOLE_STATUS', status)
    })

    // usb 管理
    this.eventEmitter.on('USB_ADD', (dir) => {
      this.editWindow.webContents.send('USB_DEVICE_ADD', dir)
    })
    this.eventEmitter.on('USB_REMOVE', (dir) => {
      this.editWindow.webContents.send('USB_DEVICE_REMOVE', dir)
    })
    this.eventEmitter.on('COPY_PROGRESS', (progress) => {
      this.editWindow.webContents.send('COPY_FILE_PROGRESS', progress)
    })

    // 示例项目
    this.eventEmitter.on('EXAMPLE_LIST', (list) => {
      this.editWindow.webContents.send('EXAMPLE_LIST_PROJECT', list)
    })

    // 用户登录
    ipcMain.on(
      'SAVE_USER_INFO',
      (userInfoHandle = (event, userInfo) => {
        this.setUserInfo(userInfo)
      }),
    )
    // 主题
    ipcMain.on(
      'SET_THEME_NAME',
      (themeNameHandle = (event, themeName) => {
        this.setTheme(themeName)
      }),
    )

    ipcMain.on(
      'SET_FONT_SIZE',
      (fontSizeHandle = (event, val) => {
        const fontSize = (getConfig('EDITER.FONTSIZE') || 14) + val
        this.editWindow.webContents.send('SET_FONT_SIEZ', fontSize)
      }),
    )
  }

  setConfig(key, val) {
    setConfig(key, val)
  }

  saveAllEditFiles(isTip = true) {
    this.editWindow.webContents.send('FILE_SAVE_ALL', isTip)
  }

  saveEditFile() {
    this.editWindow.webContents.send('FILE_SAVE')
  }

  closedHandle() {
    this.editWindow = null

    this.app.removeEditWindow(this.id)
  }

  readyHandle() {
    this.setTheme()

    setTimeout(() => {
      this.editWindow.show()
    })
  }

  setTheme(themeName) {
    this.editWindow.webContents.send('SET-WEB-THEME', themeName || getConfig('THEME.NAME'))
  }

  domReady() {
    this.setTheme()
    this.setUserInfo()
    this.setLayoutInfo()

    const usbTip = getConfig('USBTIPFLAG') || {}
    const flag = usbTip.version === app.getVersion() ? usbTip.flag : false
    this.editWindow.webContents.send('INIT_USB_TIP_FLAG', flag)

    if (this.projectFile) {
      this.fileManager.openProjectFile(this.projectFile)
      this.editWindow.webContents.send('OPEN_FOLDERS', this.fileManager.folderData)
    }

    this.editWindow.webContents.send('PROJECT_EXAMPLE', this.isExample)
  }

  setUsbTipFlag(flag) {
    setConfig('USBTIPFLAG', {
      version: app.getVersion(),
      flag: !!flag,
    })
  }

  setUserInfo(userInfo) {
    this.editWindow.webContents.send('INIT_USER_INFO', userInfo || getConfig('USER.INFO') || {})
  }

  setLayoutInfo() {
    this.editWindow.webContents.send('INIT_FILEMANAGER_WIDTH', getConfig('LAYOUT.FILEMANAGE.WIDTH') || 300)
    this.editWindow.webContents.send('INIT_CONSOLE_HEIGHT', getConfig('LAYOUT.CONSOLE.HEIGHT') || 40)
  }

  showSerialView() {
    if (!this.serialWindow) {
      this.serialWindow = new SerialWindow(this)
    }
  }

  removeSerialView() {
    this.serialWindow = null
  }

  undoHandle() {
    this.editWindow.webContents.send('FILE_EDIT_UNDO')
  }

  redoHandle() {
    this.editWindow.webContents.send('FILE_EDIT_REDO')
  }

  getPlatform() {
    return os.platform()
  }

  openExample(filePath) {
    const projectFile = fs.readdirSync(filePath).filter(file => /\.mmswift/.test(file))[0]
    this.app.createEditWindow(path.resolve(filePath, projectFile), true)
  }

  saveFile(projectPath, filePath, content) {
    if (!this.isExample) {
      this.fileManager.saveFile(filePath, content)
      return
    }

    dialog.showMessageBox(this.editWindow, {
      type: 'warning',
      title: 'Save project',
      message: 'This is example code marked "read-only", so you\'ll need to Save As this project to another location.',
      buttons: ['Okay', 'Cancel'],
      cancelId: 1,
      defaultId: 0,
    }, (response) => {
      if (response === 0) {
        dialog.showOpenDialog(
          this.editWindow,
          {
            title: 'Save project',
            message: 'Save project',
            properties: ['openDirectory', 'createDirectory'],
          },
          (folders) => {
            if (folders) {
              const [folderPath] = folders
              this.exampleManager.copyExampleTo(`${projectPath}`, folderPath)
              // const projectFile = this.fileManager.createProjectFile(folderPath)
              this.fileManager.saveFile(path.resolve(folderPath, path.basename(filePath)), content)

              this.isExample = false
              const projectFile = fs.readdirSync(folderPath).filter(file => /\.mmswift/.test(file))[0]
              this.fileManager.openProjectFile(path.resolve(folderPath, projectFile))
            }
          },
        )
      }
    })
  }

  saveAllFile(projectPath, files, isTip, next) {
    if (!this.isExample) {
      files.forEach((filePath) => {
        this.fileManager.saveFile(filePath.path, filePath.fileData)
      })
      next()

      return
    }

    if (isTip) {
      dialog.showMessageBox(this.editWindow, {
        type: 'warning',
        title: 'Save project',
        message: 'This is example code marked "read-only", so you\'ll need to Save As this project to another location.',
        buttons: ['Okay', 'Cancel'],
        cancelId: 1,
        defaultId: 0,
      }, (response) => {
        if (response === 0) {
          dialog.showOpenDialog(
            this.editWindow,
            {
              title: 'Save project',
              message: 'Save project',
              properties: ['openDirectory', 'createDirectory'],
            },
            (folders) => {
              if (folders) {
                const [folderPath] = folders
                this.exampleManager.copyExampleTo(`${projectPath}`, folderPath)
                // const projectFile = this.fileManager.createProjectFile(folderPath)
                files.forEach((filePath) => {
                  this.fileManager.saveFile(path.resolve(folderPath, path.basename(filePath.path)), filePath.fileData)
                })

                this.isExample = false
                const projectFile = fs.readdirSync(folderPath).filter(file => /\.mmswift/.test(file))[0]
                this.fileManager.openProjectFile(path.resolve(folderPath, projectFile))

                next()
              }
            },
          )
        }
      })
    } else {
      dialog.showOpenDialog(
        this.editWindow,
        {
          title: 'Save project',
          message: 'Save project',
          properties: ['openDirectory', 'createDirectory'],
        },
        (folders) => {
          if (folders) {
            const [folderPath] = folders
            this.exampleManager.copyExampleTo(`${projectPath}`, folderPath)
            // const projectFile = this.fileManager.createProjectFile(folderPath)
            files.forEach((filePath) => {
              this.fileManager.saveFile(path.resolve(folderPath, path.basename(filePath.path)), filePath.fileData)
            })

            this.isExample = false
            const projectFile = fs.readdirSync(folderPath).filter(file => /\.mmswift/.test(file))[0]
            this.fileManager.openProjectFile(path.resolve(folderPath, projectFile))

            next()
          }
        },
      )
    }
  }

  fileSaveDialog(fileName, next) {
    dialog.showMessageBox(
      {
        type: 'none',
        buttons: ['Cancel', "Don't Save", 'Save'],
        defaultId: 2,
        title: 'Close',
        message: `Save changes to "${fileName}"?`,
        cancelId: 0,
      },
      (response) => {
        next(response)
      },
    )
  }

  setEditStatus(status) {
    this.fileIsEdit = status
  }

  close() {
    if (this.editWindow) {
      this.editWindow.close()
    }
  }
}

export default EditWindow

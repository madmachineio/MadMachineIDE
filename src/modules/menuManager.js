import {
  app, Menu, shell, dialog,
} from 'electron'
import os from 'os'
import { getConfig } from '../config/index'

class MenuManager {
  constructor(main, editWindow) {
    this.main = main
    this.editWindow = editWindow
  }

  initMenu() {
    let menusTmpl = []
    switch (os.platform()) {
      case 'win32':
        menusTmpl = this.initLinuxWinMenu()
        break
      case 'darwin':
        menusTmpl = this.initMacMenu()
        break
      case 'linux':
        menusTmpl = this.initLinuxWinMenu()
        break
      default:
        menusTmpl = []
    }

    return Menu.buildFromTemplate(menusTmpl)
  }

  initOpenRecent() {
    return (getConfig('PROJECT.HISTORY') || [])
      .map(item => ({
        label: item.projectFile,
        click: () => {
          this.main.createEditWindow(item.projectFile)
        },
      }))
      .reverse()
  }

  initMacMenu() {
    const recentMenu = this.initOpenRecent()

    return [
      {
        label: 'MadMachine',
        submenu: [
          {
            label: 'About MadMachine',
            click: () => {
              this.main.showAboutView()
            },
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            click: () => {
              this.main.showSettingViwe()
            },
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              app.quit()
            },
          },
        ],
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            click: () => {
              this.main.showStartView({
                new: true,
              })
            },
          },
          {
            label: 'New File',
            click: () => {
              this.main.getActivedEditWindow().fileManager.createFolderFile(this.main.getActivedEditWindow().fileManager.folderPath)
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Open File...',
            click: () => {
              dialog.showOpenDialog(
                {
                  properties: ['openFile', 'multiSelections'],
                },
                (files) => {
                  if (files) {
                    try {
                      this.main.getActivedEditWindow().fileManager.openFile(files)
                    } catch (ex) {
                      dialog.showMessageBox({
                        type: 'error',
                        title: 'Open File',
                        message: ex.message,
                        buttons: ['Sure'],
                        defaultId: 0,
                      })
                    }
                  }
                },
              )
            },
          },
          {
            label: 'Open Project...',
            click: () => {
              dialog.showOpenDialog(
                {
                  filters: [{ name: 'MadMachine', extensions: ['mmp'] }],
                  properties: ['openFile', 'createDirectory'],
                },
                (files) => {
                  if (files) {
                    try {
                      this.main.createEditWindow(files[0])
                    } catch (ex) {
                      dialog.showMessageBox({
                        type: 'error',
                        title: 'Open Folder',
                        message: ex.message,
                        buttons: ['Sure'],
                        defaultId: 0,
                      })
                    }
                  }
                },
              )
            },
          },
          {
            label: 'Open Recent...',
            submenu: recentMenu,
          },
          {
            type: 'separator',
          },
          {
            label: 'Save',
            click: () => {
              this.main.getActivedEditWindow().saveEditFile()
            },
          },
          {
            label: 'Save All',
            click: () => {
              this.main.getActivedEditWindow().saveAllEditFiles()
            },
          },
          {
            label: 'Save as',
            click: () => {
              this.main.getActivedEditWindow().saveAllEditFiles(false)
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            click: () => {
              this.main.getActivedEditWindow().undoHandle()
            },
          },
          {
            label: 'Redo',
            click: () => {
              this.main.getActivedEditWindow().redoHandle()
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Cut',
            role: 'cut',
          },
          {
            label: 'Copy',
            role: 'copy',
          },
          {
            label: 'Paste',
            role: 'paste',
          },
        ],
      },
      {
        label: 'Window',
        role: 'window',
        submenu: [
          {
            label: 'Minimize',
            role: 'minimize',
          },
          {
            label: 'Close',
            role: 'close',
          },
        ],
      },
      {
        lable: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://www.madmachine.io')
            },
          },
        ],
      },
    ]
  }

  initLinuxWinMenu() {
    const recentMenu = this.initOpenRecent()

    return [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            click: () => {
              this.main.showStartView({
                new: true,
              })
            },
          },
          {
            label: 'New File',
            click: () => {
              this.editWindow.fileManager.createFolderFile(this.editWindow.fileManager.folderPath)
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Open File...',
            click: () => {
              dialog.showOpenDialog(
                {
                  properties: ['openFile', 'multiSelections'],
                },
                (files) => {
                  if (files) {
                    try {
                      this.editWindow.fileManager.openFile(files)
                    } catch (ex) {
                      dialog.showMessageBox({
                        type: 'error',
                        title: 'Open File',
                        message: ex.message,
                        buttons: ['Sure'],
                        defaultId: 0,
                      })
                    }
                  }
                },
              )
            },
          },
          {
            label: 'Open Project...',
            click: () => {
              dialog.showOpenDialog(
                {
                  filters: [{ name: 'MadMachine', extensions: ['mmp'] }],
                  properties: ['openFile', 'createDirectory'],
                },
                (files) => {
                  if (files) {
                    try {
                      this.main.createEditWindow(files[0])
                    } catch (ex) {
                      dialog.showMessageBox({
                        type: 'error',
                        title: 'Open Folder',
                        message: ex.message,
                        buttons: ['Sure'],
                        defaultId: 0,
                      })
                    }
                  }
                },
              )
            },
          },
          {
            label: 'Open Recent...',
            submenu: recentMenu,
          },
          {
            type: 'separator',
          },
          {
            label: 'Save',
            click: () => {
              this.main.getActivedEditWindow().saveEditFile()
            },
          },
          {
            label: 'Save All',
            click: () => {
              this.main.getActivedEditWindow().saveAllEditFiles()
            },
          },
          {
            label: 'Save as',
            click: () => {
              this.main.getActivedEditWindow().saveAllEditFiles(false)
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            click: () => {
              this.main.getActivedEditWindow().undoHandle()
            },
          },
          {
            label: 'Redo',
            click: () => {
              this.main.getActivedEditWindow().redoHandle()
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Cut',
            role: 'cut',
          },
          {
            label: 'Copy',
            role: 'copy',
          },
          {
            label: 'Paste',
            role: 'paste',
          },
        ],
      },
      {
        label: 'Window',
        role: 'window',
        submenu: [
          {
            label: 'Minimize',
            role: 'minimize',
          },
          {
            label: 'Close',
            role: 'close',
          },
        ],
      },
      {
        label: 'MadMachine',
        submenu: [
          {
            label: 'About MadMachine',
            click: () => {
              this.main.showAboutView()
            },
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            click: () => {
              this.main.showSettingViwe()
            },
          },
          { type: 'separator' },
          {
            label: 'Hide MadMachine',
            accelerator: 'Command+H',
            selector: 'hide:',
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:',
          },
          { label: 'Show All', selector: 'unhideAllApplications:' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              app.quit()
            },
          },
        ],
      },
      {
        lable: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://www.madmachine.io')
            },
          },
        ],
      },
    ]
  }
}

export default MenuManager

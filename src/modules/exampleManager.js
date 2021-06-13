import path from 'path'
import fse from 'fs-extra'
import os from 'os'
import childProcess from 'child_process'
import { app } from 'electron'
import { mkdirsSync } from '../utils/path'

// const resolvePath = (dir = '') => path.resolve(__dirname, './public/example', dir)

class ExampleManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.events = {}
    this.list = []

    this.readExampleList()
  }

  readExampleList() {
    const formatFile = (rpath, file, dir = '') => {
      const filePath = path.resolve(rpath, file, dir) // `${rpath}/${file}`
      if (!fse.existsSync(filePath)) {
        return {}
      }
      const stat = fse.statSync(filePath)
      const fileData = {
        name: file,
        path: filePath,
        isDirectory: false,
        children: [],
      }
      if (stat && stat.isDirectory()) {
        fileData.isDirectory = true
        fileData.children = []
      }
      return fileData
    }

    try {
      const exampleDir = path.resolve(app.getPath('documents'), 'MadMachine', 'Examples')
      const exampleList = fse
        .readdirSync(exampleDir)
        .filter(m => !/^\./g.test(m))
        .map((file) => {
          const fileData = formatFile(exampleDir, file)
          if (fileData && fileData.isDirectory && fse.existsSync(fileData.path)) {
            fileData.children = fse
              .readdirSync(fileData.path)
              .map(cFile => formatFile(fileData.path, cFile))
              .filter(m => m.isDirectory)
          }
          return fileData
        })
        .filter(m => m.isDirectory)
        .map(item => ({
          ...item,
          // children: (item.children || []).sort((a, b) => {
          //   const reg = /^Mission(\d+)/
          //   return a.name.match(reg)[1] - b.name.match(reg)[1]
          // }),
        }))

      const libraryDir = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
      let LibraryExampleList = []
      if (fse.existsSync(libraryDir)) {
        LibraryExampleList = fse
          .readdirSync(libraryDir)
          .filter(m => !/^\./g.test(m))
          .map(file => {
            const fileData = formatFile(libraryDir, file, 'Examples')
            if (fileData && fileData.isDirectory && fse.existsSync(fileData.path)) {
              fileData.children = fse
                .readdirSync(fileData.path)
                .map(cFile => formatFile(fileData.path, cFile))
                .filter(m => m.isDirectory)
            }
            return fileData
          }).filter(m => m.isDirectory)
          .map(item => ({
            ...item,
            // children: (item.children || []).sort((a, b) => {
            //   const reg = /^Mission(\d+)/
            //   return a.name.match(reg)[1] - b.name.match(reg)[1]
            // }),
          }))
      }

      this.list = [
        {
          type: 'Examples',
          list: exampleList,
        },
        {
          type: 'Library',
          list: LibraryExampleList,
        },
      ]
    } catch (e) {
      console.log(e)
    }

    console.log(this.list)

    this.eventEmitter.emit('EXAMPLE_LIST', this.list)
  }

  copyExample(file) {
    if (!fse.existsSync(file.path)) {
      return null
    }

    const homeDir = app.getPath('home')
    const userConfigDir = path.resolve(homeDir, './MadMachine/Projects')
    const projectName = file.path.split(global.PATH_SPLIT).slice(-1)[0]
    const targetPath = path.resolve(userConfigDir, projectName)

    if (!fse.existsSync(userConfigDir)) {
      fse.mkdirSync(userConfigDir)
    }

    if (fse.existsSync(targetPath)) {
      return targetPath
    }

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${file.path}" "${targetPath}" /e /y /q`)
        break
      case 'darwin':
        childProcess.execSync(`cp -R "${file.path}" "${targetPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -R "${file.path}" "${targetPath}"`)
        break
      default:
        break
    }

    return targetPath
  }

  copyExampleTo(filePath, otargetPath) {
    const targetPath = path.resolve(otargetPath, path.basename(filePath))

    if (!fse.existsSync(targetPath)) {
      mkdirsSync(targetPath)
    }

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${filePath}" "${targetPath}" /e /y /q`)
        break
      case 'darwin':
        childProcess.execSync(`cp -R "${filePath}" "${targetPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -R "${filePath}" "${targetPath}"`)
        break
      default:
        break
    }
  }
}

export default ExampleManager

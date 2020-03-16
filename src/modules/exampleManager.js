import path from 'path'
import fs from 'fs'
import os from 'os'
import childProcess from 'child_process'
import { app } from 'electron'

const resolvePath = (dir = '') => path.resolve(__dirname, './public/example', dir)

class ExampleManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.events = {}
    this.list = []

    this.readExampleList()
  }

  readExampleList() {
    const formatFile = (rpath, file, addProjectFile) => {
      const filePath = `${rpath}/${file}`
      const stat = fs.statSync(filePath)
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

    const exampleDir = resolvePath('')
    this.list = fs
      .readdirSync(exampleDir)
      .map((file) => {
        const fileData = formatFile(exampleDir, file)
        fileData.children = fs
          .readdirSync(fileData.path)
          .map(cFile => formatFile(fileData.path, cFile))
          .filter(m => m.isDirectory)
        return fileData
      })
      .filter(m => m.isDirectory)
      .map(item => ({
        ...item,
        children: (item.children || []).sort((a, b) => {
          const reg = /^Mission(\d+)/
          return a.name.match(reg)[1] - b.name.match(reg)[1]
        }),
      }))

    this.eventEmitter.emit('EXAMPLE_LIST', this.list)
  }

  copyExample(file) {
    if (!fs.existsSync(file.path)) {
      return null
    }

    const homeDir = app.getPath('home')
    const userConfigDir = path.resolve(homeDir, './MadMachine/projects') // `${homeDir}/MadMachine/projects`
    const projectName = file.path.split(global.PATH_SPLIT).slice(-1)[0]
    const targetPath = `${userConfigDir}/${projectName}`

    if (!fs.existsSync(userConfigDir)) {
      fs.mkdirSync(userConfigDir)
    }

    if (fs.existsSync(targetPath)) {
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

  copyExampleTo(filePath, targetPath) {
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

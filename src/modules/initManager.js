// import { app } from 'electron'
import path from 'path'
import os from 'os'
import childProcess from 'child_process'
import { getConfig, setConfig } from '../config'
import { mkdirsSync } from '../utils/path'

const { app, remote } = require('electron')

console.log(remote)

class InitManager {
  constructor() {
    this.copyLibraryExample()
  }

  copyLibraryExample() {
    console.log('复制案例文件夹')
    console.log(`${getConfig('initLibraryExample')} <=> ${app.getVersion()}`)

    if (getConfig('initLibraryExample') === app.getVersion()) {
      return
    }

    setConfig('initLibraryExample', app.getVersion())

    const sourcePath = path.resolve(__dirname, 'resources', 'project')
    const targetPath = path.resolve(app.getPath('documents'), 'MadMachine')

    console.log(`sourcePath = ${sourcePath}`)
    console.log(`targetPath = ${targetPath}`)

    mkdirsSync(sourcePath)
    mkdirsSync(targetPath)

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${sourcePath}\\." "${targetPath}" /e /y /q`)
        break
      case 'darwin':
        console.log('mac 复制')
        childProcess.execSync(`cp -fR "${sourcePath}/." "${targetPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -fR "${sourcePath}/." "${targetPath}"`)
        break
      default:
        break
    }
  }
}

export default InitManager

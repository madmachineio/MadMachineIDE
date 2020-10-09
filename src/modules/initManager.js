import { app } from 'electron'
import path from 'path'
import os from 'os'
import childProcess from 'child_process'
import { getConfig, setConfig } from '../config'
import { mkdirsSync } from '../utils/path'

class InitManager {
  constructor() {
    this.copyLibraryExample()
  }

  copyLibraryExample() {
    if (getConfig('initLibraryExample') === app.getVersion()) {
      return false
    }
    setConfig('initLibraryExample', app.getVersion())

    const sourcePath = path.resolve(__dirname, 'resources', 'project')
    const targetPath = path.resolve(app.getPath('documents'), 'MadMachine')
    mkdirsSync(sourcePath)
    mkdirsSync(targetPath)

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${sourcePath}\\." "${targetPath}" /e /y /q`)
        break
      case 'darwin':
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

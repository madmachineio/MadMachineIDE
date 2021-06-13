import path from 'path'
import os from 'os'
import * as fse from 'fs-extra'
import childProcess from 'child_process'
import { getConfig, setConfig } from '../config'
import { mkdirsSync } from '../utils/path'

const { app } = require('electron')


class InitManager {
  constructor() {
    this.copyLibraryExample()
  }

  getExampleVersion(exampleDir) {
    const versionFile = path.join(exampleDir, '.version')
    if (fse.existsSync(versionFile)) {
      const version = fse.readFileSync(versionFile, 'utf-8')
      return version;
    }
  }

  copyLibraryExample() {
    const exampleDirName = 'Examples'
    const sourcePath = path.resolve(__dirname, 'resources', 'project', exampleDirName)
    const targetPath = path.resolve(app.getPath('documents'), 'MadMachine')
    const localExampleDir = path.join(targetPath, exampleDirName)

    const hasLocalExamples = fse.existsSync(localExampleDir)

    if (hasLocalExamples) {
      // Comapre examples version(commit id)
      const localExampleVersion = this.getExampleVersion(localExampleDir)
      const buildinExampleVersion = this.getExampleVersion(sourcePath)
      if (localExampleVersion === buildinExampleVersion) {
        console.log(`Local examples are the latest, skip copy examples`)
        return
      }
    }
    console.log(`Sync local examples from build-in examples`)

    mkdirsSync(sourcePath)
    mkdirsSync(targetPath)
    console.log(`${sourcePath} => ${targetPath}`)

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${sourcePath}" "${targetPath}" /e /y /q`)
        break
      case 'darwin':
        childProcess.execSync(`cp -fR "${sourcePath}" "${targetPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -fR "${sourcePath}" "${targetPath}"`)
        break
      default:
        break
    }
  }
}

export default InitManager

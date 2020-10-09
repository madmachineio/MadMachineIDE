import { app } from 'electron'
import childProcess from 'child_process'
import path from 'path'
import fs from 'fs'
import sudo from 'sudo-prompt'
import * as os from 'os'
import * as pty from 'node-pty'
// import stripAnsi from 'strip-ansi'
import { build as buildScript, init } from '../public/build/main'
import { mkdirsSync } from '../utils/path'
// import iconv from 'iconv-lite'

const resolvePath = (dir = '') => path.resolve(__dirname, './public/build', dir)

class ConsoleManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.runStatus = 'none'

    this.cmdMessage = []

    this.events = {}
  }

  async run(cols, rows, showDone = true) {
    if (this.runStatus === 'compiling') {
      return null
    }

    this.cmdOpts = {
      cols,
      rows,
    }
    this.runStatus = 'compiling'
    this.eventEmitter.emit('status', this.runStatus)
    this.cmdMessage = []

    // const isPermssion = await this.checkPermission()
    // if (!isPermssion) {
    //   await this.chmodFolder()
    // }

    const { fileManager } = this.editWindow
    const buildFolder = path.resolve(fileManager.folderPath, '.build')
    // if (!fs.existsSync(buildFolder)) {
    //   mkdirsSync(buildFolder)
    // }

    try {
      await buildScript(app.getAppPath(), fileManager.folderPath, fileManager.projectName, fileManager.folderData.children, buildFolder, this.execCmd.bind(this))
    } catch (ex) {
      console.log(ex)
    }

    this.runStatus = this.runStatus !== 'error' ? (showDone ? 'success' : '') : 'error'
    this.eventEmitter.emit('status', this.runStatus)

    return this.sendMessage
  }

  async initProject(folderPath) {
    try {
      await init(folderPath, this.execCmd.bind(this))
    } catch (e) {
      console.log(e)
    }
  }

  async chmodFolder() {
    return new Promise((resolve) => {
      const options = {
        name: 'MadMachine',
        // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
      }

      sudo.exec(`chmod -R 777 ${resolvePath()}`, options, (error, stdout) => {
        resolve(stdout)
      })
    })
  }

  checkPermission() {
    return new Promise((resolve) => {
      fs.stat(resolvePath(), (error, stats) => {
        if (error) {
          resolve(false)
        } else {
          // eslint-disable-next-line
          resolve((stats.mode & 0o777).toString(8) === '775')
        }
      })
    })
  }

  execCmd2(cmd, isRoot = false) {
    if (this.runStatus === 'error') {
      return false
    }

    return new Promise((resolve, reject) => {
      const options = {
        name: 'MadMachine',
        // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
      }

      const exec = isRoot ? sudo.exec : childProcess.exec
      exec(cmd, options, (error, stdout) => {
        if (error) {
          this.runStatus = 'error'
          this.eventEmitter.emit('message', error)
          reject(error)
        } else {
          this.eventEmitter.emit('message', stdout)
          resolve(stdout)
        }
      })
    })
  }

  execCmd(cmd, cwd) {
    if (this.runStatus === 'error') {
      return false
    }

    return new Promise((resolve, reject) => {
      let cmdOpts = {}
      if (os.platform() === 'win32') {
        cmdOpts = {
          shell: 'powershell.exe',
          args: `-c "${cmd}"`,
        }
      } else {
        cmdOpts = {
          shell: '/bin/bash',
          args: ['-c', cmd],
        }
      }

      const ptyProc = pty.spawn(cmdOpts.shell, cmdOpts.args, {
        cwd: cwd ? path.resolve(cwd) : resolvePath(),
        env: process.env,
      })

      ptyProc.on('data', (data) => {
        this.eventEmitter.emit('message', data)
      })
      ptyProc.on('exit', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          this.runStatus = 'error'
          reject(false)
        }

        ptyProc.destroy()
      })
    })
  }

  sendMessage(type, data) {
    // this.cmdMessage.push({
    //   id: new Date().getTime() + Math.ceil(Math.random() * 10000),
    //   type,
    //   data,
    // })

    this.eventEmitter.emit('message', data)
  }
}

export default ConsoleManager

// import { app } from 'electron'
import childProcess from 'child_process'
import path from 'path'
import sudo from 'sudo-prompt'
import * as os from 'os'
import * as pty from 'node-pty'
// import stripAnsi from 'strip-ansi'
import {
//  build as buildProject,
//  init, generate,
//  download,
 runAplpaSDK,
} from '../public/build/main'
// import { mkdirsSync } from '../utils/path'
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

  // 运行编译
  async run(cols, rows, showDone = true) {
    console.log('运行编译')

    if (this.runStatus === 'compiling') {
      console.log('compiling return')
      return null
    }

    this.cmdOpts = {
      cols,
      rows,
    }
    this.runStatus = 'compiling'
    this.eventEmitter.emit('status', this.runStatus)
    this.cmdMessage = []

    const { fileManager } = this.editWindow
    // if (!fs.existsSync(buildFolder)) {
    //   mkdirsSync(buildFolder)
    // }

    try {
      await runAplpaSDK(fileManager.folderPath, 'build', {
        onData: (data) => {
          console.log(`运行编译 data ${data}`)
          this.eventEmitter.emit('message', data)
        },

        onError: () => {
          console.log('运行编译错误')
          this.runStatus = 'error'
        },
      })
      // await buildProject(fileManager.folderPath, this.execCmd.bind(this))
    } catch (e) {
      console.log(e)
    }

    this.runStatus = this.runStatus !== 'error' ? (showDone ? 'success' : '') : 'error'
    this.eventEmitter.emit('status', this.runStatus)

    return this.sendMessage
  }

  async initProject(folderPath, projectType, boardType) {
    try {
      // 调用SDK生成项目
      await runAplpaSDK(folderPath, 'init', {
        projectType,
        boardType,
      })

      return { result: true, msg: '' }
    } catch (e) {
      console.log(e)
      return { result: false, msg: e.message }
    }
  }

  async copyFile() {
    console.log('运行下载')

    // 停止usb检测
    this.editWindow.usbManager.stopUsbDetecting()

    const { fileManager } = this.editWindow
    await runAplpaSDK(
      fileManager.folderPath,
      'download',
      {
        onData: (data) => {
          console.log(`运行编译 data ${data}`)
          this.eventEmitter.emit('message', data)
        },

        onError: () => {
          console.log('运行编译错误')
          this.runStatus = 'error'
        },
      },
    )

    // 开始usb检测
    this.editWindow.usbManager.startUsbDetecting()

    // download(fileManager.folderPath, this.execCmd.bind(this))
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
          reject(new Error(`exit code ${code}`))
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

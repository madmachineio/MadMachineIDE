import os from 'os'
import fs from 'fs'
// import { app } from 'electron'
import childProcess from 'child_process'
import path from 'path'
import * as pty from 'node-pty'
import Worker from 'tiny-worker'
import { app } from 'electron'
import { getConfig } from '../config'
// import { runAplpaSDK } from '../public/build/main'

class UsbManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.events = {}
    this.timeId = 0
    this.isMount = false
    this.path = ''
    this.copyProgress = 0

    // 接收信息
    this.msg = ''

    // 搜索电路板worker
    this.usbDecetingWorker = null

    this.startUsbDetecting()
    console.log('初始化 Usb Manager')
  }

  startUsbDetecting() {
    console.log('开启电路板检测')
    const projectFileSplits = String(this.editWindow.projectFile).split(global.PATH_SPLIT)
    projectFileSplits.splice(projectFileSplits.length - 1, 1)
    const projectPath = projectFileSplits.join(global.PATH_SPLIT)

    this.usbDecetingWorker = new Worker(
      path.resolve(__dirname, 'public/worker/usbFind.js'),
    )

    this.usbDecetingWorker.onmessage = ({ data }) => {
      const msg = `findUsbWorker 接收通信信息 ${JSON.stringify(data)}`
      if (msg !== this.msg) {
        console.log(msg)
        this.msg = msg
      }
      // this.path = data.usbPath
      const { status } = data
      this.eventEmitter.emit('USB_CHANGE', status)

      if (String(status).toLowerCase().includes('ready')) {
        this.isMount = true
        // this.eventEmitter.emit('USB_ADD', this.path)
      } else {
        this.isMount = false
        // this.eventEmitter.emit('USB_REMOVE', this.path)
      }
    }

    // 发送通信信息
    const paylaod = {
      name: getConfig('USB.NAME'),
      rootPath: path.resolve(__dirname),
      projectPath, // 项目路径
      sdkParentPath: app.getAppPath(),
    }

    console.log(`发送通信信息 ${JSON.stringify(paylaod)}`)
    this.usbDecetingWorker.postMessage(paylaod)

    // const findUsb = () => {
    //   findUsbWorker.call(getConfig('USB.NAME'), type).then((data) => {
    //     console.log(data)
    //     this.path = data.usbPath

    //     if (type === 'add') {
    //       if (data.exist) {
    //         this.isMount = true
    //         this.eventEmitter.emit('USB_ADD', this.path)
    //       } else {
    //         setTimeout(() => findUsb(), 2000)
    //       }
    //     }

    //     if (type === 'remove') {
    //       if (data.exist) {
    //         setTimeout(() => findUsb(), 2000)
    //       } else {
    //         this.isMount = false
    //         this.eventEmitter.emit('USB_REMOVE', this.path)
    //       }
    //     }
    //   })
    // }

    // findUsb()
  }

  stopUsbDetecting() {
    if (!this.usbDecetingWorker) return
    this.usbDecetingWorker.terminate()
    this.usbDecetingWorker = null
    console.log('停止电路板检测')
  }

  check() {
    if (!fs.existsSync(this.path)) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        'USB device not found \r\n',
      )

      return false
    }

    return true
  }

  copyFile() {
    if (!fs.existsSync(this.path)) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        'USB device not found \r\n',
      )

      this.copyProgress = -1
      this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)

      return false
    }

    const { fileManager } = this.editWindow
    const fileName = 'swiftio.bin'
    const filePath = path.resolve(fileManager.folderPath, '.build', fileName)
    const targetPath = path.resolve(this.path, fileName)

    if (!fs.existsSync(filePath)) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        'File not found \r\n',
      )
      return false
    }

    try {
      fs.accessSync(filePath, fs.constants.R_OK)
    } catch (ex) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        `${filePath} not readable \r\n`,
      )
      return false
    }

    try {
      fs.accessSync(this.path, fs.constants.W_OK)
    } catch (ex) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        `${this.path} not writeable \r\n`,
      )
      return false
    }

    const rs = fs.createReadStream(filePath)
    const ws = fs.createWriteStream(targetPath)

    const fileState = fs.statSync(filePath)
    const totalSize = fileState.size
    let readSize = 0

    rs.on('data', (data) => {
      rs.pause()
      if (fs.existsSync(this.path)) {
        ws.write(data, () => {
          readSize += data.length
          this.copyProgress = readSize / totalSize
          this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)

          setTimeout(() => {
              rs.resume()
          }, 100)
        })
      } else {
        this.copyProgress = -1
        this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)

        rs.close()
      }
    })

    rs.on('end', () => {
      rs.destroy()
      ws.end()
    })

    ws.on('finish', () => {
      setTimeout(() => {
        // 卸载u盘
        switch (os.platform()) {
          case 'win32':
          {
            const enject = () => {
              const cmdOpts = {
                shell: 'powershell.exe',
                args: [
                  '-c',
                  `(New-Object -comObject Shell.Application).Namespace(17).ParseName("${this.path}").InvokeVerb("Eject")`,
                ],
              }
              const ptyProc = pty.spawn(cmdOpts.shell, cmdOpts.args, {
                cwd: process.env.HOME,
                env: process.env,
              })
              ptyProc.on('exit', () => {
                ptyProc.destroy()

                if (fs.existsSync(this.path)) {
                  enject()
                }
              })
            }

            enject()
          }
            break
          case 'darwin':
            childProcess.execSync(`diskutil eject "${this.path}"`)
            break
          case 'linux':
            break
          default:
        }

        this.copyProgress = 101
        this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)
      }, 500)
      // this.editWindow.consoleManager.sendMessage(
      //   'stdout',
      //   'Done \r\n',
      // )
    })

    ws.on('error', () => {
      this.copyProgress = -1
      this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)

      // this.editWindow.consoleManager.sendMessage(
      //   'stderr',
      //   'Download file error \r\n',
      // )
    })

    return true
  }
}

export default UsbManager

import os from 'os'
import fs from 'fs'
// import { app } from 'electron'
import childProcess from 'child_process'
import path from 'path'
import * as pty from 'node-pty'
import Worker from 'tiny-worker'

import { getConfig } from '../config'

class UsbManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.events = {}
    this.timeId = 0
    this.isMount = false
    this.path = ''
    this.copyProgress = 0

    this.init()
  }

  init() {
    this.initEvent()
  }

  initEvent() {
    // usbspy.on('change', (device) => {
    //   console.log(device)
    // })

    // const usbList = []
    // usbDetect.on('add:8137:147', (device) => {
    //   console.log('add', device)
    //   const poll = setInterval(() => {
    //     drivelist.list().then((drives) => {
    //       console.log(JSON.stringify(drives))
    //       drives.forEach((drive) => {
    //         if (drive.isUSB) {
    //           if (drive.mountpoints && drive.mountpoints.length > 0) {
    //             const mountPath = drive.mountpoints[0].path
    //             if (!usbList.includes(mountPath)) {
    //               console.log(mountPath) // op
    //               usbList.push(mountPath)
    //               clearInterval(poll)
    //             }
    //           }
    //         }
    //       })
    //     })
    //   }, 2000)
    // })
    // usbDetect.on('add', (device) => {
    //   setInterval(() => {
    //     usbDetect.find(8137, 147, (err, devices) => { console.log('find', devices, err) })
    //   }, 1000)
    // })
    // this.usb.on('attach', () => {
    //   this.findDevice('add')
    // })

    // this.usb.on('detach', () => {
    //   this.findDevice('remove')
    // })

    this.findDevice()
  }

  findDevice() {
    const findUsbWorker = new Worker(
      path.resolve(__dirname, 'public/worker/usbFind.js'),
    )
    findUsbWorker.onmessage = ({ data }) => {
      this.path = data.usbPath

      if (data.exist) {
        this.isMount = true
        this.eventEmitter.emit('USB_ADD', this.path)
      } else {
        this.isMount = false
        this.eventEmitter.emit('USB_REMOVE', this.path)
      }
    }

    findUsbWorker.postMessage({
      name: getConfig('USB.NAME'),
      rootPath: path.resolve(__dirname),
    })
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
    const { fileManager } = this.editWindow
    const fileName = 'swiftio.bin'
    const filePath = path.resolve(fileManager.folderPath, '.build', fileName)
    const targetPath = path.resolve(this.path, fileName)

    if (!fs.existsSync(this.path)) {
      this.editWindow.consoleManager.sendMessage(
        'stderr',
        'USB device not found \r\n',
      )
      return false
    }

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
      ws.write(data, () => {
        readSize += data.length
        this.copyProgress = readSize / totalSize
        this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)

        setTimeout(() => {
            rs.resume()
        }, 100)
      })
    })

    rs.on('end', () => {
      rs.destroy()
      ws.end()
    })

    ws.on('finish', () => {
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

      this.copyProgress = 0
      this.eventEmitter.emit('COPY_PROGRESS', this.copyProgress)
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

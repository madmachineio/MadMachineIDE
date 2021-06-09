/* eslint-disable */

// const childProcess = require('child_process')
const os = require('os')
// const fs = require('fs')
const path = require('path')
const pty = require('node-pty')
// const iconv = require('iconv-lite');
// const drivelist = require('drivelist');

const findUsb = (list, vid, pid) => {
  let usbData = null
  list.forEach(item => {
    const productId = (item || {}).product_id || ''
    const vendorId = (item || {}).vendor_id || ''
    const items = (item || {})._items || []
    if (productId.includes(pid) && vendorId.includes(vid)) {
      usbData = item
    } else if (items.length) {
      usbData = findUsb(item._items, vid, pid) || usbData
    }
  })
  return usbData
}

const getUsbPath = (usbData = {}) => {
  let usbPath = null
  if (usbData && usbData.Media && usbData.Media.length) {
    usbData.Media.forEach(item => {
      if (item.volumes && item.volumes.length) {
        const volume = (item.volumes || []).find(m => m.mount_point) || { mount_point: null }
        usbPath = volume.mount_point
      }
    })
  }
  return usbPath
}

const sendMsg = (status) => {
  postMessage({ status })
}

/**
 * 使用Alpha SDK获取项目名称
 * @param {*} projectFolder 
 */
const getStatus = async (sdkParentPath, cwd) => {
  // console.log(`sdkParentPath = ${sdkParentPath} cwd = ${cwd}`)

  return new Promise((resolve) => {
    // SDK命令
    const sdkCommand = 'run --action get-status'

    // 各系统下SDK路径
    const sdkPaths = {
      win: path.resolve(sdkParentPath, './sdk/win/scripts/dist/mm/mm.exe'),
      mac: path.resolve(sdkParentPath, './sdk/mac/usr/mm/mm'),
      linux: path.resolve(sdkParentPath, './sdk/linux/scripts/dist/mm/mm'),
    }

    // 根据系统获取路径
    const platform = os.platform()
    const sdkPath = platform === 'win32' 
      ? sdkPaths.win 
      : platform === 'darwin'
        ? sdkPaths.mac
        : sdkPaths.linux

    const cmd = `${sdkPath} ${sdkCommand}`
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash'

    const workerProcess = pty.spawn(
      shell,
      ['-c', cmd],
      {
        cwd: cwd ? path.resolve(cwd) : resolvePath(),
        env: process.env,
      },
    )

    workerProcess.on('data', data => {
      resolve({ result: true, msg: 'ok', data })
    })

    workerProcess.on('exit', (code) => {
      if (code !== 0) {
        const now = new Date()
        console.log(`子进程退出 ${code} 时间${now.toLocaleTimeString()}`)
        // console.log(fs.readdirSync(`${cwd}${global.PATH_SPLIT}Sources`))
        resolve({ result: false, msg: `Fail to get status with code ${code}`, data: '' })
      }
    })
  })
}

onmessage = function (ev) {
  console.log('window 接收通信信息 ' + JSON.stringify(ev))
  const config = ev.data
  // const usbName = config.name
  // const rootPath = config.rootPath
  const projectPath = config.projectPath
  const sdkParentPath = config.sdkParentPath

  // const vid = '0x1fc9' // 8137
  // const pid = '0x0093' // 147
  // const deviceId = '0123456789ABCDEF'

  const timeId = setInterval(async () => {
    const date = new Date()
    console.log('Detecting usb at ' + date.toLocaleTimeString())
    const { result, msg, data } = await getStatus(sdkParentPath, projectPath)
    sendMsg(result ? data : msg)
    
    // switch (os.platform()) {
    //   case 'win32':
    //     {
    //       const drives = await drivelist.list();
    //       const drivePath = drives
    //         .map(({ mountpoints }) => {
    //           const mountPoint = mountpoints[0] || {}
    //           return mountPoint.path
    //         }).find(usbPath => {
    //           const result = iconv.decode(childProcess.execSync(`${path.resolve(rootPath, 'public/usb/usb.exe')} ${usbPath.replace('\\', '')}`), 'cp936')
    //           return result && result.includes(deviceId)
    //         })
          
    //       sendMsg(drivePath)
    //     }
    //     break
    //   case 'darwin':
    //     {
    //       const result = childProcess.execSync('/usr/sbin/system_profiler -json mini SPUSBDataType')
    //       const resObj = JSON.parse(result)
    //       const usbData = findUsb(resObj.SPUSBDataType, vid, pid)
    //       sendMsg(getUsbPath(usbData))
    //     }
    //     break
    //   default:
    // }
  }, 1000)
}

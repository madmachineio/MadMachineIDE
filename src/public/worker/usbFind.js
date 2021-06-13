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
        resolve({ result: false, msg: `Fail to get status with code ${code}`, data: '' })
      }
    })
  })
}

onmessage = function (ev) {
  console.log('window 接收通信信息 ' + JSON.stringify(ev))
  const config = ev.data
  const projectPath = config.projectPath
  const sdkParentPath = config.sdkParentPath

  const timeId = setInterval(async () => {
    const { result, msg, data } = await getStatus(sdkParentPath, projectPath)
    sendMsg(result ? data : msg)
  }, 1000)
}

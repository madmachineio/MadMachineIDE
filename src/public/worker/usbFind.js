/* eslint-disable */

const childProcess = require('child_process')
const os = require('os')
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite');
const drivelist = require('drivelist')

// 相同的结果只发送一次
let lastUsbPath = null
const sendMsg = usbPath => {
  if (usbPath !== lastUsbPath) {
    if (usbPath && fs.existsSync(usbPath)) {
      postMessage({
        usbPath,
        exist: true,
      })
    } else {
      postMessage({
        usbPath,
        exist: false,
      })
    }
  }

  lastUsbPath = usbPath
}

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

onmessage = function (ev) {
  const config = ev.data
  const usbName = config.name
  const rootPath = config.rootPath

  const vid = '0x1fc9' // 8137
  const pid = '0x0093' // 147
  const deviceId = '0123456789ABCDEF'


  const timeId = setInterval(async () => {
    switch (os.platform()) {
      case 'win32':
        {
          const drives = await drivelist.list();
          const drivePath = drives.map(({ mountpoints }) => {
            const mountPoint = mountpoints[0] || {}
            return mountPoint.path
          }).find(usbPath => {
            const result = iconv.decode(childProcess.execSync(`${path.resolve(rootPath, 'public/usb/usb.exe')} ${usbPath.replace('\\', '')}`), 'cp936')
            return result && result.includes(deviceId)
          })
          
          sendMsg(drivePath)
        }
        break
      case 'darwin':
        {
          const result = childProcess.execSync('/usr/sbin/system_profiler -json mini SPUSBDataType')
          const resObj = JSON.parse(result)
          const usbData = findUsb(resObj.SPUSBDataType, vid, pid)
          sendMsg(getUsbPath(usbData))
        }
        break
      default:
    }
  }, 1000)
}

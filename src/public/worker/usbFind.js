/* eslint-disable */

const iconv = require('iconv-lite')
const childProcess = require('child_process')
const os = require('os')
const fs = require('fs')
const WinReg = require('winreg')

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

  const vid = '0x1fc9' // 8137
  const pid = '0x0093' // 147

  const timeId = setInterval(() => {
    switch (os.platform()) {
      case 'win32':
        {
          const regKey = new WinReg({
            hive: WinReg.HKLM,
            key: '\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR\\Enum'
          })
          regKey.values((err, items) => {
            console.log(items)
          })
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

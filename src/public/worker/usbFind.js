/* eslint-disable */

const iconv = require('iconv-lite')
const childProcess = require('child_process')
const os = require('os')
const fs = require('fs')

// const findUsb = function (type) {
//   return new Promise((resolve) => {

//   })
// }

// module.exports = function myTask(usbName) {
//   console.log('===============', arguments)

// }


onmessage = function (ev) {
  const config = ev.data
  const usbName = config.name
  let status = false

  const timeId = setInterval(function () {
    let usbPath = ''
    switch (os.platform()) {
      case 'win32':
        {
          const disks = iconv.decode(childProcess.execSync('powershell.exe -c "Get-WmiObject Win32_logicaldisk | Select-Object deviceid,description,volumeName"'), 'cp936').split('\n')
          const dir = disks
            .map((item) => {
              const data = item.match(/\S+/g) || []
              return {
                name: data[2],
                path: `${data[0]}\\`,
              }
            })
            .filter(m => m.name === usbName)[0] || {}
          usbPath = dir.path
        }
        break
      case 'darwin':
        usbPath = `/Volumes/${usbName}`
        break
      case 'linux':
        usbPath = `/media/${usbName}`
        break
      default:
    }

    statusTmp = fs.existsSync(usbPath)

    if (status !== statusTmp) {
      postMessage({
        usbPath,
        exist: statusTmp,
      })

      status = statusTmp
    }
  }, 1000)
}

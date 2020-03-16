import { Notification, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import ProgressBar from 'electron-progressbar'

const UPDATE_MESSAGE = {
  error: 'Check for update errors',
  checking: 'Checking for updates...',
  updateAva: 'A new version has been detected and is being downloaded...',
  updateNotAva: 'The latest version is now used, no need to update',
}

const UPDATE_URL = 'https://guaguaiam.oss-accelerate.aliyuncs.com/madmachine/app'

class UpdateManager {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.initUpdate()

      this.checkUpdate()
    }
  }

  checkUpdate() {
    autoUpdater.checkForUpdates()
  }

  initUpdate() {
    autoUpdater.setFeedURL(UPDATE_URL)

    autoUpdater.on('error', (error) => {
      console.log(error)

      this.progressBar.close()
      this.sendUpdateMessage(UPDATE_MESSAGE.error)
    })
    // autoUpdater.on('checking-for-update', () => {
    //   this.sendUpdateMessage(UPDATE_MESSAGE.checking)
    // })
    autoUpdater.on('update-available', () => {
      this.sendUpdateMessage(UPDATE_MESSAGE.updateAva)

      this.progressBar = new ProgressBar({
        text: 'Downloading update file',
        detail: 'Wait...',
        title: 'Update',
      })
      this.progressBar.on('progress', (value) => {
        this.progressBar.detail = `Current download progress ${value}%`
      })
    })
    // autoUpdater.on('update-not-available', () => {
    //   this.sendUpdateMessage(UPDATE_MESSAGE.updateNotAva)
    // })

    // 更新下载进度事件
    autoUpdater.on('download-progress', (progressObj) => {
      this.progressBar.value = progressObj.percent
    })
    autoUpdater.on('update-downloaded', () => {
      this.progressBar.setCompleted()
      dialog.showMessageBox(
        {
          type: 'info',
          title: 'Update MadMachine',
          buttons: ['Update', 'Later'],
          defaultId: 0,
          message: 'Do you want to update the application?',
          cancelId: 1,
        },
        (response) => {
          if (response === 0) {
            autoUpdater.quitAndInstall()
          }
        },
      )
    })
  }

  sendUpdateMessage(message) {
    const notification = new Notification({
      title: 'MadMachine Update',
      body: message,
    })
    notification.show()
  }
}

export default UpdateManager

import { observable, action } from 'mobx'
// import { debounce } from 'lodash'
import emitter from '@/utils/emitter'

class UsbStore {
  // usb 路径
  @observable usbDir = ''

  // 是否挂载
  @observable isMount = false

  @observable progress = 0

  // 是否显示 copy 文件提示
  @observable isShowTip = false

  @observable showTipFlag = false

  @observable tipTime = false

  @observable timeId = 0

  @observable status = ''

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @action setShowTip(isShow) {
    this.isShowTip = isShow

    clearInterval(this.timeId)
    emitter.emit('CONSOLE_CLEAR')
    this.rootStore.editWindow.consoleManager.copyFile()
  }

  @action setShowTipFlag(flag) {
    this.showTipFlag = flag
    this.rootStore.editWindow.setUsbTipFlag(flag)
  }

  @action setUsbDir(dir, isMount) {
    this.usbDir = dir
    this.isMount = isMount
  }

  @action async copyFile(isShow) {
    console.log('mobx copyFile')
    if (this.rootStore.consoleStore.runStatus === 'compiling') return

    emitter.emit('CONSOLE_CLEAR')
    const isHave = this.status !== '' && this.status.includes('ready') // await this.rootStore.editWindow.usbManager.check()

    console.log(isHave)

    if (isHave) {
      this.setCopyProgress(0)

      this.rootStore.consoleStore.setConsoleRun('compiling')
      console.log('===== run')
      await this.rootStore.editWindow.consoleManager.run(this.rootStore.consoleStore.cols, this.rootStore.consoleStore.rows, false)
      console.log('===== copy')
      this.rootStore.editWindow.consoleManager.copyFile()
    } else {
      clearInterval(this.timeId)
      this.isShowTip = isShow
      if (this.isShowTip) {
        this.tipTime = 5
        this.timeId = setInterval(() => {
          this.tipTime -= 1
          if (this.tipTime === 0) {
            this.setShowTip(false)
          }
        }, 1000)
      }
    }
  }

  @action setCopyProgress = (progress) => {
    this.progress = progress
  }

  @action showSerial() {
    this.rootStore.editWindow.showSerialView()
  }

  @action showUser() {
    this.rootStore.editWindow.app.showUserView()
  }

  @action setStatus = (status) => {
    if (status === this.status) return
    this.status = status
  }
}

export default UsbStore

import { observable, action } from 'mobx'
import emitter from '@/utils/emitter'

class ConsoleStore {
  // 是否在跑
  @observable runStatus = false

  // 控制台输出
  @observable consoleContent = []

  @observable cols = 40

  @observable rows = 60

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  // 编译
  @action runBuild() {
    // 初始化状态
    this.rootStore.usbStore.setCopyProgress(0)
    this.runStatus = 'compiling'

    // 清空控制台
    emitter.emit('CONSOLE_CLEAR')
    this.rootStore.editWindow.consoleManager.run(this.cols, this.rows)
  }

  // 控制台是否执行
  @action setConsoleRun(runStatus) {
    this.runStatus = runStatus
  }

  // 设置控制台输入内容
  @action setConsoleContent(content) {
    this.consoleContent = content
  }

  @action setConsoleSize(cols, rows) {
    this.cols = cols
    this.rows = rows
  }
}

export default ConsoleStore

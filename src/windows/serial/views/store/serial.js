import { observable, action } from 'mobx'

class Serial {
  @observable message = []

  @observable connectMessage = {}

  // 是否连接
  @observable isOpen = false

  // 所有串口列表
  @observable portsList = []

  // 串口列表
  @observable portName = {}

  // 输入的文本
  @observable iptVal = ''

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @action setIptValue(val) {
    this.iptVal += val
  }

  @action delIptValue() {
    this.iptVal = this.iptVal.slice(0, -1)
  }

  @action postMessage() {
    if (!this.iptVal) {
      return false
    }

    this.rootStore.serialWindow.serialManager.postMessage(this.iptVal)

    this.iptVal = ''
    return true
  }

  @action setMessage(message) {
    this.message = message
  }

  @action setConnectMessage(message) {
    this.connectMessage = message
  }

  @action setPortName(portName) {
    if (this.isOpen) {
      this.rootStore.serialWindow.serialManager.closeConnect(this.portName)
    }

    this.portName = portName
  }

  @action connect() {
    if (!this.portName || this.isOpen) {
      return false
    }

    this.rootStore.serialWindow.serialManager.connect(this.portName)
    return true
  }

  @action setStatus(status) {
    this.isOpen = status
  }

  @action setList(list) {
    this.portsList = list
  }
}

export default Serial

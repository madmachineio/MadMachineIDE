// import os from 'os'
// import fs from 'fs'
// import { app } from 'electron'
// import SerialPort from '../../node_modules/serialport'

import SerialPort from 'serialport'

class SerialManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    this.serialPort = null
    this.isOpen = false
    this.message = []

    this.events = {}
  }

  connect(name) {
    if (!name) {
      return
    }

    this.serialPort = new SerialPort(name, {
      baudRate: 115200,
      autoOpen: false,
      dataBits: 8,
      stopBits: 1,
    })

    this.serialPort.on('data', (data) => {
      this.sendMessage('stdout', data.toString('utf8'))
    })

    this.serialPort.on('error', (error) => {
      this.sendMessage('stderr', error)
    })

    this.serialPort.open((error) => {
      if (!error) {
        this.setStatus(true)

        this.sendConnectMessage('stdout', `Connet ${name} success`)
      } else {
        this.sendConnectMessage('stderr', `${error}`)
      }
    })
  }

  closeConnect(name) {
    if (this.serialPort) {
      if (this.serialPort.close) {
        this.serialPort.close()
      }
      this.serialPort = null
    }

    this.setStatus(false)

    this.sendConnectMessage('stdout', `Disconnet ${name} success`)
  }

  destory() {
    this.closeConnect()

    this.message = []
  }

  postMessage(data) {
    if (!this.serialPort || !this.isOpen) {
      this.sendConnectMessage('stderr', 'Not connect')
      return false
    }

    this.serialPort.write(data, 'ascii', (error) => {
      console.log(error)
      this.serialPort.drain(() => {
        console.log('drain')
      })
      // console.log(this.serialPort.read(10))
      // if (!error) {
      //   // this.sendMessage('post', data)
      // }
    })

    return true
  }

  initSerialList() {
    SerialPort.list().then((ports) => {
      this.eventEmitter.emit('SERIAL-LIST', ports)
    }).catch(error => {
      console.error(error)
    })
  }

  sendMessage(type, data) {
    this.message.push({
      id: new Date().getTime() + Math.ceil(Math.random() * 10000),
      type,
      data,
    })

    this.eventEmitter.emit('message', this.message)
  }

  sendConnectMessage(type, data) {
    this.eventEmitter.emit('connect-message', {
      type,
      data,
    })
  }

  setStatus(status) {
    this.isOpen = status
    this.eventEmitter.emit('status', this.isOpen)
  }
}

export default SerialManager

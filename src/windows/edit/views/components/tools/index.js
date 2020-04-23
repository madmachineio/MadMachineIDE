import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import './styles/index.scss'

import Icon from '@windows/components/icon'
import CopyFile from './copyFileTip'

const { remote } = require('electron')

@inject(({
  fileStore, consoleStore, configStore, usbStore, userStore,
}) => ({
  fileStore,
  consoleStore,
  configStore,
  usbStore,
  userStore,
}))
@observer
class Tools extends Component {
  newFileHandle() {
    const { fileStore } = this.props
    const {
      activeFile: { path = '' },
    } = fileStore

    const splitTag = remote.getCurrentWindow().editWindow.getPlatform() === 'win32' ? '\\' : '/'

    fileStore.findFileByPath(
      path
        .split(splitTag)
        .slice(0, -1)
        .join(splitTag),
    )
    fileStore.createFile()
  }

  saveAllFileHandle() {
    const { fileStore } = this.props
    fileStore.saveAllFile()
  }

  runBuildHandle() {
    const { consoleStore, configStore, fileStore } = this.props
    if (fileStore.getIsExample()) {
      return
    }

    this.saveAllFileHandle()
    consoleStore.runBuild()

    const { consoleHeight } = configStore
    if (consoleHeight < 100) {
      configStore.setConsoleHeight(280)
    }
  }

  toggleFileManageHandle() {
    const { configStore } = this.props
    const { fileManagerShow } = configStore

    configStore.setFileManageShow(!fileManagerShow)
  }

  toggleConsoleHandle() {
    const { configStore } = this.props
    const { consoleHeight } = configStore

    configStore.setConsoleHeight(consoleHeight === 31 ? 280 : 31)
  }

  copyFileHandle() {
    const { usbStore, configStore, fileStore } = this.props

    if (fileStore.getIsExample()) {
      return
    }

    this.saveAllFileHandle()

    usbStore.copyFile(!usbStore.showTipFlag)

    const { consoleHeight } = configStore
    if (consoleHeight < 100) {
      configStore.setConsoleHeight(280)
    }
  }

  showSerialHandle() {
    const { usbStore } = this.props
    usbStore.showSerial()
  }

  showUserHandle() {
    const { userStore } = this.props
    userStore.showUser()
  }

  render() {
    const {
      configStore: { fileManagerShow, consoleHeight },
      userStore: {
        userInfo: { userName = 'Login' },
      },
      fileStore: {
        isExample,
      },
    } = this.props

    console.log(isExample)

    return (
      <div className="layout-tools">
        <div className="left-block">
          <div className="group">
            <span onClick={this.newFileHandle.bind(this)} title="New File" className={classnames({ disabled: isExample })}>
              <Icon icon="plus-square" size="18" />
            </span>
            <span onClick={this.saveAllFileHandle.bind(this)} title="Save All">
              <Icon icon="save1" size="18" />
            </span>
          </div>

          <div className="group">
            <span onClick={this.runBuildHandle.bind(this)} title="Verify" className={classnames({ disabled: isExample })}>
              <Icon icon="Path" size="18" />
            </span>
            <span onClick={this.copyFileHandle.bind(this)} title="Download" className={classnames({ disabled: isExample })}>
              <Icon icon="download1" size="18" />
            </span>
          </div>
        </div>
        <div className="right-block">
          <div className="group">
            <span onClick={this.showSerialHandle.bind(this)} title="Serial Monitor">
              <Icon icon="codelibrary" size="18" />
            </span>
          </div>
          <div className="group">
            <span className={[fileManagerShow ? 'actived' : '']} onClick={this.toggleFileManageHandle.bind(this)} title="Hide or show the Navigator">
              <Icon icon="CombinedShape" size="18" />
            </span>
            <span className={[Number(consoleHeight) !== 31 ? 'actived' : '']} onClick={this.toggleConsoleHandle.bind(this)} title="Hide or show the Panel">
              <Icon icon="CombinedShape1" size="18" />
            </span>
          </div>
          <div className="user-info" onClick={this.showUserHandle.bind(this)} title="Log in to your MadMachine Account">
            <Icon icon="user" size="18" />
            <span>{userName}</span>
          </div>
        </div>
        <CopyFile />
      </div>
    )
  }
}

Tools.propTypes = {
  fileStore: PropTypes.object,
  consoleStore: PropTypes.object,
  configStore: PropTypes.object,
  usbStore: PropTypes.object,
  userStore: PropTypes.object,
}

Tools.defaultProps = {
  fileStore: {},
  consoleStore: {},
  configStore: {},
  usbStore: {},
  userStore: {},
}

export default Tools

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import './styles/index.scss'

import Icon from '@windows/components/icon'
import CopyFile from './copyFileTip'

const { remote } = require('electron')

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')

const MODIFY_TYPES = ['newFolder', 'newFile', 'rename']
const findModifyTypes = (folder) => {
  if (MODIFY_TYPES.includes(folder)) {
    return true
  }
    return (folder.children || []).reduce((result, item) => result || findModifyTypes(item), false)
}

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
    trackEvent('NewFile')
    const { fileStore } = this.props
    const {
      activeFile: { path = '' },
      folders,
    } = fileStore
    if (findModifyTypes(folders)) {
      return
    }

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
    trackEvent('SaveAll')
    const { fileStore } = this.props
    fileStore.saveAllFile()
  }

  runBuildHandle() {
    trackEvent('Build')
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
    trackEvent('ToggleFileManage', 'Show', !fileManagerShow)
  }

  toggleConsoleHandle() {
    const { configStore } = this.props
    const { consoleHeight } = configStore

    const minHeight = 31
    const normalHeight = 280
    const targetHeight = consoleHeight === minHeight ? normalHeight : minHeight
    configStore.setConsoleHeight(targetHeight)
    trackEvent('ToggleConsole', 'Expand', targetHeight === normalHeight)
  }

  copyFileHandle() {
    trackEvent('Download')
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
    trackEvent('ShowSerial')
    const { usbStore } = this.props
    usbStore.showSerial()
  }

  showUserHandle() {
    const { userStore } = this.props
    userStore.openCommunity()
    trackEvent('OpenCommunity')
  }

  render() {
    const {
      configStore: { fileManagerShow, consoleHeight },
      // userStore: {
      //   userInfo: { userName = 'Login' },
      // },
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
            <span onClick={this.runBuildHandle.bind(this)} title="Build" className={classnames({ disabled: isExample })}>
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
            <span>Community</span>
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

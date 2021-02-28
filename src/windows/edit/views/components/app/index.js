import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Tools from '@edit/components/tools'
import Header from '@edit/components/header'
import FileManager from '@edit/components/fileManager'
import DragSize from '@windows/components/dragSize'
import Edit from '@edit/components/edit'
import Console from '@edit/components/console'

import './index.scss'

const { remote } = require('electron')

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')

@inject(({ configStore }) => ({
  configStore,
}))
@observer
class App extends Component {
  componentDidMount() {
    trackEvent('Open')
  }

  consoleDragHandle = (height) => {
    const { configStore } = this.props
    configStore.setConsoleHeight(height)
  }

  fileDragHandle = (width) => {
    const { configStore } = this.props
    configStore.setManageWidth(width)
  }

  render() {
    const {
      configStore: { fileManagerShow, fileManagerWdith, consoleHeight },
    } = this.props

    const isMac = remote.getCurrentWindow().editWindow.getPlatform() === 'darwin'

    return (
      <div className="layout-app">
        <div className="app-header">
          {isMac && <Header />}
          <Tools />
        </div>

        <div className="app-body">
          <DragSize width={fileManagerWdith} minWidth="180" maxWidth="90%" verticalDrag show={fileManagerShow} onVerticalDrag={this.fileDragHandle}>
            <FileManager />
          </DragSize>

          <div className="right-container" style={{ maxWidth: `calc(100% - ${fileManagerShow ? fileManagerWdith : 0}px)` }}>
            <div className="edit-wrap">
              <Edit />
            </div>

            <DragSize height={consoleHeight} minHeight="31" maxHeight="80%" horizontalDrag onHorizonDrag={this.consoleDragHandle}>
              <Console />
            </DragSize>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  configStore: PropTypes.object,
}

App.defaultProps = {
  configStore: {},
}

export default App

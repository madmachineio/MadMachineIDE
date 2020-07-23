import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Icon from '@windows/components/icon'
import Progress from '@windows/components/progresss'

import './styles/status.scss'

@inject(({ configStore, usbStore, consoleStore }) => ({
  configStore,
  usbStore,
  consoleStore,
}))
@observer
class ConsoleStatus extends Component {
  consoleMaxHandle() {
    const { configStore } = this.props
    const { lastConsoleHeight, consoleHeight } = configStore
    configStore.setConsoleHeight(consoleHeight === '80%' ? lastConsoleHeight : '80%')
  }

  consoleMinHandle() {
    const { configStore } = this.props
    configStore.setConsoleHeight(31)
  }

  render() {
    const {
      usbStore: { isMount, progress },
      configStore: { consoleHeight },
      consoleStore: { runStatus: buildStatus },
    } = this.props

    let compileText = ''
    if (buildStatus === 'compiling') {
      compileText = 'Building...'
    } else if (buildStatus === 'error') {
      compileText = 'Error'
    } else if (buildStatus === 'success') {
      compileText = 'Done'
    }

    return (
      <div className="layout-console-status">
        <div className="status">
          {isMount ? (
            <div className="status-icon">
              <Icon icon="swift" />
            </div>
          ) : ''}

          {progress > 0 ? <span className="text">Downloading...</span> : <span className="text">{compileText}</span>}
          {progress > 0 ? (
            <div className="status-progress">
              <Progress progress={progress * 100} />
            </div>
          ) : null}
        </div>
        <div className="tools">
          <span className={[consoleHeight === '80%' ? 'icon-top' : '']} onClick={this.consoleMaxHandle.bind(this)} title="Maximize or Minimize Panel Size">
            <Icon icon="vertical-align-top" size="16" />
          </span>
          <span onClick={this.consoleMinHandle.bind(this)} title="Close Panel">
            <Icon icon="CombinedShape4" size="16" />
          </span>
        </div>
      </div>
    )
  }
}

ConsoleStatus.propTypes = {
  configStore: PropTypes.object,
  usbStore: PropTypes.object,
  consoleStore: PropTypes.object,
}

ConsoleStatus.defaultProps = {
  configStore: {},
  usbStore: {},
  consoleStore: {},
}

export default ConsoleStatus

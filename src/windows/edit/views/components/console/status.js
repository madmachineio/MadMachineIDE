import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import Icon from '@windows/components/icon'
// import Progress from '@windows/components/progresss'
import './styles/status.scss'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')
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
    trackEvent('MaximizeConsole', 'Max', consoleHeight !== '80%')
  }

  consoleMinHandle() {
    trackEvent('CloseConsole')
    const { configStore } = this.props
    configStore.setConsoleHeight(31)
  }

  render() {
    const {
      usbStore: {
        // progress: usbProgress,
        status,
      },
      configStore: { consoleHeight },
      // consoleStore: { runStatus: buildStatus },
    } = this.props


    // // 编译提示
    // const compileText = {
    //   compiling: 'Building...',
    //   error: 'Error',
    //   success: 'Done',
    // }[buildStatus] || ''

    // usb是否挂载
    // const isMount = status && status.includes('ready')

    return (
      <div className="layout-console-status">
        <div className="status">
          {/* {isMount ? (
            <div className="status-icon">
              <Icon icon="swift" />
            </div>
          ) : ''} */}

          {status}

          {/* {usbProgress > 0
            ? usbProgress === 101
              ? <span className="text">Done</span>
              : <span className="text">Downloading...</span>
            : usbProgress === -1
              ? <span className="text">Error</span>
              : <span className="text">{compileText}</span>}
          {usbProgress > 0 && usbProgress < 100
            ? (
              <div className="status-progress">
                <Progress progress={usbProgress * 100} />
              </div>
            )
            : null} */}
        </div>
        <div className="tools">
          <span
            className={[consoleHeight === '80%' ? 'icon-top' : '']}
            onClick={this.consoleMaxHandle.bind(this)}
            title="Maximize or Minimize Panel Size"
          >
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
  // consoleStore: PropTypes.object,
}

ConsoleStatus.defaultProps = {
  configStore: {},
  usbStore: {},
  // consoleStore: {},
}

export default ConsoleStatus

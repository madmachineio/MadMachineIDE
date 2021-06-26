import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

// import classnames from 'classnames'

import './index.scss'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'SerialWindow')
const pv = remote.getGlobal('pv')

@inject(({ serialStore }) => ({
  serialStore,
}))
@observer
class App extends Component {
  constructor(props) {
    super(props)

    this.scrollRef = React.createRef()
  }

  componentDidMount() {
    pv('/serial', 'Serial')
    document.addEventListener('keyup', this.keyUpHandle.bind(this))
  }

  componentWillReact() {
    setTimeout(() => {
      const scrollDom = this.scrollRef.current
      if (scrollDom) {
        scrollDom.scrollTop = scrollDom.scrollHeight
      }
    })
  }

  keyUpHandle({ key, code }) {
    const { serialStore } = this.props

    if (key.length === 1) {
      console.log(key)
      serialStore.setIptValue(key)
    }
    if (code === 'Enter') {
      serialStore.setIptValue('\r\n')
    }
    serialStore.postMessage()
    return true
  }

  connectHandle() {
    const { serialStore } = this.props
    const connectResult = serialStore.connect()
    trackEvent('Connect', 'Success', connectResult)
  }

  portSelectHandle({ target: { value } }) {
    trackEvent('SelectPort')
    const { serialStore } = this.props
    serialStore.setPortName(value)
  }

  render() {
    const {
      serialStore: {
        portsList, isOpen, message, iptVal, connectMessage,
      },
    } = this.props

    return (
      <div className="layout-serial">
        <div className="cmd-body" ref={this.scrollRef}>
          <div className="msg-list">
            {/* {message.map(item => (
              <span className={item.type} key={item.id}>
                <pre>{item.data}</pre>
              </span>
            ))} */}
            <pre>{message.map(item => item.data).join('')}</pre>
          </div>
          <div className="ipt-wrap">
            <span>{iptVal}</span>
            <span className="cursor">|</span>
          </div>
        </div>
        <div className="cmd-tools">
          <div className="block flex-1">
            <span className={`${connectMessage.type} ellipsis msg`} title={connectMessage.data}>
              {connectMessage.data}
            </span>
          </div>
          <div className="block">
            <span className="label">Baudrate:</span>
            <span>115200</span>
          </div>
          <div className="block">
            <span className="label">UART Port:</span>
            <select onChange={this.portSelectHandle.bind(this)}>
              <option value="">Select</option>
              {portsList.map(item => (
                <option value={item.path} key={item.path}>
                  {item.path}
                </option>
              ))}
            </select>
            <button type="button" className="btn primary" disabled={isOpen} onClick={this.connectHandle.bind(this)}>
              {isOpen ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  serialStore: PropTypes.object,
}

App.defaultProps = {
  serialStore: {},
}

export default App

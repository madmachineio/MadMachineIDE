import React, { Component } from 'react'
import emitter from '@/utils/emitter'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { debounce } from 'lodash'

import ContentMenu from '@windows/components/contentMenu'

import Status from './status'
// import ConsoleBody from './console'
import ConsoleBody from './xterm'

import './styles/index.scss'

const { ipcRenderer, clipboard, remote } = require('electron')

@inject(({ configStore, consoleStore }) => ({
  configStore,
  consoleStore,
}))
@observer
class Console extends Component {
  state = {
    showContentMenu: false,
    menuList: [],
    menuPos: {
      left: 0,
      top: 0,
    },
  }

  constructor(props) {
    super(props)

    this.termRef = React.createRef()
    this.initMenu()
    this.initEvent()
  }

  componentDidMount() {
    ipcRenderer.on('CONSOLE_MESSAGE', (event, message) => {
      console.log('---origin:', message)
      const trimMsg = message.replace(/^(.\[\?25l)(.\[80X.\[80C(\r?\n|\r)?)+.\[H.\[\?25h$/, '').replace(/(\r?\n|\r){3,}/g, '\n') // .replace(/(.\[80X.\[80C.?(\r?\n|\r))+/g, '$1$1$1') // .replace(/.\[\??.{3}/gi, '').replace(/\[?\?251?h?H?/gi, '')

      // if (!/\\cmd.exe/g.test(trimMsg)) {
      //   this.termRef.current.write(trimMsg)
      // }

      // const trimMsg = message
      if (trimMsg) {
        console.log(trimMsg)
        this.termRef.current.write(trimMsg)
      }

      // this.termRef.current.write(message)
    })
    emitter.on('CONSOLE_CLEAR', () => {
      this.termRef.current.xterm.clear()
      this.termRef.current.xterm.reset()
    })

    const fixTerm = debounce(() => {
      this.termRef.current.fitAddon.fit()

      this.setColRow()
    }, 200)
    emitter.on('DRAG_RESIZE', fixTerm)
    emitter.on('PAGE_RESIZE', fixTerm)

    setTimeout(() => {
      this.setColRow()
    }, 2000)
  }

  setColRow() {
    const { consoleStore } = this.props

    const xterm = this.termRef.current.getTerminal()
    consoleStore.setConsoleSize(xterm.cols, xterm.rows)
  }

  contentMenuHandle = (event) => {
    event.stopPropagation()

    // const { fileStore } = this.props
    // const contentMenuFile = fileStore.findFileByPath(path)

    this.setState({
      showContentMenu: true,
      menuList: this.menuList,
      menuPos: {
        left: event.pageX,
        top: event.pageY,
      },
    })
  }

  initMenu() {
    const isMac = remote.getCurrentWindow().editWindow.getPlatform() === 'darwin'
    this.menuList = [
      {
        name: 'Copy',
        key: `${isMac ? '⌘' : 'Ctrl+'}C`,
        click: () => {
          clipboard.writeText(window.getSelection().toString())
        },
      },
    ]
  }

  initEvent() {
    document.addEventListener(
      'click',
      () => {
        this.setState({
          showContentMenu: false,
        })
      },
      true,
    )
  }

  render() {
    const { showContentMenu, menuList, menuPos } = this.state
    const {
      configStore: { consoleHeight },
    } = this.props

    return (
      <div className="layout-console">
        <Status />
        {/* <ConsoleBody /> */}

        <div
          className="body-wrap"
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: `${consoleHeight - 52}px`,
          }}
        >
          <ConsoleBody
            // eslint-disable-next-line react/no-string-refs
            ref={this.termRef}
            height={`${consoleHeight - 52}px`}
            onContextMenu={this.contentMenuHandle}
          />
        </div>

        {showContentMenu ? <ContentMenu list={menuList} left={menuPos.left} top={menuPos.top} /> : null}
      </div>
    )
  }
}

Console.propTypes = {
  configStore: PropTypes.object,
  consoleStore: PropTypes.object,
}

Console.defaultProps = {
  configStore: {},
  consoleStore: {},
}

export default Console

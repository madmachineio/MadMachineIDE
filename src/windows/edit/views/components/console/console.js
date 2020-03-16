import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import classNames from 'classnames'

import ContentMenu from '@windows/components/contentMenu'

import './styles/console.scss'

const { clipboard, remote } = require('electron')

@inject(({ consoleStore }) => ({
  consoleStore,
}))
@observer
class ConsoleBody extends Component {
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

    this.scrollRef = React.createRef()

    this.initMenu()
    this.initEvent()
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

  contentMenuHandle(event) {
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

  componentWillReact() {
    setTimeout(() => {
      const scrollDom = this.scrollRef.current
      scrollDom.scrollTop = scrollDom.scrollHeight
    })
  }

  render() {
    const { showContentMenu, menuList, menuPos } = this.state
    const {
      consoleStore: { consoleContent },
    } = this.props

    return (
      <div className="layout-console-body" onContextMenu={this.contentMenuHandle.bind(this)}>
        <div className="console-wrap" ref={this.scrollRef}>
          {consoleContent.map(item => (
            <pre key={item.id} className={classNames([item.type])}>
              {item.data}
            </pre>
          ))}
        </div>

        {showContentMenu ? <ContentMenu list={menuList} left={menuPos.left} top={menuPos.top} /> : null}
      </div>
    )
  }
}

ConsoleBody.propTypes = {
  consoleStore: PropTypes.object,
}

ConsoleBody.defaultProps = {
  consoleStore: {},
}

export default ConsoleBody

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import ContentMenu from '@windows/components/contentMenu'
import logoImg from '@windows/assets/images/logo.png'
import Tab from './tab'
import EditBody from './edit'

import './styles/index.scss'

const { clipboard, remote } = require('electron')

const findParent = (el) => {
  if (Array.from(el.classList).includes('layout-edit-body')) {
    return el
  }

  if (el.parentElement) {
    return findParent(el.parentElement)
  }

  return null
}

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class Edit extends Component {
  state = {
    showContentMenu: false,
    menuList: [],
    menuPos: {
      left: 0,
      top: 0,
    },
    showTabMore: false,
    moreTools: [],
    morePos: {
      left: 0,
      top: 0,
    },
  }

  constructor(props) {
    super(props)

    this.initMenu()
    this.initMoreTools()

    this.initEvent()
  }

  showMoreToolsHandle = (x, y) => {
    this.setState({
      showTabMore: true,
      moreTools: this.moreTools,
      morePos: {
        left: x - 160,
        top: y + 20,
      },
    })
  }

  initMenu() {
    const isMac = remote.getCurrentWindow().editWindow.getPlatform() === 'darwin'

    this.menuList = [
      {
        name: 'Format Document',
        click: () => {
          const { fileStore } = this.props
          const { activeEditor } = fileStore
          if (activeEditor) {
            const totalLines = activeEditor.lineCount()
            activeEditor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines })
          }
        },
      },
      {
        name: 'Format Selection',
        click: () => {
          const { fileStore } = this.props
          const { activeEditor } = fileStore
          if (activeEditor) {
            activeEditor.autoFormatRange(activeEditor.getCursor(true), activeEditor.getCursor(false))
          }
        },
      },
      {
        type: 'separator',
      },
      {
        name: 'Cut',
        key: `${isMac ? '⌘' : 'Ctrl+'}X`,
        isDirectory: true,
        click: () => {
          const { fileStore } = this.props
          const { activeEditor } = fileStore
          if (activeEditor) {
            clipboard.writeText(activeEditor.getSelection())
            activeEditor.replaceSelection('')
          }
        },
      },
      {
        name: 'Copy',
        key: `${isMac ? '⌘' : 'Ctrl+'}C`,
        click: () => {
          const { fileStore } = this.props
          const { activeEditor } = fileStore
          if (activeEditor) {
            clipboard.writeText(activeEditor.getSelection())
          }
        },
      },
      {
        name: 'Paste',
        key: `${isMac ? '⌘' : 'Ctrl+'}V`,
        isDirectory: true,
        click: () => {
          const { fileStore } = this.props
          const { activeEditor } = fileStore
          if (activeEditor) {
            activeEditor.replaceSelection(clipboard.readText())
          }
        },
      },
      {
        type: 'separator',
      },
      {
        name: 'Copy Path',
        // key: 'Shift+Alt+C',
        click: () => {
          const { fileStore } = this.props
          const { activeFile } = fileStore
          fileStore.copyPath(activeFile.path)
        },
      },
    ]
  }

  initMoreTools() {
    this.moreTools = [
      {
        name: 'Close All',
        click: () => {
          const { fileStore } = this.props
          const { files } = fileStore
          files.forEach(file => fileStore.removeOpenFile(file))
        },
      },
      {
        name: 'Close Saved',
        click: () => {
          const { fileStore } = this.props
          const { files, editFileMap } = fileStore
          files.forEach((file) => {
            if (!editFileMap[file.path]) {
              fileStore.removeOpenFile(file)
            }
          })
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
          showTabMore: false,
        })
      },
      true,
    )
  }

  contentMenuHandle(event) {
    event.stopPropagation()
    const { target } = event
    const isShow = Boolean(findParent(target))

    // const { fileStore } = this.props
    // const contentMenuFile = fileStore.findFileByPath(path)

    this.setState({
      showContentMenu: isShow,
      menuList: this.menuList,
      menuPos: {
        left: event.pageX,
        top: event.pageY,
      },
    })
  }

  render() {
    const {
      showContentMenu, menuList, menuPos, showTabMore, moreTools, morePos,
    } = this.state
    const {
      fileStore: { files },
    } = this.props

    return (
      <div className="layout-edit" onContextMenu={this.contentMenuHandle.bind(this)}>
        <Tab onShowMoreTools={this.showMoreToolsHandle} />
        <div className="edit-wrap">
          {files && files.length > 0 ? (
            files.map(item => <EditBody key={item.path} file={item} />)
          ) : (
            <div className="edit-tip-content">
              <div className="edit-tip-wrap">
                <div className="tip-content">
                  <div className="tip-logo">
                    <img src={logoImg} alt="logo" />
                  </div>
                  <ul className="content-list">
                    <li>
                      <span className="label">Open Project</span>
                      <span className="message">File &gt; Open Project... </span>
                    </li>
                    <li>
                      <span className="label">Open File</span>
                      <span className="message">File &gt; Open File... </span>
                    </li>
                    <li>
                      <span className="label">Open Recent</span>
                      <span className="message">File &gt; Open Recent... </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {showContentMenu ? <ContentMenu list={menuList} left={menuPos.left} top={menuPos.top} /> : null}
        {showTabMore ? <ContentMenu list={moreTools} left={morePos.left} top={morePos.top} /> : null}
      </div>
    )
  }
}

Edit.propTypes = {
  fileStore: PropTypes.object,
}
Edit.defaultProps = {
  fileStore: {},
}

export default Edit

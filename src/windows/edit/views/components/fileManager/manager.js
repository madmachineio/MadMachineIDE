import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import { Scrollbars } from 'react-custom-scrollbars'
import classnames from 'classnames'
import Icon from '@windows/components/icon'
import ContentMenu from '@windows/components/contentMenu'
import './styles/manager.scss'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')
const calcDeepPadding = deep => 14 + 20 * deep
const MODIFY_TYPES = ['newFile', 'rename']
const FOLDER_MODIFY_TYPES = ['newFolder']

const abortSwiftFile = name => `${name.slice(0, Math.min(name.lastIndexOf('.'), 50))}.swift`

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class FileFolder extends Component {
  state = {
    showMap: {},
    showContentMenu: false,
    menuList: [],
    menuPos: {
      left: 0,
      top: 0,
    },
  }

  componentDidMount() {
    this.initMenu()
  }

  initMenu() {
    const track = trackEvent.bind(null, 'ExplorerContextMenu')
    this.menuList = [
      {
        name: 'New File',
        isShow(fileData) {
          return fileData.isDirectory === true
        },
        click: () => {
          track('NewFile')
          const { fileStore } = this.props
          fileStore.createFile()

          const { managerContentFile } = fileStore
          const key = managerContentFile.key.join(',')
          this.setState(pState => ({
            showMap: {
              ...pState.showMap,
              [key]: true,
            },
          }))
        },
      },
      {
        name: 'New Folder',
        isShow() {
          return true
        },
        click: () => {
          track('NewFolder')
          const { fileStore } = this.props
          fileStore.createFolder()

          const { managerContentFile } = fileStore
          const key = managerContentFile.key.join(',')
          this.setState(pState => ({
            showMap: {
              ...pState.showMap,
              [key]: true,
            },
          }))
        },
      },
      {
        name: 'Reveal in Explorer',
        // key: 'Shift+Alt+R',
        isShow() {
          return true
        },
        click: () => {
          track('Reveal')
          const { fileStore } = this.props
          fileStore.showInExplorer()
        },
      },
      {
        type: 'separator',
        isShow() {
          return true
        },
      },
      {
        name: 'Cut',
        // key: 'Ctrl+X',
        isShow() {
          return false // fileData.isDirectory === true
        },
        click: () => {
          track('Cut')
          const { fileStore } = this.props
          fileStore.cutFile()
        },
      },
      {
        name: 'Copy',
        // key: 'Ctrl+C',
        isShow(fileData) {
          return fileData.name !== 'main.swift' && !/\.mmp$/gi.test(fileData.name)
        },
        click: () => {
          track('Copy')
          const { fileStore } = this.props
          fileStore.copyFile()
        },
      },
      {
        name: 'Paste',
        // key: 'Ctrl+V',
        isShow(fileData) {
          return fileData.isDirectory === true
        },
        click: () => {
          track('Paste')
          const { fileStore } = this.props
          fileStore.pasteFile()
        },
      },
      {
        name: 'Copy Path',
        // key: 'Shift+Alt+C',
        isShow() {
          return true
        },
        click: () => {
          track('CopyPath')
          const { fileStore } = this.props
          fileStore.copyPath()
        },
      },
      {
        type: 'separator',
        isShow(fileData) {
          return fileData.name !== 'main.swift'
        },
      },
      {
        name: 'Rename',
        // key: '↩',
        isShow(fileData) {
          return fileData.isDirectory === false && fileData.name !== 'main.swift' && !/\.mmp$/gi.test(fileData.name)
        },
        click: () => {
          track('Rename')
          const { fileStore } = this.props
          fileStore.rename()
        },
      },
      {
        name: 'Delete',
        isShow(fileData) {
          return fileData.isDirectory === false && fileData.name !== 'main.swift' && !/\.mmp$/gi.test(fileData.name)
        },
        click: () => {
          track('Delete')
          const { fileStore } = this.props
          fileStore.delFile()
        },
      },
    ]

    document.addEventListener('click', () => {
      this.setState({
        showContentMenu: false,
      })
    })
  }

  componentWillReact() {
    const { showMap } = this.state
    const {
      fileStore: { folders = {} },
    } = this.props

    if (!Object.keys(showMap).length && folders.key) {
      this.setState({
        showMap: {
          ...showMap,
          [folders.key.join(',')]: true,
        },
      })
    }
  }

  contentMenuHandle(event) {
    event.stopPropagation()
    const { target } = event
    const el = Array.from(target.classList).includes('block-file') ? target : target.parentElement
    const { path } = el.dataset

    const { fileStore } = this.props
    const contentMenuFile = fileStore.findFileByPath(path)
    const isExample = fileStore.getIsExample()

    this.setState({
      showContentMenu: !isExample && true,
      menuList: this.menuList.filter(item => item.isShow(contentMenuFile)),
      menuPos: {
        left: event.pageX,
        top: event.pageY,
      },
    })
    trackEvent('ShowExplorerContextMenu')
  }

  toggleFileHandle(data) {
    const { showMap } = this.state
    const key = data.key.join(',')

    this.setState(pState => ({
      showMap: {
        ...pState.showMap,
        [key]: !pState.showMap[key],
      },
    }))
    trackEvent('ExpandFolder', 'Expand', !showMap[key])
  }

  fileOpenHandle(fileData) {
    if (MODIFY_TYPES.includes(fileData.type)) {
      return
    }

    const { fileStore } = this.props
    fileStore.openFile(fileData)
    trackEvent('OpenFile')
  }

  modifyFileBlurHandle(fileData, type, value) {
    const { fileStore } = this.props
    switch (type) {
      case 'newFile':
        fileStore.realCreateFile(abortSwiftFile(value))
        break
      case 'newFolder':
        fileStore.realCreateFolder(value)
        break
      case 'rename':
        fileStore.realRename(abortSwiftFile(value))
        break
      default:
        break
    }
  }

  modifyFile(fileData, type) {
    return (
      <input
        className="ipt-name"
        autoFocus
        defaultValue={fileData.name}
        onKeyUp={(event) => {
          if (event.keyCode === 13) {
            this.modifyFileBlurHandle(fileData, type, event.target.value)
          }
        }}
        onBlur={(event) => {
          this.modifyFileBlurHandle(fileData, type, event.target.value)
        }}
        onFocus={(event) => {
          const ipt = event.target
          ipt.selectionStart = 0
          ipt.selectionEnd = ipt.value.indexOf('.')
        }}
      />
    )
  }

  genFolder(fileData) {
    const {
      fileStore: { activeFile },
    } = this.props
    const { showMap } = this.state
    const key = fileData.key.join(',')
    const { children = [] } = fileData
    const fileStyle = {
      paddingLeft: `${calcDeepPadding(fileData.key.length)}px`,
    }

    return (
      <div className={classnames({ 'folder-wrap': true, actived: true })} key={key}>
        <div
          className={classnames({ 'block-file': true, actived: activeFile.path === fileData.path })}
          style={fileStyle}
          data-path={fileData.path}
          data-key={key}
          onClick={this.toggleFileHandle.bind(this, fileData)}
        >
          <div className={classnames(['arrow', showMap[key] ? 'arrow-down' : ''])}>
            <Icon icon="arrow-left" size="12" />
          </div>
          <Icon
            icon={fileData.key.length === 1 ? 'appstore' : (showMap[key] ? 'folder' : 'gh_cdcf_')}
            size="14"
          />
          {FOLDER_MODIFY_TYPES.includes(fileData.type) ? this.modifyFile(fileData, fileData.type) : <span className="text">{fileData.name}</span>}
        </div>

        {showMap[key] ? children.map(item => (item.isDirectory ? this.genFolder(item) : this.genFile(item))) : null}
      </div>
    )
  }

  genFile(fileData) {
    const {
      fileStore: { activeFile },
    } = this.props
    const fileStyle = {
      paddingLeft: `${calcDeepPadding(fileData.key.length)}px`,
    }
    return (
      <div
        className={classnames({ 'block-file': true, actived: activeFile.path === fileData.path })}
        data-path={fileData.path}
        key={fileData.key.join(',')}
        style={fileStyle}
        onClick={this.fileOpenHandle.bind(this, fileData)}
      >
        <Icon icon="file" size="14" />
        {MODIFY_TYPES.includes(fileData.type) ? this.modifyFile(fileData, fileData.type) : <span className="text">{fileData.name}</span>}
      </div>
    )
  }

  render() {
    const {
      fileStore: { folders = {} },
    } = this.props
    const { showContentMenu, menuList, menuPos } = this.state

    // const fileStyle = {
    //   paddingLeft: `${calcDeepPadding(folders.key.length)}px`,
    // }

    return (
      <div className="file-manager-folder" onContextMenu={this.contentMenuHandle.bind(this)}>
        <Scrollbars autoHide renderThumbHorizontal={() => <div className="h-scrollbar" />} renderThumbVertical={() => <div className="v-scrollbar" />}>
          <div>{folders.key && this.genFolder(folders)}</div>
        </Scrollbars>

        {showContentMenu ? <ContentMenu list={menuList} left={menuPos.left} top={menuPos.top} /> : null}
      </div>
    )
  }
}

FileFolder.propTypes = {
  fileStore: PropTypes.object,
}

FileFolder.defaultProps = {
  fileStore: {},
}

export default FileFolder

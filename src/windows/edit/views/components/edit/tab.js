import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import { Scrollbars } from 'react-custom-scrollbars'
import Icon from '@windows/components/icon'

import './styles/tab.scss'

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class EditTab extends Component {
  constructor(props) {
    super(props)

    this.scroller = React.createRef()
    this.scrollContent = React.createRef()
    this.isTabClick = false
  }

  componentDidUpdate() {
    if (this.isTabClick) {
      this.isTabClick = false
      return
    }

    const {
      fileStore: { files, activeFile },
    } = this.props

    if (!this.scrollContent || !this.scrollContent.current || !this.scroller || !this.scroller.current) {
      return
    }

    const index = files.findIndex(m => m.path === activeFile.path)
    if (index < 0) {
      return
    }

    const liDoms = this.scrollContent.current.querySelectorAll('li')
    const currentDom = liDoms[index]
    if (currentDom) {
      this.scroller.current.scrollLeft(currentDom.offsetLeft)
    }
  }

  selectFileHandle(item) {
    const { fileStore } = this.props
    fileStore.setActiveFile(item)

    this.isTabClick = true
  }

  removeFileHandle(file) {
    const { fileStore } = this.props
    fileStore.removeOpenFile(file)
  }

  moreHandle(event) {
    event.stopPropagation()
    event.preventDefault()

    const { pageX, pageY } = event
    const { onShowMoreTools } = this.props
    onShowMoreTools(pageX, pageY)

    return false
  }

  render() {
    const {
      fileStore: { files, activeFile, editFileMap },
    } = this.props

    return (
      files
      && !!files.length && (
        <div className="layout-edit-tab">
          <div className="files-wrap">
            <Scrollbars ref={this.scroller} autoHide renderThumbHorizontal={() => <div className="file-scrollbar" />}>
              <ul className="file-tab-scroller" ref={this.scrollContent}>
                {files.map(item => (
                  <li key={item.path} className={[item.path === activeFile.path ? 'active' : '']} onClick={this.selectFileHandle.bind(this, item)}>
                    <Icon icon="file" size="16" />
                    <span className="text ellipsis">{item.name}</span>
                    <div className="icon">
                      <div
                        className="hover-icon"
                        onClick={(event) => {
                          event.stopPropagation()
                          this.removeFileHandle(item)
                        }}
                      >
                        <Icon icon="CombinedShape2" size="12" />
                      </div>
                      {editFileMap[item.path] ? (
                        <div className="normal-icon">
                          <Icon icon="Oval" size="10" />
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Scrollbars>
          </div>

          <div className="edit-more" onClick={this.moreHandle.bind(this)} title="More Actions...">
            <Icon icon="Group" size="12" />
          </div>
        </div>
      )
    )
  }
}

EditTab.propTypes = {
  fileStore: PropTypes.object,
  onShowMoreTools: PropTypes.func,
}
EditTab.defaultProps = {
  fileStore: {},
  onShowMoreTools: () => {},
}

export default EditTab

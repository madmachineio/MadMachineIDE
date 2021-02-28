import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import Icon from '@windows/components/icon'

import Manager from './manager'
import Bar from './bar'
import Example from './example'

import './styles/index.scss'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class FileManager extends Component {
  state = {
    type: 'file',
  }

  updateType = (type) => {
    this.setState({
      type,
    })
  }

  refreshHandle() {
    trackEvent('RefreshExplorer')
    const { fileStore } = this.props
    fileStore.refreshFiles()
  }

  render() {
    const { type } = this.state

    return (
      <div className="file-manager">
        <div className={classnames({ block: true, show: type === 'file' })}>
          <div className="title">
            <span className="text">EXPLORER</span>
            <span onClick={this.refreshHandle.bind(this)} title="Refresh">
              <Icon icon="sync" size="14" />
            </span>
          </div>

          <div className="project-wrap">
            <Manager />
          </div>
        </div>

        <div className={classnames({ block: true, show: type !== 'file' })}>
          <div className="title">
            <span className="text">EXAMPLES</span>
          </div>

          <div className="project-wrap">
            <Example />
          </div>
        </div>

        <div className="bottom-bar">
          <Bar type={type} onUpdate={this.updateType} />
        </div>
      </div>
    )
  }
}

FileManager.propTypes = {
  fileStore: PropTypes.object,
}

FileManager.defaultProps = {
  fileStore: {},
}

export default FileManager

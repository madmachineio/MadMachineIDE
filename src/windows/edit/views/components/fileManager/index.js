import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Icon from '@windows/components/icon'

import Manager from './manager'
import Bar from './bar'
import Example from './example'

import './styles/index.scss'

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

  exampleOpenHandle = () => {
    // this.setState({
    //   type: 'file',
    // })
  }

  refreshHandle() {
    const { fileStore } = this.props
    fileStore.refreshFiles()
  }

  render() {
    const { type } = this.state

    return (
      <div className="file-manager">
        {type === 'file' ? (
          <div className="title">
            <span className="text">EXPLORER</span>
            <span onClick={this.refreshHandle.bind(this)} title="Refresh">
              <Icon icon="sync" size="14" />
            </span>
          </div>
        ) : (
          <div className="title">
            <span className="text">EXAMPLES</span>
          </div>
        )}

        <div className="project-wrap">{type === 'file' ? <Manager /> : <Example onOpen={this.exampleOpenHandle} />}</div>

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

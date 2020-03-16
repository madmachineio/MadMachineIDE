import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Icon from '@windows/components/icon'

import './styles/bar.scss'

class BottomBar extends Component {
  setType(type) {
    const { onUpdate } = this.props
    onUpdate(type)
  }

  render() {
    const { type } = this.props

    return (
      <div className="file-manager-bar">
        <div className={[type === 'file' ? 'active' : '']} onClick={this.setType.bind(this, 'file')} title="Explore">
          <Icon icon="code1" size="22" />
        </div>
        <div className={[type === 'example' ? 'active' : '']} onClick={this.setType.bind(this, 'example')} title="Examples">
          <Icon icon="shiwu-shu" size="22" />
        </div>
      </div>
    )
  }
}

BottomBar.propTypes = {
  type: PropTypes.string,
  onUpdate: PropTypes.func,
}

BottomBar.defaultProps = {
  type: 'file',
  onUpdate: () => {},
}

export default BottomBar

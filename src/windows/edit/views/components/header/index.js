import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import './styles/index.scss'

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class Header extends Component {
  render() {
    const {
      fileStore: { windowTitle },
    } = this.props

    return (
      <div className="layout-header">
        <div>{windowTitle}</div>
      </div>
    )
  }
}

Header.propTypes = {
  fileStore: PropTypes.object,
}

Header.defaultProps = {
  fileStore: {},
}

export default Header

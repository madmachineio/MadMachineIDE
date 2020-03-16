import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import './styles/menu.scss'

@inject(({ fileStore }) => ({
  fileStore,
}))
@observer
class Menu extends Component {
  render() {
    const {
      fileStore: { windowTitle },
    } = this.props

    return (
      <div className="layout-header-menu">
        <div>{windowTitle}</div>
      </div>
    )
  }
}

Menu.propTypes = {
  fileStore: PropTypes.object,
}

Menu.defaultProps = {
  fileStore: {},
}

export default Menu

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './styles/index.scss'

class ContentMenu extends Component {
  menuClickHandle(menuData) {
    if (menuData.click) {
      menuData.click()
    }
  }

  renderLine(item, index) {
    return (
      <div className="menu-line" key={index}>
        <div />
      </div>
    )
  }

  renderItem(menuData) {
    return (
      <div className="menu-item" key={menuData.name} onMouseDown={this.menuClickHandle.bind(this, menuData)}>
        <div className="menu-name">{menuData.name}</div>
        <div className="menu-key">{menuData.key}</div>
      </div>
    )
  }

  render() {
    const { list, left, top } = this.props

    const menuStyle = {
      left: `${left}px`,
      top: `${top}px`,
    }

    return (
      <div className="component-content-menu" style={menuStyle}>
        <div className="menu-list">{list.map((item, index) => (item.type === 'separator' ? this.renderLine(item, index) : this.renderItem(item, index)))}</div>
      </div>
    )
  }
}

ContentMenu.propTypes = {
  list: PropTypes.array,
  left: PropTypes.number,
  top: PropTypes.number,
}

ContentMenu.defaultProps = {
  list: [],
  left: 0,
  top: 0,
}

export default ContentMenu

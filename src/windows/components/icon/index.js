import React from 'react'
import PropTypes from 'prop-types'

import classnames from 'classnames'

import './index.scss'

const Icon = (props) => {
  const { icon, color, size } = props

  const iconStyle = {
    color,
    fontSize: Number(size) ? `${size}px` : size,
  }

  return (
    <span className="component-icon">
      <i className={classnames('iconfont', `icon-${icon}`)} style={iconStyle} />
    </span>
  )
}

Icon.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Icon.defaultProps = {
  icon: '',
  color: '',
  size: '14px',
}

export default Icon

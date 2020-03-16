import React from 'react'
import PropTypes from 'prop-types'

import './styles/index.scss'

const Progress = (props) => {
  const { progress } = props

  const mainStyle = {
    width: `${progress}%`,
  }

  return (
    <div className="component-progress">
      <div className="main" style={mainStyle} />
    </div>
  )
}

Progress.propTypes = {
  progress: PropTypes.number,
}

Progress.defaultProps = {
  progress: 0,
}

export default Progress

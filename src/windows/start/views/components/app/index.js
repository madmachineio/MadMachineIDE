import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import './index.scss'

import MainStart from '@start/components/main'
import NewProject from '@start/components/new'

@inject(({ configStore }) => ({
  configStore,
}))
@observer
class App extends Component {
  render() {
    const {
      configStore: { isCreate },
    } = this.props

    return (
      <div className="layout-start">
        <div>{isCreate ? <NewProject /> : <MainStart />}</div>
        <div className="drag-wrap" />
      </div>
    )
  }
}

App.propTypes = {
  configStore: PropTypes.object,
}

App.defaultProps = {
  configStore: {},
}

export default App

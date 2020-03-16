import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import './index.scss'

import LogoMini from '@windows/assets/images/logo-mini.png'

@inject(({ userStore }) => ({
  userStore,
}))
@observer
class App extends Component {
  nameChangeHandle({ target: { value } }) {
    const { userStore } = this.props
    userStore.setUserName(value)
  }

  mailChangeHandle({ target: { value } }) {
    const { userStore } = this.props
    userStore.setUserEmail(value)
  }

  closeHandle() {
    const { userStore } = this.props
    userStore.closeWindow()
  }

  saveHandle() {
    const { userStore } = this.props
    userStore.saveUserInfo()
  }

  render() {
    const {
      userStore: { userName, userEmail },
    } = this.props

    const isValide = userName && /^([.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(userEmail)

    return (
      <div className="layout-user">
        <div className="layout-top" />

        <div className="layout-content">
          <div className="header">
            <img className="logo" src={LogoMini} alt="logo" />
            <div className="info">
              <div className="info-title">Subscribe to email updates</div>
              <div className="info-msg">Keep up to date with important workplace issues by signing up to our service.</div>
            </div>
          </div>

          <div className="ipt-group">
            <div className="block">
              <div className="label">Name</div>
              <div className="ipt">
                <input type="text" value={userName} onChange={this.nameChangeHandle.bind(this)} />
              </div>
            </div>

            <div className="block">
              <div className="label">Email</div>
              <div className="ipt">
                <input type="text" value={userEmail} onChange={this.mailChangeHandle.bind(this)} />
              </div>
            </div>
          </div>

          <div className="btns">
            <button type="button" onClick={this.closeHandle.bind(this)}>
              Cancel
            </button>
            <button type="button" className="primary" disabled={!isValide} onClick={this.saveHandle.bind(this)}>
              OK
            </button>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  userStore: PropTypes.object,
}

App.defaultProps = {
  userStore: {},
}

export default App

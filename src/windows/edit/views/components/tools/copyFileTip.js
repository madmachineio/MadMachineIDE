import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import tipImg from '@windows/assets/images/copy-tip-img.png'

import './styles/copyFile.scss'

@inject(({ usbStore }) => ({
  usbStore,
}))
@observer
class CopyFileTip extends Component {
  handleCheck({ target: { checked } }) {
    const { usbStore } = this.props
    usbStore.setShowTipFlag(checked)
  }

  handleSubmit() {
    const { usbStore } = this.props
    usbStore.setShowTip(false)
  }

  render() {
    const {
      usbStore: { isShowTip, tipTime, showTipFlag },
    } = this.props

    return (
      <div
        className={classnames({
          'copy-file': true,
          show: isShowTip,
        })}
      >
        <div className="body">
          <div className="img">
            <img src={tipImg} alt="" />
          </div>
          <div className="title">Press the Download Button</div>
          <div className="msg">After pressing the button, please wait a few seconds to complete the upload automatically.</div>
          <div className="footer">
            <div className="check">
              <label htmlFor="copyTipCheck">
                <input type="checkbox" id="copyTipCheck" checked={showTipFlag} onChange={this.handleCheck.bind(this)} />
                Hide this next time
              </label>
            </div>
            <div className="btn" onClick={this.handleSubmit.bind(this)}>
              Okay({tipTime})
            </div>
          </div>
        </div>
      </div>
    )
  }
}

CopyFileTip.propTypes = {
  usbStore: PropTypes.object,
}

CopyFileTip.defaultProps = {
  usbStore: {},
}

export default CopyFileTip

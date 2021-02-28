import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import classnames from 'classnames'
import Icon from '@windows/components/icon'

import './index.scss'

import imgThemeWhite from '@windows/assets/images/theme-white.png'
import imgThemeBlack from '@windows/assets/images/theme-black.png'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'SettingWindow')
const pv = remote.getGlobal('pv')
const enableTrack = remote.getGlobal('enableTrack')

@inject(({ settingStore }) => ({
  settingStore,
}))
@observer
class App extends Component {
  state = {
    track: enableTrack(),
  }

  componentDidMount() {
    pv('/setting', 'Setting')
  }

  setFontSize(val) {
    trackEvent('SetFontSize', 'FontSize', val)
    const { settingStore } = this.props
    settingStore.setFontSize(val)
  }

  themeChangeHandle(themeName) {
    trackEvent('SetTheme', themeName)
    const { settingStore } = this.props
    settingStore.setTheme(themeName)
  }

  enableTelemetry(e) {
    const { checked } = e.target
    if (!checked) {
      trackEvent('DisableTrack')
    }
    enableTrack(checked)
    this.setState({ track: checked })
  }

  render() {
    const {
      settingStore: { themeName },
    } = this.props
    const { track } = this.state

    return (
      <div className="layout-setting">
        <div className="row">
          <div className="label">Theme:</div>
          <div className="body theme-wrap">
            <div
              className={classnames({
                theme: true,
                actived: themeName === 'black',
              })}
              onClick={this.themeChangeHandle.bind(this, 'black')}
            >
              <img src={imgThemeBlack} alt="white theme" />
            </div>
            <div
              className={classnames({
                theme: true,
                actived: themeName === 'white',
              })}
              onClick={this.themeChangeHandle.bind(this, 'white')}
            >
              <img src={imgThemeWhite} alt="black theme" />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="label">Language:</div>
          <div className="body">
            <select>
              <option>English</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="label">Fontsize:</div>
          <div className="body">
            <span className="icon" onClick={this.setFontSize.bind(this, 1)}>
              <Icon icon="t" size="16" />
            </span>
            <span className="icon icon-right" onClick={this.setFontSize.bind(this, -1)}>
              <Icon icon="t" size="9" />
            </span>
          </div>
        </div>

        <div className="row">
          <div className="label">Telemetry:</div>
          <div className="body">
            <input type="checkbox" defaultChecked={track} onChange={this.enableTelemetry.bind(this)} />
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  settingStore: PropTypes.object,
}

App.defaultProps = {
  settingStore: {},
}

export default App

import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Icon from '@windows/components/icon'

import './index.scss'

import logoPng from '@windows/assets/images/logo.png'
import blackIcon from '@windows/assets/images/file-icon-black.png'
import whiteIcon from '@windows/assets/images/file-icon-white.png'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'StartWindow')

@inject(({ configStore }) => ({
  configStore,
}))
@observer
class Main extends Component {
  componentDidMount() {
    trackEvent('Open')
  }

  createProject() {
    trackEvent('CreateProject')
    const { configStore } = this.props
    configStore.setIsCreate(true)
  }

  openExistingProject() {
    trackEvent('OpenExistingProject')
    const { configStore } = this.props
    configStore.openExistingProject()
  }

  openHistoryProject(item) {
    trackEvent('OpenHistoryProject')
    const { configStore } = this.props
    configStore.openProject(item.projectFile)
  }

  render() {
    const {
      configStore: { historyProject },
    } = this.props

    return (
      <div className="start-main">
        <div className="base-tools">
          <div className="logo">
            <img src={logoPng} alt="logo" />
          </div>
          <div className="title-group">
            <div className="title">Welcome to MadMachine</div>
            <div className="tip">Version Beta {process.env.VERSION}</div>
          </div>
          <div className="tools">
            <div className="tools-wrap">
              <div className="tools-group" onClick={this.createProject.bind(this)}>
                <div className="icon">
                  <Icon icon="Shape" size="20" />
                </div>
                <div className="tools-title">
                  <div className="title">Create a new MadMachine project</div>
                  <div className="tip">Explore new ideas with your kit.</div>
                </div>
              </div>
              <div className="tools-group" onClick={this.openExistingProject.bind(this)}>
                <div className="icon">
                  <Icon icon="Shape2" size="20" />
                </div>
                <div className="tools-title">
                  <div className="title">Open an existing project</div>
                  <div className="tip">Start working on any project.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="recent-history">
          {historyProject && historyProject.length ? (
            historyProject.map(item => {
              const MaxNum = Math.max(20, 38 - (item.folderPath.slice(-38).match(/[^\x00-\xff]/g) || []).length * 1)
              return (
                <div className="project-item" key={item.projectFile} onClick={this.openHistoryProject.bind(this, item)}>
                  <div className="icon">
                    <img src={blackIcon} className="black" alt="icon" />
                    <img src={whiteIcon} className="white" alt="icon" />
                  </div>
                  <div className="project-info" title={item.folderPath}>
                    <div className="title ellipsis">{item.projectName}</div>
                    <div className="path">{item.folderPath.length > MaxNum ? `...${item.folderPath.slice(-MaxNum)}` : item.folderPath}</div>
                    {/* <div className="path">{'如果这里是中文目录不知道能显示下多少个文字如'.length}</div> */}
                  </div>
                </div>
              )
            })
          ) : (
              <div className="project-recent-tip">No Recent Project</div>
            )}
        </div>
      </div>
    )
  }
}

Main.propTypes = {
  configStore: PropTypes.object,
}

Main.defaultProps = {
  configStore: {},
}

export default Main

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Icon from '@windows/components/icon'

import logoPng from '@windows/assets/images/logo.png'

import './index.scss'

@inject(({ configStore }) => ({
  configStore,
}))
@observer
class New extends Component {
  constructor(props) {
    super(props)

    this.iptRef = React.createRef()
  }

  componentDidMount() {
    const { configStore } = this.props
    configStore.initDefaultPath()

    if (this.iptRef) {
      setTimeout(() => {
        this.iptRef.current.focus()
      })
    }
  }

  cancelCreate() {
    const { configStore } = this.props
    configStore.setIsCreate(false)
  }

  selectDirHandle() {
    const { configStore } = this.props
    configStore.selectPath()
  }

  iptChangeHandle({ target: { value } }) {
    const { configStore } = this.props
    configStore.setCreatePath(value.replace(' ', '_'))
  }

  nameChangeHandle({ target: { value } }) {
    const { configStore } = this.props
    const { createPath, sysType } = configStore
    const splitStr = sysType === 'win32' ? '\\' : '/'
    configStore.setCreatePath(`${createPath.slice(0, createPath.lastIndexOf(splitStr))}${splitStr}${value}`.replace(' ', '_'))
  }

  createHandle() {
    const { configStore } = this.props
    configStore.createProject()
  }

  render() {
    const {
      configStore: { createPath, sysType },
    } = this.props
    const splitStr = sysType === 'win32' ? '\\' : '/'
    const pathName = createPath.split(splitStr).slice(-1)[0]

    return (
      <div className="start-new">
        <div className="new-title">
          <div className="logo">
            <img src={logoPng} alt="madmachine" />
          </div>
          <div className="title-info">
            <div className="big-title">New Project</div>
            <div className="small-title">You are creating a new mmp project. You may want to name this project and select a directory to store its preferences and files.</div>
          </div>
        </div>
        <div className="new-location">
          <div className="block">
            <span className="label">Project name:</span>
            <div className="ipt-group">
              <input
                ref={this.iptRef}
                value={pathName}
                onChange={this.nameChangeHandle.bind(this)}
                onFocus={(event) => {
                  const ipt = event.target
                  ipt.selectionStart = 0
                  ipt.selectionEnd = ipt.value.length
                }}
              />
              <div className="border" />
            </div>
          </div>
          <div className="block">
            <span className="label">Location:</span>
            <div className="ipt-group">
              <input
                value={createPath}
                onChange={this.iptChangeHandle.bind(this)}
                onFocus={(event) => {
                  const ipt = event.target
                  ipt.selectionStart = ipt.value.lastIndexOf(splitStr) + 1
                  ipt.selectionEnd = ipt.value.length
                }}
              />
              <span onClick={this.selectDirHandle.bind(this)}>
                <Icon icon="folder" />
              </span>
              <div className="border" />
            </div>
          </div>

          <div className="tip">MadMachine will automatically generate a main.swift file.</div>
        </div>

        <div className="new-btns">
          <button type="button" onClick={this.cancelCreate.bind(this)}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={this.createHandle.bind(this)}>
            Create
          </button>
        </div>
      </div>
    )
  }
}

New.propTypes = {
  configStore: PropTypes.object,
}

New.defaultProps = {
  configStore: {},
}

export default New

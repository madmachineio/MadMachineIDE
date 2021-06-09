/* eslint-disable react/sort-comp */
/**
 * 新建项目界面
 */
import { remote, ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import Icon from '@windows/components/icon'

import logoPng from '@windows/assets/images/logo.png'

import './index.scss'

import { projectTypeOptions, boardTypeOptions } from './config'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'NewProject')
const pv = remote.getGlobal('pv')

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
    pv('/start/new_project', 'NewProject')
    const { configStore } = this.props
    configStore.initDefaultPath()

    if (this.iptRef) {
      setTimeout(() => {
        this.iptRef.current.focus()
      })
    }

    // 修改窗口高度
    ipcRenderer.send('SET_WINDOW_HEIGHT', 670)
  }

  selectDirHandle() {
    trackEvent('SelectDirectory')
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

  // 选择项目类型
  onProjectTypeChange(e) {
    // console.log(e.target.value)
    const { configStore } = this.props
    configStore.setProjectType(e.target.value)
  }

  // 选择电路板类型
  onBoardTypeChange(e) {
    // console.log(e.target)
    const { configStore } = this.props
    configStore.setBoardType(e.target.value)
  }

  cancelCreate() {
    // 还原高度
    ipcRenderer.send('SET_WINDOW_HEIGHT', 470)

    trackEvent('CancelCreate')
    const { configStore } = this.props
    configStore.setIsCreate(false)
  }

  // 新建项目
  createHandle() {
    trackEvent('CreateProject')
    const { configStore } = this.props
    configStore.createProject()
  }

  render() {
    const {
      configStore: {
        // 项目路径
        createPath,
        sysType,
        boardType,
        projectType,
      },
    } = this.props
    const splitStr = sysType === 'win32' ? '\\' : '/'

    // 项目名称 = 从项目路径中切分，并取倒数第一个元素
    const pathName = createPath.split(splitStr).slice(-1)[0]

    console.log(`boardType = ${boardType} projectType = ${projectType}`)

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
          {/* 项目名称 */}
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
          {/* 项目路径 */}
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
          {/* 项目类型 */}
          <div className="block">
            <span className="label">Project Type</span>
            <div className="ipt-group">
              <select
                defaultValue={projectType}
                // value={projectType}
                onChange={this.onProjectTypeChange.bind(this)}
              >
                {projectTypeOptions.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >{item.name}
                  </option>
                  ))
                }
              </select>
            </div>
          </div>
          {/* 电路板类型 */}
          <div className="block">
            <span className="label">Board Type</span>
            <div className="ipt-group">
              <select
                defaultValue={boardType}
                // value={boardType}
                onChange={this.onBoardTypeChange.bind(this)}
              >
                {boardTypeOptions.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >{item.name}
                  </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="tip">MadMachine will automatically generate a main.swift file.</div>
        </div>

        <div className="new-btns">
          {/* 取消按钮 */}
          <button type="button" onClick={this.cancelCreate.bind(this)}>
            Cancel
          </button>
          {/* 新建按钮 */}
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

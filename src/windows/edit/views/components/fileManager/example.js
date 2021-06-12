import { remote } from 'electron'
import { basename } from 'path'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'

import { Scrollbars } from 'react-custom-scrollbars'
import Icon from '@windows/components/icon'

import './styles/example.scss'

const trackEvent = remote.getGlobal('trackEvent').bind(null, 'EditWindow')

@inject(({ exampleStore }) => ({
  exampleStore,
}))
@observer
class Example extends Component {
  state = {
    unfoldMap: {},
    activeProject: {},
  }

  unfoldHandle(path) {
    const project = basename(path)
    trackEvent('ExpandExampleGroup', 'Project', project)
    this.setState(pState => ({
      unfoldMap: {
        ...pState.unfoldMap,
        [path]: !pState.unfoldMap[path],
      },
    }))
  }

  openExample(item) {
    trackEvent('OpenExample', 'Project', item.name)
    const { exampleStore } = this.props
    exampleStore.openExample(item)
  }

  activeHandle(item) {
    trackEvent('ClickExample', 'Project', item.name)
    this.setState({
      activeProject: item,
    })
  }

  renderGroup(data) {
    const { unfoldMap } = this.state

    return data.map(item => (
      <div
        className={`example-group ${unfoldMap[item.path] ? 'actived' : ''}`}
        key={item.path}
      >
        <div className="example-item" onClick={this.unfoldHandle.bind(this, item.path)}>
          <div className="arrow">
            <Icon icon="arrow-left" size="12" />
          </div>
          <div className="folder">
            <Icon icon={unfoldMap[item.path] ? 'folder' : 'gh_cdcf_'} size="12" />
          </div>
          <span className="name">{item.name}</span>
        </div>

        <div className="example-children">{this.renderProject(item)}</div>
      </div>
    ))
  }

  renderProject(data) {
    const { activeProject } = this.state
    return data.children.map(item => (
      <div
        className={`example-item child-item ${item.path === activeProject.path ? 'actived' : ''}`}
        key={item.path}
        onClick={this.activeHandle.bind(this, item)}
        onDoubleClick={this.openExample.bind(this, item)}
      >
        <div className="folder">
          <Icon icon="appstore" size="14" />
        </div>
        <span className="name">{item.name}</span>
      </div>
    ))
  }

  render() {
    const {
      exampleStore: { exampleList },
    } = this.props

    return (
      <div className="file-example">
        <Scrollbars autoHide renderThumbHorizontal={() => <div className="h-scrollbar" />} renderThumbVertical={() => <div className="v-scrollbar" />}>
          {exampleList.map((item, index) => (
              <div className="type-list" key={String(index)}>
                <div className="type-name">{item.type}</div>
                {this.renderGroup(item.list)}
              </div>
          ))}

        </Scrollbars>
      </div>
    )
  }
}

Example.propTypes = {
  exampleStore: PropTypes.object,
}

Example.defaultProps = {
  exampleStore: {},
}

export default Example

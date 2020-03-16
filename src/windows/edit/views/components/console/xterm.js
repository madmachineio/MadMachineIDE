import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Terminal } from 'xterm'

import { FitAddon } from 'xterm-addon-fit'
// const fullscreen = require('xterm/dist/addons/fullscreen/fullscreen')
import { SearchAddon } from 'xterm-addon-search'

import 'xterm/css/xterm.css'
import './styles/xterm.scss'
// const debounce = require('lodash.debounce');
// import styles from 'xterm/xterm.css';
const { ipcRenderer } = require('electron')

const className = require('classnames')

class XTerm extends Component {
  constructor(props, context) {
    super(props, context)

    this.xterm = null
    this.container = null

    this.fitAddon = null
    this.searchAddon = null

    this.state = {
      isFocused: false,
    }
  }

  componentDidMount() {
    const {
      options, onContextMenu, onInput, value,
    } = this.props
    this.xterm = new Terminal({
      ...options,
      cursorStyle: 'bar',
      windowsMode: true,
      theme: {
        background: '#252531',
        cursor: '#252531',
      },
    })

    console.log(this.xterm)
    this.fitAddon = new FitAddon()
    this.xterm.loadAddon(this.fitAddon)

    this.searchAddon = new SearchAddon()
    this.xterm.loadAddon(this.searchAddon)

    this.xterm.open(this.container)
    // this.xterm.on('focus', this.focusChanged.bind(this, true))
    // this.xterm.on('blur', this.focusChanged.bind(this, false))

    if (onContextMenu) {
      this.xterm.element.addEventListener('contextmenu', this.onContextMenu.bind(this))
    }

    if (onInput) {
      this.xterm.onData(this.onInput)
    }

    if (value) {
      this.xterm.write(value)
    }

    setTimeout(() => {
      this.fitAddon.fit()
    }, 1000)

    this.initTheme()
  }

  // componentWillReceiveProps(nextProps) {
  //     if (nextProps.hasOwnProperty('value')) {
  //         this.setState({ value: nextProps.value });
  //     }
  // }

  shouldComponentUpdate(nextProps) {
    // console.log('shouldComponentUpdate', nextProps.hasOwnProperty('value'), nextProps.value != this.props.value);
    const { value } = this.props
    if (nextProps.value && nextProps.value !== value) {
      if (this.xterm) {
        console.log('======================================== clear')
        this.xterm.clear()
        setTimeout(() => {
          this.xterm.write(nextProps.value)
        }, 0)
      }
    }
    return false
  }

  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.xterm) {
      this.xterm.destroy()
      this.xterm = null
    }
  }

  getTerminal() {
    return this.xterm
  }

  // eslint-disable-next-line react/sort-comp
  applyAddon(addon) {
    Terminal.applyAddon(addon)
  }

  write(data) {
    if (this.xterm) {
      this.xterm.write(data)
    }
  }

  writeln(data) {
    if (this.xterm) {
      this.xterm.writeln(data)
    }
  }

  writeUtf8(data) {
    if (this.xterm) {
      this.xterm.writeUtf8(data)
    }
  }

  focus() {
    if (this.xterm) {
      this.xterm.focus()
    }
  }

  focusChanged(focused) {
    this.setState({
      isFocused: focused,
    })

    const { onFocusChange } = this.props
    if (onFocusChange) {
      onFocusChange(focused)
    }
  }

  onInput = (data) => {
    const { onInput } = this.props
    if (onInput) {
      onInput(data)
    }
  }

  initTheme() {
    ipcRenderer.on('SET-WEB-THEME', (event, themeName) => {
      if (this.xterm) {
        this.xterm.setOption('theme', {
          background: themeName === 'white' ? '#fff' : '#252531',
          foreground: themeName === 'white' ? '#030303' : '#fff',
        })
      }
    })
  }

  resize(cols, rows) {
    if (this.xterm) {
      this.xterm.resize(Math.round(cols), Math.round(rows))
    }
  }

  setOption(key, value) {
    if (this.xterm) {
      this.xterm.setOption(key, value)
    }
  }

  refresh() {
    if (this.xterm) {
      this.xterm.refresh(0, this.xterm.rows - 1)
    }
  }

  // eslint-disable-next-line react/sort-comp
  onContextMenu(e) {
    const { onContextMenu } = this.props
    if (onContextMenu) {
      onContextMenu(e)
    }
  }

  render() {
    const { isFocused } = this.state
    const { customClass, height } = this.props

    const terminalClassName = className('ReactXTerm', isFocused ? 'ReactXTerm--focused' : null, customClass)

    // eslint-disable-next-line no-return-assign
    return <div style={{ height }} ref={ref => (this.container = ref)} className={terminalClassName} />
  }
}

XTerm.propTypes = {
  // onChange: PropTypes.func,
  onInput: PropTypes.func,
  onFocusChange: PropTypes.func,
  // onScroll: PropTypes.func,
  onContextMenu: PropTypes.func,
  options: PropTypes.any,
  // path: PropTypes.string,
  value: PropTypes.string,
  customClass: PropTypes.string,
  height: PropTypes.string,
}

XTerm.defaultProps = {
  // onChange: () => {},
  onInput: () => { },
  onFocusChange: () => { },
  // onScroll: () => {},
  onContextMenu: () => { },
  options: {},
  // path: '',
  value: '',
  customClass: '',
  height: '',
}

export default XTerm

// export { Terminal, XTerm }

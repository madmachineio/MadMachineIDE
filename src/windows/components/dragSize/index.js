import React, { Component } from 'react'
import PropTypes from 'prop-types'

import emitter from '@/utils/emitter'

import './index.scss'

class DragEvent {
  constructor(dom, moveFunc) {
    this.dom = dom
    this.moveFunc = moveFunc

    this.isDown = false
    this.lastPos = {
      clientX: 0,
      clientY: 0,
    }

    this.bindEvent()
  }

  bindEvent() {
    this.dom.addEventListener('mousedown', this.mouseDown)
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  destory() {
    this.dom.removeEventListener('mousedown', this.mouseDown)
    document.removeEventListener('mousemove', this.mouseMove)
    document.removeEventListener('mouseup', this.mouseUp)
  }

  mouseDown = (event) => {
    this.isDown = true

    const { clientX, clientY } = event
    this.lastPos = {
      clientX,
      clientY,
    }
  }

  mouseMove = (event) => {
    if (this.isDown) {
      const { clientX, clientY } = event
      const moveData = {
        x: clientX - this.lastPos.clientX,
        y: clientY - this.lastPos.clientY,
      }

      if (this.moveFunc) {
        this.moveFunc(moveData)
      }

      emitter.emit('DRAG_RESIZE')

      this.lastPos = {
        clientX,
        clientY,
      }
    }
  }

  mouseUp = () => {
    document.body.style.cursor = 'default'
    this.isDown = false
  }
}

const fixPxVal = (val, baseVal) => (Number(val) ? Number(val) : (val.replace('%', '') / 100) * baseVal)

class DragSize extends Component {
  state = {
    width: 0,
    height: 0,
  }

  constructor(props) {
    super(props)

    this.bodyRef = React.createRef()
    this.horizontalRef = React.createRef()
    this.verticalRef = React.createRef()

    this.horizontalDrag = null
    this.verticalDrag = null

    this.clientWidth = 0
    this.clientHeight = 0

    this.sizeRange = {
      maxWidth: 0,
      minWidth: 0,
      maxHeight: 0,
      minHeight: 0,
    }
  }

  componentDidMount() {
    this.initSize()

    const { horizontalDrag, verticalDrag } = this.props
    if (horizontalDrag) {
      this.horizontalDrag = new DragEvent(this.horizontalRef.current, this.horizontalHandle.bind(this))
    }
    if (verticalDrag) {
      this.verticalDrag = new DragEvent(this.verticalRef.current, this.verticalHandle.bind(this))
    }
  }

  componentWillReceiveProps(nextProps) {
    const { height, width } = this.props
    const { height: nextHeight, width: nextWidth } = nextProps
    const { clientWidth, clientHeight } = this.bodyRef.current.parentElement

    if (height !== nextHeight) {
      this.clientHeight = fixPxVal(nextHeight, clientHeight)
      this.setState({
        height: nextHeight,
      })
    }

    if (width !== nextWidth) {
      this.clientWidth = fixPxVal(nextWidth, clientWidth)
      this.setState({
        width: nextWidth,
      })
    }
  }

  componentWillUnmount() {
    if (this.horizontalDrag) {
      this.horizontalDrag.destory()
    }

    if (this.verticalDrag) {
      this.verticalDrag.destory()
    }
  }

  initSize() {
    const { clientWidth, clientHeight } = this.bodyRef.current.parentElement
    const {
      maxHeight, minHeight, maxWidth, minWidth, width, height,
    } = this.props

    this.sizeRange = {
      maxWidth: fixPxVal(maxWidth, clientWidth),
      minWidth: fixPxVal(minWidth, clientWidth),
      maxHeight: fixPxVal(maxHeight, clientHeight),
      minHeight: fixPxVal(minHeight, clientHeight),
    }

    this.clientWidth = fixPxVal(width, clientWidth)
    this.clientHeight = fixPxVal(height, clientHeight)
    this.setState({
      width: this.clientWidth,
      height: this.clientHeight,
    })
  }

  horizontalHandle({ y }) {
    document.body.style.cursor = 'row-resize'

    const { maxHeight, minHeight } = this.sizeRange
    this.clientHeight = Math.max(minHeight, Math.min(maxHeight, this.clientHeight - y))
    this.setState({
      height: this.clientHeight,
    })

    const { onHorizonDrag } = this.props
    onHorizonDrag(this.clientHeight)
  }

  verticalHandle({ x }) {
    document.body.style.cursor = 'col-resize'

    const { maxWidth, minWidth } = this.sizeRange
    this.clientWidth = Math.max(minWidth, Math.min(maxWidth, this.clientWidth + x))
    this.setState({
      width: this.clientWidth,
    })

    const { onVerticalDrag } = this.props
    onVerticalDrag(this.clientWidth)
  }

  render() {
    const {
      children, show, horizontalDrag, verticalDrag,
    } = this.props
    const { width, height } = this.state

    const bodyStyle = {
      width: /.+%$/g.test(width) ? width : `${width}px`,
      height: /.+%$/g.test(height) ? height : `${height}px`,
    }

    if (document.body.style.cursor === 'default') {
      bodyStyle.transition = 'all 0.3s ease-in-out'
    }
    if (verticalDrag) {
      bodyStyle.width = show ? bodyStyle.width : 0
    }
    if (horizontalDrag) {
      bodyStyle.height = show ? bodyStyle.height : 0
    }

    return (
      <div className="component-drag-size" ref={this.bodyRef} style={bodyStyle}>
        <div className="horizontal-block" ref={this.horizontalRef} />
        <div className="vertical-block" ref={this.verticalRef} />
        {children}
      </div>
    )
  }
}

DragSize.propTypes = {
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  horizontalDrag: PropTypes.bool,
  verticalDrag: PropTypes.bool,
  children: PropTypes.element,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  show: PropTypes.bool,
  onHorizonDrag: PropTypes.func,
  onVerticalDrag: PropTypes.func,
}

DragSize.defaultProps = {
  maxHeight: '100%',
  maxWidth: '100%',
  minHeight: 10,
  minWidth: 10,
  height: '100%',
  width: '100%',
  horizontalDrag: false,
  verticalDrag: false,
  children: null,
  show: true,
  onHorizonDrag: () => {},
  onVerticalDrag: () => {},
}

export default DragSize

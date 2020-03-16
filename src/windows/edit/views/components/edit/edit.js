import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import CodeMirror from 'codemirror'
import classnames from 'classnames'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/blackboard.css'
import './styles/theme/3024-day.css'
import './styles/theme/3024-night.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import './styles/edit.scss'

import 'codemirror/mode/swift/swift'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/keymap/sublime'
import 'codemirror/addon/edit/trailingspace'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/search'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/scroll/simplescrollbars'

import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/comment/comment'

import formatRegiste from './libs/formatting'

import emitter from '@/utils/emitter'

formatRegiste(CodeMirror)

@inject(({ fileStore, configStore }) => ({
  fileStore,
  configStore,
}))
@observer
class EditBody extends Component {
  constructor(props) {
    super(props)

    this.editAreaRef = React.createRef()
    this.editor = null
  }

  componentDidMount() {
    setTimeout(() => {
      this.initEditor()

      this.setActivityEditor()
    })

    this.undoHandle = () => {
      this.undoEditHandle()
    }
    this.redoHandle = () => {
      this.redoEditHandle()
    }
    emitter.on('FILE_EDIT_UNDO', this.undoHandle)
    emitter.on('FILE_EDIT_REDO', this.redoHandle)
  }

  componentWillUnmount() {
    emitter.off('FILE_EDIT_UNDO', this.undoHandle)
    emitter.off('FILE_EDIT_REDO', this.redoHandle)
  }

  setActivityEditor() {
    const { fileStore, file } = this.props
    const { activeFile = { path: '' } } = fileStore

    if (file.path === activeFile.path) {
      fileStore.setActiveEditor(this.editor)
    }
  }

  componentWillReact() {
    setTimeout(() => {
      this.initEditor()
      this.setActivityEditor()

      if (this.editor) {
        const {
          configStore: { themeName },
        } = this.props
        this.editor.setOption('theme', themeName === 'black' ? '3024-night' : '3024-day')
      }
    })
  }

  undoEditHandle() {
    const { fileStore, file } = this.props
    const { activeFile = { path: '' } } = fileStore
    if (file.path === activeFile.path && this.editor) {
      this.editor.undo()
    }
  }

  redoEditHandle() {
    const { fileStore, file } = this.props
    const { activeFile = { path: '' } } = fileStore
    if (file.path === activeFile.path && this.editor) {
      this.editor.redo()
    }
  }

  initEditor() {
    const { fileStore, configStore, file } = this.props
    const { activeFile = { path: '' } } = fileStore
    if (file.path !== activeFile.path || this.editor) {
      return
    }

    const mac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault
    const cmdKey = mac ? 'Cmd' : 'Ctrl'

    this.editor = CodeMirror.fromTextArea(this.editAreaRef.current, {
      lineNumbers: true,
      mode: { name: 'swift' },
      theme: configStore.themeName === 'black' ? '3024-night' : '3024-day',
      matchBrackets: true,
      smartIndent: true,
      showCursorWhenSelecting: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      scrollbarStyle: 'simple',
      showTrailingSpace: true,
      styleActiveLine: true,
      lineWrapping: true, // 代码折叠
      foldGutter: true,
      indentUnit: 4,
      indentWithTabs: false,
      extraKeys: {
        [`${cmdKey}-S`]: () => {
          fileStore.saveFile({
            ...file,
            fileData: this.editor.getValue(),
          })
        },
      },
    })

    this.editor.setSize('100%', '100%')

    this.editor.on('change', () => {
      fileStore.editFile(file)
      fileStore.editFileContent(file.path, this.editor.getValue())
    })
  }

  render() {
    const {
      fileStore: { activeFile = { path: '' }, editFontSize },
      configStore: { themeName },
      file,
    } = this.props

    return (
      <div
        className={classnames(['layout-edit-body', activeFile.path === file.path ? 'show' : 'hidden'])}
        style={{ fontSize: editFontSize, lineHeight: `${editFontSize * 1.5}px` }}
        data-theme={themeName}
      >
        <textarea ref={this.editAreaRef} className="content" defaultValue={file.fileData} />
      </div>
    )
  }
}

EditBody.propTypes = {
  fileStore: PropTypes.object,
  configStore: PropTypes.object,
  file: PropTypes.object,
}

EditBody.defaultProps = {
  fileStore: {},
  configStore: {},
  file: {},
}

export default EditBody

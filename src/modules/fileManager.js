import fs from 'fs'
import os from 'os'
import childProcess from 'child_process'
import { dialog } from 'electron'
import path from 'path'
import { fromatPath, mkdirsSync } from '../utils/path'
import { getConfig, setConfig } from '../config'
import { runAplpaSDK } from '../public/build/main'

const sortFiles = (data) => {
  const newData = data
  const { children } = newData
  if (children) {
    newData.children = sortFiles(children)
  }
  // return newData.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  // .sort((a, b) => b.ctimeMs - a.ctimeMs)
  const folderList = newData.filter(m => m.isDirectory).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  const fileList = newData.filter(m => !m.isDirectory).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return folderList.concat(fileList)
}

const deleteFile = (filePath) => {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach((file) => {
      const pathTmp = path.resolve(filePath, file)
      if (fs.statSync(pathTmp).isDirectory()) {
        deleteFile(pathTmp)
      } else {
        fs.unlinkSync(pathTmp)
      }
    })
    fs.rmdirSync(filePath)
  } else {
    fs.unlinkSync(filePath)
  }
}

const getPathParent = pathTmp => pathTmp
  .split(global.PATH_SPLIT)
  .slice(0, -1)
  .join(global.PATH_SPLIT)

const formatFileName = (pathTmp, index = 0) => {
  let realPath = pathTmp
  if (index > 0) {
    const reg = new RegExp(`(.+${global.PATH_SPLIT_REG})(\\S+)$`, 'g')
    const dirPath = pathTmp.replace(reg, '$1')
    const lastPath = pathTmp.replace(reg, '$2')
    const fileName = lastPath.split('.')[0]
    const fileExt = lastPath.split('.')[1]
    const ext = fileExt ? `.${fileExt}` : ''

    realPath = path.resolve(dirPath, `${fileName}-${index}${ext}`)
  }

  if (fs.existsSync(realPath)) {
    return formatFileName(pathTmp, index + 1)
  }

  return realPath
}

class FileManager {
  constructor(eventEmitter, editWindow) {
    this.eventEmitter = eventEmitter
    this.editWindow = editWindow

    // 文件管理
    this.folderPath = null
    this.folderData = []
    this.isNewStatus = false
    this.projectName = ''
    this.projectFile = '' // 项目路径
    this.pathData = null // 路径信息

    // 编辑的文件
    this.openFiles = []

    this.wacherFolder = null

    this.syncTimeId = 0
  }

  historyProject() {
    let historyList = getConfig('PROJECT.HISTORY') || []
    historyList = historyList.filter(m => m.projectFile !== this.projectFile)
    historyList.push({
      projectName: this.projectName,
      folderPath: this.folderPath,
      projectFile: this.projectFile,
    })

    setConfig('PROJECT.HISTORY', historyList)
  }

  /**
   * 编辑文件处理
   */
  // 打开文件
  openFile(files) {
    const paramFiles = Array.isArray(files) ? files : [files]

    const realFiles = paramFiles.filter((file) => {
      const isExist = fs.existsSync(file)
      if (!isExist) {
        throw new Error(`File not found: ${file}`)
      }

      const isHas = this.openFiles.findIndex(om => om.path === file) < 0
      return isExist && isHas
    })

    this.setOpenFiles(realFiles)
  }

  setOpenFiles(files) {
    const filesData = files.map(file => ({
      path: file,
      name: file.split(global.PATH_SPLIT).slice(-1)[0],
      fileData: fs.readFileSync(file, { encoding: 'utf-8' }),
    }))
    this.openFiles = this.openFiles.concat(filesData)

    this.eventEmitter.emit('OPEN_FILES', this.openFiles)
  }

  // 关闭打开文件
  removeOpenFile(files) {
    const paramFiles = Array.isArray(files) ? files : [files]
    this.openFiles = this.openFiles.filter(file => !paramFiles.includes(file.path))

    this.eventEmitter.emit('OPEN_FILES', this.openFiles)
  }

  // 读取文件内容
  readFileData(filePath) {
    const isExist = fs.existsSync(filePath)
    if (!isExist) {
      throw new Error(`File not found: ${filePath}`)
    }

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err)
          return err
        }

        resolve(data)
        return data
      })
    })
  }

  saveFile(pathTmp, content) {
    fs.writeFileSync(pathTmp, content, 'utf-8')
  }

  // 刷新文件夹
  refreshPathFiles(pathTmp) {
    console.log(pathTmp)
    this.readFolderSave(this.pathData.parentPath)
  }

  /**
   * 打开项目文件
   */
  async openProjectFile(filePath) {
    // 记录项目路径
    this.projectFile = filePath

    // 解析路径数据
    this.pathData = fromatPath(filePath)

    // 通过SDK获取项目名称
    try {
      const { result, msg, data } = await runAplpaSDK(this.pathData.parentPath, 'getName')
      if (result && data) {
        this.projectName = data[0] || this.pathData.fileName
      } else {
        // 提示错误
        dialog.showMessageBox({
          type: 'info',
          title: 'Info',
          message: `Fail to get project name by SDK: ${msg}`,
        })

        // 使用解析结果中的项目名
        this.projectName = this.pathData.fileName
      }
    } catch (error) {
      console.log(error)
    }

    // 打开文件夹
    this.openFolder(this.pathData.parentPath)

    this.eventEmitter.emit('OPEN_PROJECT_NAME', this.projectName)

    if (!this.editWindow.isExample) {
      this.historyProject()
    }
  }

  createProjectFile(filePath) {
    const projectName = fromatPath(filePath).fileFullName
    const fpath = path.resolve(filePath, `${projectName}.mmp`)
    fs.writeFileSync(fpath, '')

    // 添加Source文件夹，存放代码
    console.log('2添加Source文件夹，存放代码')
    mkdirsSync(path.resolve(filePath, `Sources/${projectName}`))

    return fpath
  }

  /**
   * 文件和文件夹管理
   */
  // 打开文件夹
  openFolder(pathTmp) {
    clearTimeout(this.syncTimeId)

    console.log(`打开文件夹 ${pathTmp}`)

    if (!fs.existsSync(pathTmp)) {
      throw new Error('path no found')
    }

    const stat = fs.statSync(pathTmp)
    if (!stat || !stat.isDirectory()) {
      throw new Error('The path is not a folder')
    }

    this.folderPath = pathTmp

    // const key = pathTmp.split(global.PATH_SPLIT).slice(-1)
    // const [name] = key

    const sourcePath = path.resolve(pathTmp, 'Sources', this.projectName) // `${pathTmp}/Sources/${name}`
    // mkdirsSync(sourcePath)

    this.folderData = {
      name: this.projectName,
      key: sourcePath.split(global.PATH_SPLIT).slice(-1),
      projectPath: pathTmp,
      path: sourcePath,
      isDirectory: true,
      children: [
        {
          fixed: true,
          name: 'Package.mmp',
          key: sourcePath.split(global.PATH_SPLIT).slice(-1).concat('Package.mmp'),
          path: this.projectFile,
          isDirectory: false,
          children: [],
        },
      ],
    }

    // this.projectName = name

    // 显示除.build外的所有目录
    const outputDir = path.resolve(pathTmp, '.build')
    this.readFolderSave(pathTmp, (filePath) => !filePath.startsWith(outputDir))

    this.openFiles = []
    this.eventEmitter.emit('OPEN_FILES', this.openFiles)

    this.syncFolderData()
  }

  walkThroughFolder(folder, pathSegments = [], filter = () => true) {
    const children = fs
      .readdirSync(folder)
      .filter(file => {
        const filePath = path.resolve(folder, file)
        return file !== '.DS_Store' && filter(filePath)
      })
      .map((file) => {
        const filePath = path.resolve(folder, file)
        const cKey = pathSegments.concat(file)
        const stat = fs.statSync(filePath)
        const fileData = {
          name: file,
          key: cKey,
          path: filePath,
          ctimeMs: stat.ctimeMs,
          isDirectory: false,
          children: [],
        }
        if (stat && stat.isDirectory()) {
          fileData.isDirectory = true
          fileData.children = this.walkThroughFolder(filePath, cKey)
        }
        return fileData
      })

    return children
  }

  // 读取该路径下所有文件
  readFolderSave(pathTmp, filter = () => true) {
    console.log(`读取该路径下所有文件 ${pathTmp}`)
    // const folderData = this.folderData
    if (this.folderData) {
      const children = this.walkThroughFolder(pathTmp, [path.basename(pathTmp)], filter)
        .filter(file => path.extname(file.path) !== '.mmp')

      this.folderData.children = this.folderData.children
        .filter(m => m.fixed)
        .concat(sortFiles(children))
    }

    this.eventEmitter.emit('OPEN_FOLDERS', this.folderData)
  }

  findFolderByPath(data, pathTmp) {
    let result = null

    if (data.path === pathTmp) {
      result = data
    } else if (!result && data.children) {
      data.children.forEach((child) => {
        const childResult = this.findFolderByPath(child, pathTmp)
        if (childResult) {
          result = childResult
        }
      })
    }

    return result
  }

  // 新建文件
  createFolderFile(pathTmp) {
    console.log(`file manager 新建文件 ${pathTmp}`)
    if (this.editWindow.isExample) {
      return
    }

    // console.log(pathTmp)
    // console.log(JSON.stringify(this.folderData))
    const folderData = this.findFolderByPath(this.folderData, pathTmp) || this.folderData
    // console.log(JSON.stringify(folderData))

    if (folderData && folderData.children) {
      // 获取文件夹下第一个文件的索引，若无则为0
      const firstFileIndex = Math.max(0,
        folderData.children.findIndex(m => m.isDirectory === false))

      // 在第一个文件后加入新文件
      folderData.children.splice(firstFileIndex, 0, {
        name: formatFileName(path.resolve(folderData.path, 'Untitled.swift'))
          .split(global.PATH_SPLIT)
          .splice(-1),
        key: folderData.key.concat('--newFile--'),
        path: path.resolve(folderData.path, '--newFile--'), // `${folderData.path}/--newFile--`,
        type: 'newFile',
        isDirectory: false,
        children: [],
      })
      this.isNewStatus = true
      this.eventEmitter.emit('OPEN_FOLDERS', this.folderData)
    } else {
      console.log('取消')
    }
  }

  // 新建文件夹
  createFolderFolder(pathTmp) {
    if (this.editWindow.isExample) {
      return
    }

    const folderData = this.findFolderByPath(this.folderData, pathTmp)
    if (folderData && folderData.children) {
      folderData.children.splice(0, 0, {
        name: '',
        key: folderData.key.concat('--newFolder--'),
        path: path.resolve(folderData.path, '--newFolder--'), // `${folderData.path}/--newFolder--`,
        type: 'newFolder',
        isDirectory: true,
        children: [],
      })
      this.isNewStatus = true
      this.eventEmitter.emit('OPEN_FOLDERS', this.folderData)
    }
  }

  // 真实创建文件
  realCreateFile(pathTmp, name) {
    console.log(`真实创建文件 ${pathTmp} ${name}`)
    this.isNewStatus = false
    const filePath = formatFileName(path.resolve(pathTmp, name)) // `${pathTmp}/${name}`)

    // name不为空且路径不存在 => 写入文件
    if (name && !fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '')
    }
    this.readFolderSave(this.pathData.parentPath)
  }

  // 真实创建文件夹
  realCreateFolder(pathTmp, name) {
    this.isNewStatus = false
    const filePath = path.resolve(pathTmp, name) // `${pathTmp}/${name}`
    if (name && !fs.existsSync(filePath)) {
      fs.mkdirSync(filePath)
    }
    this.readFolderSave(this.pathData.parentPath)
  }

  // 系统文件管理中显示当前目录或文件
  showInExplorer(pathTmp) {
    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`explorer.exe "${pathTmp}"`)
        break
      case 'darwin':
        childProcess.execSync(`open "${pathTmp}"`)
        break
      case 'linux':
        childProcess.execSync(`nautilus "${pathTmp}"`)
        break
      default:
    }
  }

  // 重命名
  rename(pathTmp) {
    if (this.editWindow.isExample) {
      return
    }

    const data = this.findFolderByPath(this.folderData, pathTmp)
    if (data) {
      data.type = 'rename'
      this.eventEmitter.emit('OPEN_FOLDERS', this.folderData)
    }
  }

  // 真实重命名
  realRename(pathTmp, newName) {
    if (this.editWindow.isExample) {
      return
    }

    this.readFolderSave(this.pathData.parentPath)

    const parentPath = getPathParent(pathTmp)
    fs.renameSync(pathTmp, path.resolve(parentPath, newName))
    // this.readFolderSave(parentPath)
    this.readFolderSave(this.pathData.parentPath)
  }

  // 删除文件或者文件夹
  delFile(pathTmp) {
    if (this.editWindow.isExample) {
      return
    }

    dialog.showMessageBox(
      {
        type: 'warning',
        title: 'Delete file',
        message: 'Are you sure you want to delete the file?',
        detail: 'The file will be removed from disk.',
        buttons: ['Delete', 'Cancel'],
        cancelId: 1,
        defaultId: 0,
      },
      (response) => {
        if (response === 0) {
          deleteFile(pathTmp)

          // const parentPath = getPathParent(pathTmp)
          // this.readFolderSave(parentPath)
          this.readFolderSave(this.pathData.parentPath)
        }
      },
    )
  }

  // 粘贴文件夹
  parseFile(data) {
    if (this.editWindow.isExample) {
      return
    }

    let { targetPath } = data
    targetPath = formatFileName(path.resolve(targetPath, data.path.split(global.PATH_SPLIT).slice(-1)[0]))

    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${data.path}" "${targetPath}" /e /y /q`)
        break
      case 'darwin':
        childProcess.execSync(`cp -R "${data.path}" "${targetPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -R "${data.path}" "${targetPath}"`)
        break
      default:
        break
    }

    if (data.type === 'cut') {
      deleteFile(data.path)
      this.readFolderSave(getPathParent(data.path))
    }

    this.readFolderSave(data.targetPath)
  }

  // 递归读取所有文件和文件夹
  readAllFolderData(pathTmp) {
    console.log('递归读取所有文件和文件夹')
    const readChildren = (dir, key) => {
      if (!fs.existsSync(dir)) {
        return []
      }

      return fs.readdirSync(dir).map((file) => {
        const filePath = path.resolve(dir, file) // `${dir}/${file}`
        const cKey = key.concat(file)
        const stat = fs.statSync(filePath)
        const fileData = {
          name: file,
          key: cKey,
          path: filePath,
          isDirectory: false,
          children: [],
        }
        if (stat && stat.isDirectory()) {
          fileData.isDirectory = true
          fileData.children = readChildren(filePath, cKey)
        }
        return fileData
      })
    }

    const sortChildren = (data) => {
      const newData = data
      const { children } = newData
      if (children) {
        newData.children = sortChildren(children)
      }
      return newData.sort(a => !a.isDirectory)
    }

    const key = pathTmp.split(global.PATH_SPLIT).slice(-1)
    const children = sortChildren(readChildren(pathTmp, key))
    this.folderData = {
      name: key[0],
      key,
      path: pathTmp,
      isDirectory: true,
      children,
    }

    this.eventEmitter.emit('OPEN_FOLDERS', this.folderData)

    return this.folderData
  }

  // 同步文件夹 TODO...
  syncFolderData() {
    if (this.wacherFolder) {
      this.wacherFolder.close()
    }

    // this.wacherFolder = chokidar.watch(this.folderPath, {
    //   // ignored: /[\/\\]\./,
    //   persistent: true,
    //   depth: 0,
    //   ignorePermissionErrors: true,
    // })
    // this.wacherFolder.on('change', () => {
    //   this.refreshPathFiles(this.folderPath)
    // })
  }

  // // 运行命令行
  // execCmd(cmd, cwd) {
  //   if (this.runStatus === 'error') {
  //     return false
  //   }

  //   return new Promise((resolve, reject) => {
  //     let cmdOpts = {}
  //     if (os.platform() === 'win32') {
  //       cmdOpts = {
  //         shell: 'powershell.exe',
  //         args: `-c "${cmd}"`,
  //       }
  //     } else {
  //       cmdOpts = {
  //         shell: '/bin/bash',
  //         args: ['-c', cmd],
  //       }
  //     }

  //     const ptyProc = childProcess.spawnSync(cmd)
  //     // console.log(ptyProc)
  //     // console.log(ptyProc.toString())
  //     console.log(ptyProc.stdout.toString())
  //     console.log('===')
  //     console.log(ptyProc.stderr.toString())

  //     // ptyProc.onData((data) => {
  //     //   console.log(`onData ${data}`)
  //     // })

  //     // ptyProc.onExit(({ exitCode }) => {
  //     //   if (exitCode === 0) {
  //     //     resolve(true)
  //     //   } else {
  //     //     this.runStatus = 'error'
  //     //     reject(new Error(`exit code ${exitCode}`))
  //     //   }

  //     //   ptyProc.destroy()
  //     // })
  //   })
  // }
}

export default FileManager

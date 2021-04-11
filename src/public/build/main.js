/* eslint-disable */

import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs'
import Mode from 'stat-mode'
import parseProjectFile from './parseProjectFile'

const sdkPathMap = {
  win: path.resolve(__dirname, '../../../sdk/win/scripts/dist/mm/mm.exe'),
  mac: path.resolve(__dirname, '../../../sdk/mac/usr/mm/mm'),
  linux: path.resolve(__dirname, '../../../sdk/linux/scripts/dist/mm/mm')
}

/**
 * 返回一个函数
 * params:
 * appPath: 应用程序安装目录
 * projectFolder：项目所在文件夹
 * projectName: 项目名称
 * projectFiles: 当前项目所有文件
 * buildFolder: 当前项目编译文件夹路径
 * runExce: 执行命令，添加「await」关键字，可同步执行，返回命令执行的结果。可多次执行命令
 */
export const build = async (appPath, projectFolder, projectName, projectFiles, buildFolder, runExec) => {
  let sdkPath = ''
  let filesPath = ''
  let modulePath = ''

  if (process.env.platform === 'win32') {
    sdkPath = sdkPathMap['win']
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources/${projectName}`)
  } else if (process.env.platform === 'darwin') {
    sdkPath = sdkPathMap['mac']
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources/${projectName}`)
  } else {
    sdkPath = sdkPathMap['linux']
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources/${projectName}`)
  }

  const project = parseProjectFile(path.resolve(projectFolder, `${path.basename(projectFolder)}.mmp`))
  const board = project.board
  const floatType = project['float-type'] || 'soft'
  await runExec(`"${sdkPath}" build -b "${board}" -f "${floatType}"`, projectFolder)
}


export const init = async (projectFolder, runExec) => {
  let sdkPath = ''

  if (process.env.platform === 'win32') {
    sdkPath = sdkPathMap['win']
  } else if (process.env.platform === 'darwin') {
    sdkPath = sdkPathMap['mac']
  } else {
    sdkPath = sdkPathMap['linux']
  }

  await runExec(`"${sdkPath}" init`, projectFolder)
}

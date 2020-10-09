/* eslint-disable */

import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs'
import Mode from 'stat-mode'

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
  let runPath = ''
  let sdkPath = ''
  let filesPath = ''
  let modulePath = ''

  if (process.env.platform === 'win32') {
    runPath = path.resolve(__dirname, 'public\\build\\lib\\tools_win\\scripts\\dist\\mm\\mm.exe')
    sdkPath = path.resolve(__dirname, 'public\\build\\lib')
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources\\${projectName}`)
  } else if (process.env.platform === 'darwin') {
    runPath = path.resolve(__dirname, 'public/build/lib/tools_mac/scripts/dist/mm/mm')
    sdkPath = path.resolve(__dirname, 'public/build/lib')
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources/${projectName}`)
  } else {
    runPath = path.resolve(__dirname, 'public/build/lib/tools_linux/scripts/dist/mm/mm')
    sdkPath = path.resolve(__dirname, 'public/build/lib')
    modulePath = path.resolve(app.getPath('documents'), 'MadMachine', 'Library')
    filesPath = path.resolve(projectFolder, `Sources/${projectName}`)
  }

  // const mode = new Mode(fs.statSync(runPath))
  // if (!mode.owner.execute) {
  //   await runExec(`chmod u+x ${runPath}`)
  // }

  await runExec(`"${runPath}" build --sdk "${sdkPath}" --module "${modulePath}"`, projectFolder)
}


export const init = async (projectFolder, runExec) => {
  let runPath = ''
  
  if (process.env.platform === 'win32') {
    runPath = path.resolve(__dirname, 'public\\build\\lib\\tools_win\\scripts\\dist\\mm\\mm.exe')
  } else if (process.env.platform === 'darwin') {
    runPath = path.resolve(__dirname, 'public/build/lib/tools_mac/scripts/dist/mm/mm')
  } else {
    runPath = path.resolve(__dirname, 'public/build/lib/tools_linux/scripts/dist/mm/mm')
  }
  
  await runExec(`"${runPath}" init`, projectFolder)
}
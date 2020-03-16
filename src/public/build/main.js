/* eslint-disable */

import os from 'os'

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
export default async (appPath, projectFolder, projectName, projectFiles, buildFolder, runExec) => {
  if (process.env.platform === 'win32') {
    const runCmdWin = require('./lib/win/main_win.js').default
    await runCmdWin(appPath, projectFolder, projectName, projectFiles, buildFolder, runExec)
  } else if (process.env.platform === 'darwin') {
    const runCmdWin = require('./lib/mac/main_mac.js').default
    await runCmdWin(appPath, projectFolder, projectName, projectFiles, buildFolder, runExec)
  } else {
    const runCmdWin = require('./lib/linux/main_linux.js').default
    await runCmdWin(appPath, projectFolder, projectName, projectFiles, buildFolder, runExec)
  }
}

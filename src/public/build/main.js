/* eslint-disable */

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
export default async (appPath, projectFolder, projectName, projectFiles, buildFolder, runExec) => {

  let scriptPath = ''
  if (process.env.platform === 'win32') {
    scriptPath = './public/build/lib/tools_win/scripts/dist/build_script_v2/build_script_v2.exe'
  } else if (process.env.platform === 'darwin') {
    scriptPath = './public/build/lib/tools_mac/scripts/dist/build_script_v2/build_script_v2'
  } else {
    scriptPath = './public/build/lib/tools_win/scripts/dist/build_script_v2/build_script_v2'
  }

  const runPath = path.resolve(__dirname, scriptPath)
  const sdkPath = path.resolve(__dirname, './public/build/lib')
  const filesPath = path.resolve(projectFolder, `Sources/${projectName}`)

  const mode = new Mode(fs.statSync(runPath))
  if (!mode.owner.execute) {
    await runExec(`chmod u+x ${runPath}`, true)
  }

  console.log(`${runPath} -n ${projectName} --sdk ${sdkPath} --src ${filesPath}`)
  await runExec(`${runPath} -n ${projectName} --sdk ${sdkPath} --src ${filesPath}`)
}

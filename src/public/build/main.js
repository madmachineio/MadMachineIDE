/* eslint-disable */

import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs'
// import Mode from 'stat-mode'
// import parseProjectFile from './parseProjectFile'
import * as pty from 'node-pty'

const resolvePath = (dir = '') => path.resolve(__dirname, './public/build', dir)

const sdkPathMap = {
  win: path.resolve(app.getAppPath(), './sdk/win/scripts/dist/mm/mm.exe'),
  mac: path.resolve(app.getAppPath(), './sdk/mac/usr/mm/mm'),
  linux: path.resolve(app.getAppPath(), './sdk/linux/scripts/dist/mm/mm'),
}

const sdkPath = (() => {
  let sdkPath = ''

  if (process.env.platform === 'win32') {
    sdkPath = sdkPathMap['win']
  } else if (process.env.platform === 'darwin') {
    sdkPath = sdkPathMap['mac']
  } else {
    sdkPath = sdkPathMap['linux']
  }

  return sdkPath
})()

export const build = async (projectFolder, runExec) => {
  await runExec(`"${sdkPath}" config --action build`, projectFolder)
}

export const init = async (projectFolder, runExec) => {
  const projectName = path.basename(projectFolder)
  await runExec(`"${sdkPath}" init --type executable --name ${projectName}`, projectFolder)
}

export const generate = async (projectFolder, runExec) => {
  await runExec(`"${sdkPath}" config --action generate`, projectFolder)
}

export const download = async (projectFolder, runExec) => {
  await runExec(`"${sdkPath}" config --action download`, projectFolder)
}

// /**
//  * 使用Alpha SDK新建项目
//  * @param {*} projectFolder 
//  * @param {*} projectType 
//  * @param {*} boardType 
//  * @param {*} runExec 
//  */
// export const generateProjectWithAlphaSDK = async (projectFolder, projectType, boardType, runExec) => {
//   const cmd = `"${sdkPath}" init --type ${projectType} --board ${boardType}`
//   console.log('执行新建项目命令')
//   console.log(cmd)
//   console.log(projectFolder)
//   await runExec(cmd, projectFolder)
// }

/**
 * 使用Alpha SDK获取项目名称
 * @param {*} cwd 位置
 * @param {*} action 命令
 * @param {*} props 额外参数
 * @returns 
 */
export const runAplpaSDK = async (
  cwd, 
  action, 
  props = { projectType: '', boardType: '', onData: null, onError: null }) => {
  // sdk提供的命令
  const sdkActions = {
    'init': `init --type ${props.projectType || ''} --board ${props.boardType}`,
    'getName': 'run --action get-name',
    'getStatus': 'run --action get-status',
    'build': 'run --action build',
    'download': 'run --action download'
  }

  return new Promise((resolve) => {
    // 匹配sdk命令
    const sdkCommand = sdkActions[action] || ''
    if (!sdkCommand) {
      resolve({ result: false, msg: '无匹配命令，请检查action', data: '' })
    }

    // 接收数据
    let datas = []

    const cmd = `${sdkPath} ${sdkCommand}`
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash'

    const workerProcess = pty.spawn(
      shell,
      ['-c', cmd],
      {
        cwd: cwd ? path.resolve(cwd) : resolvePath(),
        env: process.env,
      },
    )

    workerProcess.on('data', data => {
      console.log(`${action}: ${data}`)
      datas.push(data)
      props.onData && props.onData(data)
    })

    workerProcess.on('exit', (code) => {
      if (code === 0) {
        resolve({ result: true, msg: 'ok', data: datas })
      } else {
        resolve({ result: false, msg: `exit code ${code}`, data: [] })
        props.onError && props.onError()
      }

      const now = new Date()
      console.log(`子进程退出 ${code} 时间${now.toLocaleTimeString()}`)
      // console.log(fs.readdirSync(`${cwd}${global.PATH_SPLIT}Sources`))

      // try {
      //   console.log('运行 ' + action + ' 结束')
      //   const res = fs.readdirSync(path.join(cwd, 'Sources'))
      //   console.log(res)
      // } catch (error) {
      //   console.log(error)
      // }
    })
  })
}

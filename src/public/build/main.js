/* eslint-disable */

import { app } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs'
import Mode from 'stat-mode'
import parseProjectFile from './parseProjectFile'

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

import { app } from 'electron'
import fs from 'fs'
import { get as getPathVal, merge } from 'lodash'
import path from 'path'
import os from "os";
import childProcess from "child_process";

// 初始化 基本数据
let baseConfigData = null
if (process.env.NODE_ENV === 'production') {
  baseConfigData = require('./dist/config_prod.json')
} else {
  baseConfigData = require('./dist/config_dev.json')
}

// 初始化 本地配置文件
const homeDir = app.getPath('appData')
const userConfigDir = path.resolve(homeDir, 'MadMachine')
const userConfigPath = path.resolve(userConfigDir, 'config.json') // `${userConfigDir}/config.json`
console.log(userConfigPath)

if (!fs.existsSync(userConfigDir)) {
  fs.mkdirSync(userConfigDir)
}
console.log(homeDir)
if (!fs.existsSync(path.resolve(userConfigDir, 'Projects'))) {
  fs.mkdirSync(path.resolve(userConfigDir, 'Projects'))
}
if (!fs.existsSync(userConfigPath)) {
  // 处理旧配置文件移动
  const oldConfigPath = path.resolve(app.getPath('home'), 'MadMachine', 'config.json')
  if (fs.existsSync(oldConfigPath)) {
    switch (os.platform()) {
      case 'win32':
        childProcess.execSync(`xcopy "${oldConfigPath}" "${userConfigPath}" /e /y /q`)
        break
      case 'darwin':
        childProcess.execSync(`cp -R "${oldConfigPath}" "${userConfigPath}"`)
        break
      case 'linux':
        childProcess.execSync(`cp -R "${oldConfigPath}" "${userConfigPath}"`)
        break
      default:
        break
    }
  } else {
    fs.writeFileSync(userConfigPath, '{}')
  }
}

const userConfigData = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'))

// 当前所有配置
let configData = merge({}, baseConfigData, userConfigData)

const setObjValue = (obj, keys, value) => {
  const key = keys.shift()
  obj[key] = obj[key] || {}
  if (keys.length > 1) {
    setObjValue(obj[key], keys, value)
  } else if (keys.length === 1) {
    obj[key][keys.shift()] = value
  } else {
    obj[key] = value
  }
}

// 获取配置
export const getConfig = key => getPathVal(configData, key)

// 设置配置
export const setConfig = (keys, value) => {
  // console.log('设置配置')
  setObjValue(userConfigData, keys.split('.'), value)

  fs.writeFileSync(userConfigPath, JSON.stringify(userConfigData))

  configData = merge({}, baseConfigData, userConfigData)
}

const konfig = require('konfig')
const path = require('path')
const fs = require('fs')
const { get: getPathVal, merge } = require('lodash')

function resolve(dir) {
  return path.join(__dirname, '../', dir)
}

const originConfig = konfig({ path: resolve('../src/config/') })

const saveConfig = (env) => {
  const configData = merge({}, originConfig.app, originConfig[`app_${env}`] || {})
  fs.writeFileSync(resolve(`../src/config/dist/config_${env}.json`), JSON.stringify(configData))
};
(() => {
  ['dev', 'prod'].forEach(env => saveConfig(env))
})()

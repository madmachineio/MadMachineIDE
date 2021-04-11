const path = require('path')
const webpack = require('webpack')
const childProess = require('child_process')

const configFactory = require('../webpack.electron.config.js')

webpack(configFactory).run((error, stats) => {
  if (error) {
    console.log(error)
    return false
  }

  const command = childProess.exec('electron .')
  command.stdout.on('data', (data) => {
    console.log(data)
  })
  command.stderr.on('data', (data) => {
    console.log(data)
  })
})

const fse = require('fs-extra')
const path = require('path')
const { downloadLatest } = require('./sdkDownloader')

const rootDir = path.resolve(__dirname, '../..')

async function downloadSdk(platform, releaseOnly = false) {
  const targetDir = path.resolve(rootDir, 'sdk')
  if (!fse.existsSync(targetDir)) {
    fse.mkdirSync(targetDir)
  }
  const sdkDir = path.resolve(targetDir, platform)
  if (fse.existsSync(sdkDir)) {
    console.log(`Emptying ${sdkDir}`)
    fse.removeSync(sdkDir)
  }
  console.log(`Downloading latest ${platform} sdk...`)
  await downloadLatest({
    platform: platform,
    targetDir: targetDir,
    releaseOnly
  })
  .then(() => {
    const sdkPath = path.join(targetDir, 'mm-sdk')
    if (fse.existsSync(sdkPath)) {
      fse.moveSync(sdkPath, sdkDir)
    }
  })
}

(async () => {
  await downloadSdk('mac')
  await downloadSdk('win', true)
  // todo 解不开，有问题
  // await downloadSdk('linux', true)
})()

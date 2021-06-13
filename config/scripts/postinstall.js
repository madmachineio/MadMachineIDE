const fse = require('fs-extra')
const path = require('path')
const childProcess = require('child_process')
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

function downloadExamples() {
  const targetDir = path.resolve(rootDir, 'resources', 'project', 'Examples')
  if (!fse.existsSync(targetDir)) {
    fse.mkdirSync(targetDir)
  }
  childProcess.execSync(`git clone --depth 1 https://github.com/madmachineio/MadExamples.git ${targetDir}`)
}

(async () => {
  console.log('Step1. Downloading sdk')
  await downloadSdk('mac')
  await downloadSdk('win', true)
  // todo unzip error
  // await downloadSdk('linux', true)
  console.log('Step1 Done.')

  console.log('Step2. Downloading examples')
  downloadExamples()
  console.log('Step2 Done.')
})()

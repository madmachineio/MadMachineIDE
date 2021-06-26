require('dotenv').config()
const path = require('path')
const fse = require('fs-extra')
const childProcess = require('child_process')


function notarize() {
  const version = require('../../package.json').version
  const dmgPath = `build/MadMachine-${version}.dmg`

  if (!fse.existsSync(dmgPath)) {
    console.error('Error#0 occurred')
    console.error(`${dmgPath} no found, \`npm run app:publish:mac\` is required`)
    return
  }

  // 1.Upload dmg
  console.log('1.Uploading dmg file')
  const uploadOutput = childProcess.execSync(`xcrun altool --notarize-app --primary-bundle-id 'io.madmachine.app' --username '${process.env.APPLE_ID}' --password '${process.env.APPLE_ID_PASSWORD}' --file ${dmgPath}`).toString()
  fse.writeFileSync('notarize.log', uploadOutput, { encoding: 'utf-8' })
  const isValid = /No errors uploading/.test(uploadOutput)
  if (!isValid) {
    console.error('Error#1 occurred')
    console.error(uploadOutput)
    return
  }

  console.log(`DMG uploaded`)
  const RequestUUID = uploadOutput.match(/RequestUUID\s*=\s*(.*)/)[1].trim()
  console.log(`RequestUUID = [${RequestUUID}]`)

  // 2.Check status
  console.log('2.Checking status')
  let intervalTimerId
  function checkStatus() {
    const statusOutput = childProcess.execSync(`xcrun altool --notarization-info '${RequestUUID}' --username '${process.env.APPLE_ID}' --password '${process.env.APPLE_ID_PASSWORD}'`).toString()
    if (/Status Code/.test(statusOutput)) {
      clearInterval(intervalTimerId)

      if (/Package Approved/.test(statusOutput)) {
        console.log('Package Approved!')
        // 3.Staple
        console.log('3.Staple dmg file')
        const result = childProcess.execSync(`xcrun stapler staple '${dmgPath}'`).toString()
        console.log(result)
        console.log('Done')
      }
      else {
        console.error('Error#2 occurred')
      }
    }
    else {
      process.stdout.write('.');
    }
  }
  intervalTimerId = setInterval(checkStatus, 1000 * 10)
}

notarize()

require('dotenv').config()
const { notarize } = require('electron-notarize')

// https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  // DO NOT notarize due to the lack of team member authorization
  if (true || electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename

  return await notarize({
    appBundleId: 'com.madmachine.app',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
  })
}

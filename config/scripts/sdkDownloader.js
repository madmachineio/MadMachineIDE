const downloadRelease = require('download-github-release')

// Define a function to filter releases.
function filterRelease(release) {
  // Filter out prereleases.
  return release.prerelease === false
}

// Define a function to filter assets.
function macAssetFilter(asset) {
  return /-darwin/i.test(asset.name) || /-mac/i.test(asset.name)
}
function winAssetFilter(asset) {
  return /-win/i.test(asset.name)
}
function linuxAssetFilter(asset) {
  return /-linux/i.test(asset.name) || /-ubuntu/i.test(asset.name)
}
const assetFilterMap = {
  mac: macAssetFilter,
  win: winAssetFilter,
  linux: linuxAssetFilter,
}

function downloadLatest({ platform, targetDir, leaveZipped = false, releaseOnly = false }) {  
  if (!assetFilterMap[platform]) {
    throw new Error(`Unrecognized platform ${platform}`)
  }

  const user = 'madmachineio'
  const repo = 'mm-sdk'

  return downloadRelease(user, repo,
    targetDir,
    releaseOnly ? filterRelease : () => true,
    assetFilterMap[platform],
    leaveZipped
  )
  .then(() => {
    console.log('Done!')
  })
  .catch((err) => {
    console.error(err.message)
  })
}

module.exports = {
  downloadLatest
}

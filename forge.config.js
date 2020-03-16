const path = require('path')

const pathResolve = dir => path.resolve(__dirname, dir)

exports.default = {
  packagerConfig: {
    dir: pathResolve('./'),
    executableName: 'Electron',
    name: 'Electron',
    icon: '',
  },
  // make_targets: {
  //   win32: ['squirrel'],
  //   darwin: ['zip', 'dmg'],
  //   linux: ['deb', 'rpm'],
  // },
  // electronPackagerConfig: {
  //   packageManager: 'npm',
  // },
  // electronWinstallerConfig: {
  //   name: 'MadMachine',
  // },
  // electronInstallerDebian: {},
  // electronInstallerRedhat: {},
  // github_repository: {
  //   owner: '',
  //   name: '',
  // },
  // windowsStoreConfig: {
  //   packageName: 'MadMachine',
  //   name: 'MadMachine',
  // },
}

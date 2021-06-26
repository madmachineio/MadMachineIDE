const path = require('path')

const glob = require('fast-glob')

const macExtraBinaries = glob.sync([
  'sdk/**/*.a'
]).map(p => path.join('build/mac/MadMachine.app/Contents/Resources/app', p)).concat(
  'build/mac/MadMachine.app/Contents/Resources/app/node_modules/fsevents/build/Release/.node'
)


module.exports = {
  "productName": "MadMachine",
  "buildVersion": "1.0.0",
  "appId": "io.madmachine.app",
  "asar": false,
  "directories": {
    "output": "build"
  },
  "publish": [
    {
      "provider": "generic",
      "url": ""
    }
  ],
  "fileAssociations": [
    {
      "ext": "mmp",
      "icon": "resources/ext/mmswift"
    }
  ],
  "asarUnpack": [
    "**/*.node",
    "**/*.a",
  ],
  "mac": {
    "icon": "resources/logo/icon.icns",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "config/entitlements.mac.plist",
    "entitlementsInherit": "config/entitlements.mac.plist",
    "target": [
      "dmg"
    ],
    "binaries": macExtraBinaries,
    "extraDistFiles": [
      "dist/**/*",
      "sdk/mac/**/*",
      "package.json",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin"
    ]
  },
  "win": {
    "icon": "resources/logo/icon.ico",
    "target": [
      {
        "target": "nsis",
        "arch": [
          "x64",
          "ia32"
        ]
      }
    ],
    "files": [
      "dist/**/*",
      "sdk/win/**/*",
      "package.json",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin"
    ]
  },
  "nsis": {
    "installerIcon": "resources/logo/install.ico",
    "uninstallerIcon": "resources/logo/install.ico",
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": true,
    "allowElevation": true,
    "createDesktopShortcut": true,
    "runAfterFinish": true,
    "include": "installer.nsh"
  },
  "dmg": {
    "icon": "resources/logo/install.icns",
    "background": "resources/imgs/macinstall.tiff",
    "window": {
      "width": 574,
      "height": 313
    }
  },
  "pkg": {
    "scripts": "../resources/build/pkg-scripts",
    "installLocation": "/Applications",
    "background": {
      "alignment": "bottomleft"
    },
    "allowAnywhere": true,
    "allowCurrentUserHome": true,
    "allowRootDirectory": true,
    "isVersionChecked": true,
    "isRelocatable": false,
    "overwriteAction": "upgrade"
  },
  "linux": {
    "icon": "resources/logo/icon.icns",
    "target": "deb",
    "category": "Development"
  }
}

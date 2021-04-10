const fs = require('fs');
const p = require('path');
const FileHound = require('filehound');

const warn = (logger, path) => {
  const errorMessage = `Directory not found ${path}`;
  if (logger) {
    logger.warn(errorMessage);
  } else {
    console.warn(`ReverseFileModePlugin: ${errorMessage}`);
  }
};

// https://github.com/GeKorm/webpack-permissions-plugin/blob/master/index.js
class ReverseFileModePlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('ReverseFileModePlugin', (
      stats /* stats is passed as an argument when done hook is tapped.  */
    ) => {
      console.log('webpack done!');
      if (this.options.paths) {
        for (const path of this.options.paths) {
          if (!fs.existsSync(path)) {
            warn(logger, path)
            return
          }

          // const dirs = FileHound.create().path(path).directory().findSync()
          const files = FileHound.create().path(path).findSync()
          // for (const di of dirs) {
          //   if (fs.existsSync(di)) {
          //     fs.chmodSync(di, dir.dirMode || 0o644)
          //   }
          // }
          for (const fi of files) {
            if (p.extname(fi) === '' && !p.basename(fi).startsWith('.') && fs.existsSync(fi)) {
              fs.chmodSync(fi, 0o755)
            }
          }
        }
      }
    })
  }
}

module.exports = ReverseFileModePlugin

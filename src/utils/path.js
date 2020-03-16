import fs from 'fs'
import path from 'path'

export const fromatPath = folderPath => ({
  parentPath: path.dirname(folderPath),
  fileFullName: path.basename(folderPath),
  fileName: path.basename(folderPath, path.extname(folderPath)),
  ext: path.extname(folderPath),
})

export const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true
  }
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname)
    return true
  }

  return false
}

export const exsitProject = (projectPath) => {
  if (!fs.existsSync(projectPath)) {
    return false
  }

  let result = false
  fs.readdirSync(projectPath).forEach((file) => {
    if (/.+\.mmswift/.test(file)) {
      if (fs.existsSync(path.resolve(projectPath, file))) {
        result = true
      }
    }
  })

  return result
}

export const exsitProjectFile = filePath => fs.existsSync(filePath)

import fse from 'fs-extra'
import path from 'path'

export const fromatPath = folderPath => ({
  parentPath: path.dirname(folderPath),
  fileFullName: path.basename(folderPath),
  fileName: path.basename(folderPath, path.extname(folderPath)),
  ext: path.extname(folderPath),
})

export const mkdirsSync = (dirname) => {
  try {
    fse.mkdirpSync(dirname);
  } catch(error) {
    console.error(error)
    return false
  }

  return true;
}

export const exsitProject = (projectPath) => {
  if (!fse.existsSync(projectPath)) {
    return false
  }

  let result = false
  fse.readdirSync(projectPath).forEach((file) => {
    if (/.+\.mmp/.test(file)) {
      if (fse.existsSync(path.resolve(projectPath, file))) {
        result = true
      }
    }
  })

  return result
}

export const exsitProjectFile = filePath => fse.existsSync(filePath)

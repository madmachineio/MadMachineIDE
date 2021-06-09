import fs from 'fs'
import path from 'path'

export const fromatPath = folderPath => ({
  parentPath: path.dirname(folderPath),
  fileFullName: path.basename(folderPath),
  fileName: path.basename(folderPath, path.extname(folderPath)),
  ext: path.extname(folderPath),
})

export const mkdirsSync = (dirname) => {
  console.log(`创建文件件 ${dirname}`)

  // 判断是否存在文件
  if (fs.existsSync(dirname)) {
    return true
  }

  const parentDirname = path.dirname(dirname)

  // 判断父目录是否存在 => 存在
  if (mkdirsSync(parentDirname)) {
    fs.mkdirSync(dirname)
    console.log('创建成功')
    const parentDirPaths = dirname.split(global.PATH_SPLIT)
    parentDirPaths.splice(parentDirPaths.length - 1)
    const dirContents = fs.readdirSync(parentDirPaths.join(global.PATH_SPLIT))
    const extraDirContents = dirContents.filter((item) => item.endsWith('\r\n'))
    console.log(extraDirContents)

    // for (let i = 0; i < extraDirContents.length; i + 1) {
    //   const rmPath = `${parentDirPaths.join(global.PATH_SPLIT)}${global.PATH_SPLIT}${extraDirContents[i]}`
    //   if (fs.existsSync(rmPath)) {
    //     console.log(`删除 ${rmPath}`)
    //     fs.rmdirSync(rmPath)
    //   }
    // }

    return true
  }

  return false
}

export const exsitProject = (projectPath) => {
  // console.log('检查路径 ' + projectPath)
  if (!fs.existsSync(projectPath)) {
    return false
  }

  let result = false
  fs.readdirSync(projectPath).forEach((file) => {
    if (/.+\.mmp/.test(file)) {
      if (fs.existsSync(path.resolve(projectPath, file))) {
        result = true
      }
    }
  })

  return result
}

export const exsitProjectFile = filePath => fs.existsSync(filePath)

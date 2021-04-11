import * as TOML from '@iarna/toml'
import * as fs from 'fs'

export default function parse(projectFile) {
  let project = {}
  if (projectFile && fs.existsSync(projectFile)) {
    const file = fs.readFileSync(projectFile, { encoding: 'utf-8' })
    project = TOML.parse(file)
  }

  return project
}

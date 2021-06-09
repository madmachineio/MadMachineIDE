import childProcess from 'child_process'

const p = childProcess.spawnSync('./dist/test.app/Contents/MacOS/test')

const {
  output,
  stdout,
  stderr,
} = p

console.log(output.toString())
console.log('===')
console.log(stdout.toString())
console.log('===')
console.log(stderr.toString())

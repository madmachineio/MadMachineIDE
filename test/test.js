// const pty = require('node-pty')

// const cmd = 'mkdir "C:\\test\\test5\\build" & del /q/a/f "C:\\test\\test5\\build\\*.bin" & del /q/a/f "C:\\test\\test5\\build\\*.elf" & del /q/a/f "C:\\test\\test5\\build\\*.map" & del /q/a/f "C:\\test\\test5\\build\\*.a" & del /q/a/f "C:\\test\\test5\\build\\*.c" & del /q/a/f "C:\\test\\test5\\build\\*.o*"'

// cmdOpts = {
//     shell: 'cmd.exe',
//     args: `/c "${cmd}"`
//   }

// const ptyProc = pty.spawn(cmdOpts.shell, cmdOpts.args, {
//     ...this.cmdOpts,
//     cwd: process.env.HOME,
//   env: process.env
//   })

//   ptyProc.on('data', (data) => {
//     console.log(data)
//   })
//   ptyProc.on('exit', (code) => {

//     ptyProc.destroy()
//   })

const childProcess = require("child_process");
const iconv = require("iconv-lite");

const disks = iconv
  .decode(
    childProcess.execSync(
      'powershell.exe -c "Get-WmiObject Win32_logicaldisk | Select-Object deviceid,description,volumeName"'
    ),
    "cp936"
  )
  .split("\n");
const dir = disks.map((item) => {
  const data = item.match(/\S+/g) || [];
  return {
    name: data[2],
    path: `${data[0]}\\`,
  };
});

console.log(disks, dir);

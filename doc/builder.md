## 编译 swift

### 目录

```
src/public/build
```

### 使用方法

src/public/build/main.js:

```js
/**
 * 返回一个函数
 * params:
 * projectName: 项目名称
 * projectFiles: 当前项目所有文件
 * runExce: 执行命令，添加「await」关键字，可同步执行，返回命令执行的结果。可多次执行命令
 */
export default async (projectName, projectFiles, runExec) => {
  console.log(projectName, projectFiles);

  await runExec("pwd");
  await runExec("node ./test.js");
};
```

### 第三方的脚本

第三方的脚本可放置在 **src/public/build** 下， **src/public** 下的所有文件都会添加到程序中打包。

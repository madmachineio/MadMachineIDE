## Compile SwiftIO Project

### Source

```
src/public/build
```

### Usage

src/public/build/main.js:

```js
/**
 * Return a function
 * params:
 * projectName: Project name
 * projectFiles: All files included in the project
 * runExce: Run commands, `await` if needed
 */
export default async (projectName, projectFiles, runExec) => {
  console.log(projectName, projectFiles);

  await runExec("pwd");
  await runExec("node ./test.js");
};
```

### 3rd Scripts

Other 3rd scripts can be put into **src/public/build**, all files at **src/public** will be rolled up to the final application binary.

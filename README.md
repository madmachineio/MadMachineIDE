<h1 align="center">
  <br>
  <a href="https://www.madmachine.io/">
    <img src="https://github.com/madmachineio/MadMachineIDE/blob/master/resources/logo/MadMachine.ico" alt="Markdownify" width="200"></a>
  <br>
  MadMachineIDE
  <br>
</h1>

<h4 align="center">MadMachine IDE is the premier integrated development environment for SwiftIO, which makes it easy to write Swift code and download it to the board.</h4>

Refer to the [Getting Started](https://resources.madmachine.io/getting_started) page for Installation instructions and basic operation.

## Project structure

Electron + React

Main framework: Electron, use electron-builder for packaging

Page framework: React + Mobx

Editor framework: CodeMirror

## Contributing

1. Fork it (<https://github.com/madmachineio/MadMachineIDE>)
2. Create your branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

You want to use node v12. 

Install dependencies:

```sh
npm install
```

Rebuild native dependencies. [How to install native modules](https://www.electronjs.org/docs/tutorial/using-native-node-modules)

```sh
./node_modules/.bin/electron-rebuild
```

Run the app:

```sh
npm run start
```

Build the executable binaries (Optionally):

```sh
# build for all platforms at once
npm run app:publish
# or specified platform only
npm run app:publish:win
npm run app:publish:mac
npm run app:publish:linux
```

Generate the configuration files (Optionally):

```sh
npm run config:build
```

Other references:

- [Installation](doc/install.md)
- [Configurations](doc/config.md)
- [Build-in Examples](doc/example.md)
- [SwiftIO Compiler Integration](doc/builder.md)

## Contact

Andy Liu - [@madmachineio](https://twitter.com/madmachineio)

Join us at [Discord](http://discord.gg/zZ9bFHK)

Project Link: [https://github.com/madmachineio/MadMachineIDE](https://github.com/madmachineio/MadMachineIDE)

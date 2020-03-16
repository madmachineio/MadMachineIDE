## [Install](https://github.com/MadLittleMods/node-usb-detection)

### Mac

Ensure that you have at a minimum, the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgraded your OS, it probably removed your installation of Command Line Tools, please verify before submitting a ticket.

### Linux

You know what you need for you system, basically your appropriate analog of build-essential. Keep rocking!

To compile and install native addons from npm you may also need to install build tools (source):

```
sudo apt-get install -y build-essential
```

Also install libudev:

```
sudo apt-get install libudev-dev
```

### Windows

- Visual Studio 2013/2015 Community
- Visual Studio 2010
- Visual C++ Build Tools 2015

If you are having problems building, [please read this.](https://github.com/TooTallNate/node-gyp/issues/44)

**npm run rebuild -> The system cannot find the path specified.**

If you are running into the The system cannot find the path specified. error when running npm run rebuild, make sure you have Python 2 installed and on your PATH.

You can verify node-gyp is configured correctly by looking at the output of node-gyp configure --verbose.

```
$ node-gyp configure --verbose
...
gyp verb check python checking for Python executable "python2" in the PATH
gyp verb `which` succeeded python2 C:\Python27\python2.EXE
```

If you already have Python 3 installed, you can install Python 2 alongside and create a symlink called python2.exe via mklink "C:\Python27\python2.exe" "C:\Python27\python.exe" and add the directory to your path.

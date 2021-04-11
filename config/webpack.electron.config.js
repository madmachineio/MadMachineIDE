/**
 * Webpack config for production electron main process
 */

const os = require('os')
const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

// const { dependencies } = require('../../package.json')

const pathResolve = dir => path.join(__dirname, '..', dir)

module.exports = {
  devtool: 'source-map',

  mode: process.env.NODE_ENV,

  target: 'electron-main',

  entry: './src/main',

  externals: {
    chokidar: 'commonjs chokidar',
    lodash: 'commonjs lodash',
    serialport: 'commonjs serialport',
    'usb-detection': 'commonjs usb-detection',
    'sudo-prompt': 'commonjs sudo-prompt',
    'node-pty': 'commonjs node-pty',
    'tiny-worker': 'commonjs tiny-worker',
    'strip-ansi': 'commonjs strip-ansi',
    'drivelist': 'commonjs drivelist',
    'node-usbspy': 'commonjs node-usbspy',
    'usb': 'commonjs usb',
    'stat-mode': 'commonjs stat-mode',
    'drivelist': 'commonjs drivelist'
  },
  // externals: [
  //   "express": 'commonjs express',
  //   // ...Object.keys(dependencies || {}),
  //   nodeExternals({
  //     // modulesFromFile: true,
  //     // whitelist: [/^lodash/],
  //     // modulesFromFile: true,
  //   }),
  // ],

  output: {
    path: path.join(__dirname, '..'),
    filename: './dist/main.js',
  },

  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        // loader: 'string-replace-loader',
        enforce: 'pre',
        use: 'babel-loader',
        exclude: /node_modules/,
        // options: {
        //   search: '#!/usr/bin/env node',
        //   replace: '',
        // },
      },
    ],
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': pathResolve('src'),
      '@public': pathResolve('src/public'),
      '@windows': pathResolve('src/windows'),
      '@edit': pathResolve('src/windows/edit/views'),
      '@setting': pathResolve('src/windows/setting/views'),
      '@serial': pathResolve('src/windows/serial/views'),
      '@user': pathResolve('src/windows/user/views'),
    },
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true,
        }),
      ],
  },

  plugins: [
    // new BundleAnalyzerPlugin({
    //   analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
    //   openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    // }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV, // 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      platform: os.platform(),
    }),

    new webpack.NamedModulesPlugin(),

    new CopyPlugin([
      {
        from: pathResolve('/src/public'),
        to: pathResolve('/dist/public'),
        ignore: ['build/lib/**/*'],
      },
      {
        from: pathResolve(`/src/public/build/lib/hal`),
        to: pathResolve(`/dist/public/build/lib/hal`),
      },
      {
        from: pathResolve('/resources'),
        to: pathResolve('/dist/resources'),
      },
      {
        from: pathResolve('/resources/build'),
        to: pathResolve('/dist/build'),
      },
    ]),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
}

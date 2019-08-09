const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const appDir = path.join(__dirname, '/src/app/')
const envDev = new webpack.DefinePlugin({ __DEV__: true })
const buildType = process.env.BUILD_TYPE || 'web'

module.exports = {
  mode: 'development',
  entry: { app: path.join(appDir, 'index.js') },
  devtool: 'cheap-source-map',
  output: {
    pathinfo: true,
    library: '[name]',
    libraryTarget: 'umd',
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    envDev,
    new HtmlWebpackPlugin({
      template: path.join(appDir, 'index.ejs'),
      templateParameters: {
        type: buildType
      },
      chunks: [ 'app' ],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false,
        html5: false,
        minifyCSS: false,
        minifyJS: false,
        minifyURLs: false,
        removeComments: false,
        removeEmptyAttributes: false
      },
      hash: false
    })
  ],
  module: {
    rules: [{
      test: /\.css?$/,
      use: [ 'style-loader', { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader' ]
    }, {
      test: /\.js?$/,
      use: [ 'babel-loader' ]
    }, {
      test: /\.(woff(2)?|ttf|eot|ogg|mp3)?$/,
      use: [{ loader: 'file-loader', options: { name: '[name].[hash].[ext]' } }]
    }, {
      test: /\.(png|jpg|svg)?$/,
      use: [{ loader: 'file-loader', options: { name: '[name].[hash].[ext]' } }]
    }]
  }
}

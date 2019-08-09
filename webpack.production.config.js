const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const appDir = path.join(__dirname, '/src/app/')
const envProd = new webpack.DefinePlugin({ __DEV__: false })
const buildType = process.env.BUILD_TYPE || 'web'
const plugins = [
  envProd,
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
    chunkFilename: '[id].[hash].css'
  }),
  new HtmlWebpackPlugin({
    template: path.join(appDir, 'index.ejs'),
    templateParameters: {
      type: buildType
    },
    minify: {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeComments: true,
      removeEmptyAttributes: true
    },
    hash: true
  })
]
if (buildType === 'fbinstant') {
  plugins.push(new CopyPlugin([
    { from: path.join(__dirname, 'fbapp-config.json'), to: path.resolve(__dirname, 'build_' + buildType), force: true }
  ]))
}

module.exports = {
  mode: 'production',
  entry: { app: path.join(appDir, 'index.js') },
  output: {
    path: path.resolve(__dirname, 'build_' + buildType),
    pathinfo: true,
    library: '[name]',
    libraryTarget: 'umd',
    filename: '[name].[chunkhash].js'
  },
  plugins,
  optimization: { minimize: true },
  module: {
    rules: [{
      test: /\.css$/,
      use: [ { loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader' ]
    }, {
      test: /\.js$/,
      use: [ 'babel-loader' ]
    }, {
      test: /\.(woff(2)?|ttf|eot)?$/,
      use: [{ loader: 'file-loader', options: { name: '[name].[hash].[ext]', outputPath: 'fonts' } }]
    }, {
      test: /\.(ogg|mp3)?$/,
      use: [{ loader: 'file-loader', options: { name: '[name].[hash].[ext]', outputPath: 'sounds' } }]
    }, {
      test: /\.(png|jpg|svg)$/,
      use: [{ loader: 'file-loader', options: { name: '[name].[hash].[ext]', outputPath: 'images' } }]
    }]
  }
}

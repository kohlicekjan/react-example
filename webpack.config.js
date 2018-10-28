const pkg = require('./package.json');
const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const {GenerateSW} = require('workbox-webpack-plugin');

const isDev = process.argv.indexOf('development') > 0;
const distPath = path.resolve(__dirname, 'dist');

const webpackConfig = {
  entry: {
    app: path.resolve(__dirname, 'src', 'app.js'),
  },
  output: {
    path: distPath,
    filename: path.join('app', '[name].[hash].js'),
    publicPath: './',
    sourceMapFilename: '[file].map',
  },
  devtool: isDev ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: { sourceMap: true, minimize: true },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true },
          },
        ],
        include: path.resolve(__dirname, 'src'),
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: { name: path.join('assets', 'images', '[name].[hash].[ext]') },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)$/,
        use: [{
          loader: 'file-loader',
          options: { name: path.join('assets', 'fonts', '[name].[ext]') },
        }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(distPath),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.template.html'),
      inject: 'body',
      favicon: path.resolve(__dirname, 'src', 'favicon.ico'),
      minify: {
        minifyCSS: true,
        minifyJS: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        preserveLineBreaks: false,
        removeAttributeQuotes: true,
        removeComments: true,
      },
    }),
    new WebpackPwaManifest({
      name: 'React example',
      short_name: 'RE',
      description: 'Description...',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
        {
          src: path.resolve(__dirname, 'src', 'logo.svg'),
          sizes: [24, 32, 48, 72, 96, 144, 192, 512],
          destination: path.join('assets', 'images'),
        },
      ],
      ios: false,
      inject: true,
      fingerprints: false,
    }),
    new GenerateSW({
      swDest: 'sw.js',
      importWorkboxFrom: 'local',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|gif|jpg|jpeg|svg|ico|woff(2)?|ttf|eot)$/,
          handler: 'cacheFirst',
        },
        {
          urlPattern: /\.(?:css|js)$/,
          handler: 'staleWhileRevalidate',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: path.join('assets', 'css', '[name].[contenthash].css'),
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  ],
  devServer: {
    contentBase: distPath,
    publicPath: '/',
    open: true,
    historyApiFallback: true,
    noInfo: true,
    compress: true
  },
  optimization: {
    minimize: !isDev,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
};

module.exports = webpackConfig;

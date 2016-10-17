var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
// var HtmlWebpackPlugin = require('html-webpack-plugin');

// Webpack Config
module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor':    './src/vendor.ts',
    'app':       './src/init.ts',
  },

  output: {
    path: 'app/build',
  },

  plugins: [
    // new ExtractTextPlugin("style.css"),
    new ExtractTextPlugin("[name].css"),
    new webpack.optimize.CommonsChunkPlugin({ name: ['app', 'vendor', 'polyfills'], minChunks: Infinity }),
  ],

  module: {
    loaders: [
      { test: /\.ts$/,   loader: 'awesome-typescript-loader' },
      { test: /\.html$/, loader: 'html-loader' },
      { test: /\.scss$/,
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!sass-loader?sourceMap')
        loaders: [
          'raw',
          'sass?includePaths[]=' + path.resolve(__dirname, '../node_modules/compass-mixins/lib')
        ]
      },
      // { test: /\.ttf$/, loader: 'file?limit=65000&mimetype=application/octet-stream&name=public/fonts/[name].[ext]' }
      { test: /\.svg$/, loader: 'url?limit=65000&mimetype=image/svg+xml&name=public/fonts/[name].[ext]' },
      { test: /\.woff$/, loader: 'url?limit=65000&mimetype=application/font-woff&name=public/fonts/[name].[ext]' },
      { test: /\.woff2$/, loader: 'url?limit=65000&mimetype=application/font-woff2&name=public/fonts/[name].[ext]' },
      { test: /\.[ot]tf$/, loader: 'url?limit=65000&mimetype=application/octet-stream&name=public/fonts/[name].[ext]' },
      { test: /\.eot$/, loader: 'url?limit=65000&mimetype=application/vnd.ms-fontobject&name=public/fonts/[name].[ext]' }
    ]
  }
};
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
// var HtmlWebpackPlugin = require('html-webpack-plugin');

// Webpack Config
module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor':    './src/vendor.ts',
    'app':       './src/main.ts',
  },

  output: {
    path: 'app/build',
  },

  plugins: [
    // new ExtractTextPlugin("style.css"),
    new ExtractTextPlugin("[name].css"),
    new webpack.optimize.CommonsChunkPlugin({ name: ['app', 'vendor', 'polyfills'], minChunks: Infinity }),
    // new HtmlWebpackPlugin({
    //   title: 'RED TIE TITLE',
    //   template:'./src/index.ejs',
    //   inject: 'body',
    //   // favicon: './src/system/assets/img/favicon.png'
    // })
  ],

  module: {
    loaders: [
      { test: /\.ts$/,   loader: 'awesome-typescript-loader' },
      { test: /\.html$/, loader: 'html-loader' },
      { test: /\.scss$/,
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!sass-loader?sourceMap')
        loader: "raw!sass?includePaths[]=" + path.resolve(__dirname, "../node_modules/compass-mixins/lib")
      },
    ]
  }
};
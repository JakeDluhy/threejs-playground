const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app:   path.join(__dirname, 'index.js'),
  build: path.join(__dirname, 'build'),
  style: path.join(__dirname, 'css'),
};

module.exports = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  //
  // Entries have to resolve to files! It relies on Node.js
  // convention by default so if a directory contains *index.js*,
  // it will resolve to that.
  entry: {
    app: PATHS.app,
  },
  output: {
    path:     PATHS.build,
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Dev Server',
    }),
    new webpack.NamedModulesPlugin(),
  ],
  module: {
    rules: [{
      test:    /\.css$/,
      include: PATHS.style,
      use:     ['style-loader', 'css-loader'],
    }],
  },
};
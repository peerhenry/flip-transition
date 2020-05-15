const path = require('path');

module.exports = {
  entry: './src/FlipTransition.ts',
  output: {
    filename: 'flip-transition.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'FlipTransition',
    libraryTarget: 'window',
  },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  mode: 'production',
};

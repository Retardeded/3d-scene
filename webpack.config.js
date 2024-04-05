const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    // ... (other plugins)
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/cubeImgs', to: 'cubeImgs' }, // Adjust the 'from' path as needed.
      ],
    }),
  ],
  // ... (other webpack configurations)
};
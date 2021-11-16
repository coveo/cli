import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {fileURLToPath} from 'url';
import {join, dirname} from 'path';
import {config} from 'dotenv';
config();

const isProd = process.env.NODE_ENV === 'production';

export default {
  mode: isProd ? 'production' : 'development',
  entry: ['./src/index.js', './src/style/index.css'],
  output: {clean: true},
  devServer: {
    static: {
      directory: join(dirname(fileURLToPath(import.meta.url)), 'dist'),
    },
    port: parseInt(process.env.PORT),
    hot: false,
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: false,
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      },
    ],
  },
};

require("es6-promise").polyfill();
require("url-search-params-polyfill");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: "production",
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true,
          },
        },
      }),
    ],
  },
  entry: [
    "whatwg-fetch",
    "@babel/polyfill",
    "url-search-params-polyfill",
    "./js/hawk.js",
    "./assets/css/hawksearch.css",
  ],
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: "hawksearch.min.css",
    //   chunkFilename: '[id].css',
    // }),
    new MiniCssExtractPlugin({
      // filename: "[name].css",
      // chunkFilename: "[id].css",
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, //3. Extract css into files
          // "style-loader",
          "css-loader", //2. Turns css into commonjs
          // "sass-loader" //1. Turns sass into css
        ],
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "imgs",
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".css"],
  },
  output: {
    path: __dirname + "/dist",
    publicPath: "/",
    filename: "bundle.js",
  },
  devServer: {
    contentBase: "./dist",
  },
};

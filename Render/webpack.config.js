const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path'); 
const webpack = require('webpack');

// the path(s) that should be cleaned 
let pathsToClean = ['dist']; //Dist is the front-end folder that express upload to the web

// the clean options to use
let cleanOptions = {
  // Verbose: true-> Write logs to console
  verbose: true,
  // Set dry: true for test/emulate file cleaning without removing files.
  dry: false
};

module.exports = {
  mode: "development", //Development or production mode.
  name: "Front-End main side, output to ./dist",
  entry: ["./src/frontend/index.js"],
  output: {
    filename: "./js-bundles/[name]-bundle.js"
  },
  resolve: {
    //TODO: Documentation
    alias: {
      jquery: "jquery/src/jquery"
    }
  },
  module: {
    rules: [
      // the url-loader uses DataUrls.
      // the file-loader emits files.
      //Load fonts with url loader.
      {
        test: /\.woff$/,
        loader:
          "url-loader?limit=65000&mimetype=application/font-woff&name=dist/fonts/[name].[ext]"
      },
      {
        test: /\.woff2$/,
        loader:
          "url-loader?limit=65000&mimetype=application/font-woff2&name=dist/fonts/[name].[ext]"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      },
      //Load less files
      { test: /\.less$/, loader: "style-loader!css-loader!less-loader" }, // use ! to chain loaders
      //Load css files
      { test: /\.css$/, loader: "style-loader!css-loader" },
      //Load html. (Required for some front-end modules)
      { test: /\.html$/, loader: "html-loader" }
    ]
  },
  //This makes the webbrowser debug possible mapping simulated source code files to generated bundle js file.
  //For more options (related to speed/correlation to original source code file) you can visit https://webpack.js.org/configuration/devtool/
  devtool: "cheap-module-eval-source-map",
  plugins: [
    //Plugin for clean 'dist/' folder before compile all the bundles and files again with webpack.
    new CleanWebpackPlugin(pathsToClean, cleanOptions),
    //Copy all files that webpack does not move from /frontend folder to /dist folder.
    new CopyWebpackPlugin([{ from: "**/*", to: "", ignore: ["*.js"] }], {
      context: "src/frontend/"
    })
  ]
};
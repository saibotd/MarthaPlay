const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const _ = require("lodash");

const production = process.env.NODE_ENV === "production";

const config = {
    mode: production ? "production" : "development",
    output: {
        path: path.resolve(__dirname, "public"),
        publicPath: "/public/",
        chunkFilename: "dist/[name].[chunkhash].js",
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|svg)$/,
                loader: {
                    loader: "file-loader",
                    options: {
                        outputPath: "/dist/",
                        publicPath: "../../dist/",
                    },
                },
            },
        ],
    },
    stats: {
        colors: true,
    },
    resolve: {
        alias: { "~": path.resolve(__dirname, "node_modules") },
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        }),
    ],
    devtool: "cheap-module-source-map",
};

if (production) {
    config.plugins.push(
        new webpack.optimize.AggressiveMergingPlugin({
            minSizeReduce: 1,
            moveToParents: true,
        })
    );
    config.devtool = undefined;
}

const loaderOptions = production
    ? {
          sourceMap: false,
          minimize: true,
      }
    : {
          sourceMap: true,
          minimize: false,
      };

class WebPackHelper {
    static createConfig(entry, outputFilename, rules, plugins = null) {
        const _config = _.cloneDeep(config);
        _config.entry = ["babel-polyfill", path.resolve("./src/", entry)];
        _config.output.filename = outputFilename;
        if (!Array.isArray(rules)) rules = [rules];
        _config.module.rules = _config.module.rules.concat(rules);
        if (plugins) {
            if (!Array.isArray(plugins)) plugins = [plugins];
            _config.plugins = _config.plugins.concat(plugins);
        }
        return _config;
    }

    static js(entry, outputFilename) {
        return WebPackHelper.createConfig(entry, outputFilename, [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{ loader: "babel-loader" }],
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{ loader: "css-loader", options: loaderOptions }],
                }),
            },
        ]);
    }

    static scss(entry, outputFilename) {
        return WebPackHelper.createConfig(
            entry,
            outputFilename,
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        { loader: "css-loader", options: loaderOptions },
                        { loader: "sass-loader", options: loaderOptions },
                    ],
                }),
            },
            new ExtractTextPlugin(outputFilename)
        );
    }
}

module.exports = WebPackHelper;

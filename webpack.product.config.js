/**
 * FileName: webpack.config
 * Auth: Linn
 * Created at: 2018/7/30
 * Description:
 */
require("babel-polyfill");
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const requestUrl = new webpack.DefinePlugin({
	requestUrl: JSON.stringify(process.env.DOMAIN||"http://10.200.0.207:8080/")
});

module.exports = {
	mode: "production",
	entry: ["babel-polyfill", "./src/index.js"],
	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: '/',
		filename: path.posix.join('static', 'js/[name].js'),//'[name].js',
		chunkFilename: path.posix.join('static', 'js/[name].js')//'[name].js'
	},
	resolve: {
		extensions: [".js", '.json', '.jsx', ".css"],
		alias: {
			Api: path.resolve(__dirname, "src/api/"),
			Configs: path.resolve(__dirname, "src/configs/"),
			Commons: path.resolve(__dirname, "src/commons/"),
			Pages: path.resolve(__dirname, "src/pages/"),
			react: path.resolve(__dirname, "node_modules", "react")
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: "html-loader",
						options: { minimize: false }
					}
				]
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: "file-loader",
						options: {}
					}
				]
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: "url-loader",
				options: {
					limit: 10000,
					name: "fonts/[name].[hash:10].[ext]"
				}
			},
			{
				test: /\.css$/,
				include: /node_modules/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"postcss-loader"
				]
			}
		]
	},
	optimization: {
		splitChunks: {
			cacheGroups:{
				commons: {
					chunks: "initial",
					minChunks: 2,
					maxInitialRequests: 5,
					minSize: 0
				},
				vendor: {
					test: /node_modules/,
					chunks: "initial",
					name: "vendor",
					priority: 10,
					enforce: true
				}
			}
		},
		runtimeChunk: {
			name: "manifest"
		},
		minimizer: [new UglifyJsPlugin({
			cache: true,
			uglifyOptions: {
				output: {
					comments: false,
					beautify: false
				},
				compress: {
					warnings: false
				}
			},
			parallel: true,
			sourceMap: false
		})]
	},
	plugins: [
		new CleanWebpackPlugin(path.resolve(__dirname, 'dist')),
		requestUrl,
		new webpack.optimize.ModuleConcatenationPlugin(),
		new OptimizeCSSPlugin(), //cssyasuo
		new HtmlWebPackPlugin({
			template: "index.html",
			filename: "index.html",
			title: 'LoRaWan3.0物联网系统',
		}),
		new CopyWebpackPlugin([{
			from: __dirname + "/static",
			to: __dirname + "/dist/static"
		}]),
		new MiniCssExtractPlugin({
			filename: "static/css/[name].css",
			chunkFilename: "static/css/[id].css"
		}),
		new webpack.NamedModulesPlugin()
	],
};
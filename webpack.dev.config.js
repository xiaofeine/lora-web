/**
 * FileName: webpack.config
 * Auth: Linn
 * Created at: 2018/7/30
 * Description:
 */
const webpack = require('webpack');
require("babel-polyfill");
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const requestUrl = new webpack.DefinePlugin({
	requestUrl: JSON.stringify(process.env.DOMAIN||'http://10.200.0.207:8000/')
});

module.exports = {
	mode: 'development',
	entry: ["babel-polyfill", "./src/index.js"],
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname),
		publicPath: '/'
	},
	resolve: {
		extensions: ['.js', '.json', '.jsx', '.css'],
		alias: {
			Api: path.resolve(__dirname, 'src/api/'),
			Configs: path.resolve(__dirname, 'src/configs/'),
			Commons: path.resolve(__dirname, 'src/commons/'),
			Pages: path.resolve(__dirname, 'src/pages/'),
			react: path.resolve(__dirname, 'node_modules', 'react'),
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["env","react", "stage-0"],
						plugins: [
							['import',{libraryName:'antd', style:'css'}]
						],
					}
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
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'fonts/[name].[ext]',
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					'postcss-loader'
				]
			},
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dev']),
		new HtmlWebPackPlugin({
			template: "./index.html",
			filename: "./index.html"
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new FriendlyErrorsPlugin(),
		requestUrl,
	],
	devServer:{
		contentBase: path.join(__dirname),
		compress: true,
		port: 8000,
		host: '0.0.0.0',
		hot: true,
		historyApiFallback: true,
		inline:true,
		progress: false,
		open: false
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					chunks: 'initial',
					minChunks: 2,
					maxInitialRequests: 5,
					minSize: 0
				},
				vendor: {
					test: /node_modules/,
					chunks: 'initial',
					name: 'vendor',
					priority: 10,
					enforce: true,
				}
			}
		},
		runtimeChunk: {
			name: 'runtime'
		}
	}
};

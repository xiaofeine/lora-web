/**
 * FileName: postcss.config
 * Auth: Linn
 * Created at: 2018/8/1
 * Description:
 */
module.exports = {
	plugins: [
		require('autoprefixer')({
			browsers: ['last 5 versions']
		})
	]
}
const { exec } = require('child_process');

module.exports = {
	files: {
		javascripts: {joinTo: 'app.js'}
		, stylesheets: {joinTo: 'app.css'}
	}
	, plugins: {
		babel: {
			presets: ['@babel/preset-env', ['minify', {builtIns: false}]],
			plugins: ["@babel/plugin-proposal-class-properties", "macros"]
		}
		, raw: {
			pattern: /\.tmp\.(.+)$/,
			wrapper: content => `module.exports = ${JSON.stringify(content)}`
		}
	}
	, paths: {
		public: './docs'
	}
	, npm: {
		styles: {
			'subspace-console': ['style/layout.css']
		}
	}
	, watcher: {
		awaitWriteFinish: true
	}
};

// module.exports.hooks = {
// 	preCompile: () => {
// 		console.log('About to compile...');
// 		exec(
// 			`npm link curvature subspace-console`
// 			, (err, stdout, stderr)=>{
// 				console.log(err);
// 				console.log(stdout);
// 				console.log(stderr);

// 				return Promise.resolve();
// 			}
// 		)
// 	}
// };

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
		, preval: {
			tokens: {
				BUILD_TIME:  Date.now() / 1000
				, BUILD_TAG: process.env.ENV_LOCK_TAG || 'notag'
				, BUILD_LOCALTIME: new Date
			}
			, log: true
		}
		, raw: {
			pattern: /\.tmp\.(.+)$/,
			wrapper: content => `module.exports = ${JSON.stringify(content)}`
		}
		, terser: {
			ignored: /php-web.js/,
		}
	}
	, npm: {
		styles: {
			'subspace-console': ['style/layout.css']
			, 'highlight.js':   ['styles/default.css']
		}
	}
	, paths: { public: './docs'	}
	, watcher: { awaitWriteFinish: true }
};

module.exports.hooks = {
	preCompile: () => {
		console.log('About to compile...');
		exec(
			`npm link curvature subspace-console cv-markdown php-wasm`
			, (err, stdout, stderr)=>{
				console.log(err);
				console.log(stdout);
				console.log(stderr);

				return Promise.resolve();
			}
		)
	}
};

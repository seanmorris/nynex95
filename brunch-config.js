module.exports = {
	files: {
		javascripts: {joinTo: 'app.js'}
		, stylesheets: {joinTo: 'app.css'}
	}
	, plugins: {
		babel: {
			presets:   ['@babel/preset-env']
			, plugins: ["@babel/plugin-proposal-class-properties"]
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


exports.hooks = {
	preCompile: () => {
		console.log('About to compile...');
		exec(
			`pushd ../curvature-2 && npm link && popd && npm link curvature`
			, (err, stdout, stderr)=>{
				console.log(err);
				console.log(stdout);
				console.log(stderr);

				return Promise.resolve();
			}
		)
	}
};

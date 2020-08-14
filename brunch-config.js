module.exports = {
	files: {
		javascripts: {joinTo: 'app.js'}
		, stylesheets: {joinTo: 'app.css'}
	}
	, paths: {
		public: 'docs/'
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
};

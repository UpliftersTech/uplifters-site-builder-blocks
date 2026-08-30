const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const defaultEntry = typeof defaultConfig.entry === 'function'
	? defaultConfig.entry()
	: defaultConfig.entry || {};

module.exports = {
	...defaultConfig,
	entry: {
		...defaultEntry,
		// Source stays in src/dashboard-interface, and output matches the PHP enqueue path:
		// build/dashboard-interface/dashboard-controller.js
		'dashboard-interface/dashboard-controller': path.resolve(
			process.cwd(),
			'src/dashboard-interface/dashboard-controller.js'
		),
	},
	output: {
		...defaultConfig.output,
		filename: '[name].js',
	},
};

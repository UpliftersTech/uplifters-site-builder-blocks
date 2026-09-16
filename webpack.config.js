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
		// The inserter previews are shared by all 42 blocks. wp-scripts gives
		// each block its own webpack entry, and webpack cannot share a module
		// between entries, so importing the previews from a block's edit.js
		// duplicated the whole preview set — and motion/react with it — 42
		// times. Building them once here and publishing the registry on a
		// global keeps every block bundle down to just its own code.
		'blocks-inserter-preview/inserter-preview': path.resolve(
			process.cwd(),
			'src/blocks-inserter-preview/inserter-preview-entry.js'
		),
	},
	output: {
		...defaultConfig.output,
		filename: '[name].js',
	},
};

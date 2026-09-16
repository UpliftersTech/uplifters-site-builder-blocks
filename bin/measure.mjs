/**
 * Dependency-free build-size measurement.
 *
 * Emits the same JSON shape on every run so any two points in the size
 * refactor can be diffed directly:
 *
 *   node bin/measure.mjs                 print table, write .perf/current.json
 *   node bin/measure.mjs --out FILE      write somewhere else
 *   node bin/measure.mjs --json          print the JSON instead of the table
 *   node bin/measure.mjs --against FILE  print a before/after delta table
 */

import {
	readdirSync,
	statSync,
	readFileSync,
	writeFileSync,
	mkdirSync,
	existsSync,
} from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join( dirname( fileURLToPath( import.meta.url ) ), '..' );
const BUILD = join( ROOT, 'build' );

/** Per-block assets tracked individually, because each belongs to its own phase. */
const TRACKED = [
	'index.js',
	'index.css',
	'index-rtl.css',
	'style-index.css',
	'view.js',
	'render.php',
];

/** Marker proving Motion's runtime is present in a bundle (see Phase 1). */
const MOTION_MARKER = 'bindToMotionValue';

/**
 * Every file under a directory, recursively.
 *
 * @param {string} dir Directory to walk.
 * @return {string[]} Relative file paths, POSIX-separated.
 */
function walk( dir ) {
	const out = [];

	for ( const entry of readdirSync( dir, { withFileTypes: true } ) ) {
		if ( entry.isDirectory() ) {
			out.push(
				...walk( join( dir, entry.name ) ).map( ( p ) => entry.name + '/' + p )
			);
		} else if ( entry.isFile() ) {
			out.push( entry.name );
		}
	}

	return out;
}

/**
 * Size of a file in bytes, or null when it does not exist.
 *
 * @param {string} file Absolute path.
 * @return {number|null} Byte size.
 */
function sizeOf( file ) {
	try {
		return statSync( file ).size;
	} catch {
		return null;
	}
}

/**
 * Whether a built file still carries Motion's runtime.
 *
 * @param {string} file Absolute path.
 * @return {boolean} True when the marker is present.
 */
function hasMotion( file ) {
	try {
		return readFileSync( file, 'utf8' ).includes( MOTION_MARKER );
	} catch {
		return false;
	}
}

/**
 * Collect the full measurement for the current build directory.
 *
 * @return {Object} Measurement record.
 */
function measure() {
	if ( ! existsSync( BUILD ) ) {
		throw new Error( 'build/ does not exist. Run `npm run build` first.' );
	}

	const allFiles = walk( BUILD );

	const totals = {
		buildBytes: 0,
		buildFiles: allFiles.length,
		mapBytes: 0,
		mapFiles: 0,
		jsBytes: 0,
		cssBytes: 0,
		phpBytes: 0,
	};

	for ( const rel of allFiles ) {
		const bytes = sizeOf( join( BUILD, rel ) ) || 0;
		totals.buildBytes += bytes;

		if ( rel.endsWith( '.map' ) ) {
			totals.mapBytes += bytes;
			totals.mapFiles += 1;
		} else if ( rel.endsWith( '.js' ) ) {
			totals.jsBytes += bytes;
		} else if ( rel.endsWith( '.css' ) ) {
			totals.cssBytes += bytes;
		} else if ( rel.endsWith( '.php' ) ) {
			totals.phpBytes += bytes;
		}
	}

	const blocksDir = join( BUILD, 'blocks' );
	const blockNames = existsSync( blocksDir )
		? readdirSync( blocksDir, { withFileTypes: true } )
				.filter( ( e ) => e.isDirectory() )
				.map( ( e ) => e.name )
				.sort()
		: [];

	const blocks = {};
	let emptyViewJs = 0;
	let emptyStyleIndexCss = 0;
	let motionBundles = 0;

	for ( const name of blockNames ) {
		const record = {};

		for ( const asset of TRACKED ) {
			record[ asset ] = sizeOf( join( blocksDir, name, asset ) );
		}

		if ( null !== record[ 'view.js' ] && record[ 'view.js' ] < 2 ) {
			emptyViewJs += 1;
		}
		if ( null !== record[ 'style-index.css' ] && record[ 'style-index.css' ] <= 1 ) {
			emptyStyleIndexCss += 1;
		}

		record.motionInIndexJs = hasMotion( join( blocksDir, name, 'index.js' ) );
		if ( record.motionInIndexJs ) {
			motionBundles += 1;
		}

		blocks[ name ] = record;
	}

	// Motion can hide in any built file, not only a block's index.js.
	const motionFiles = allFiles
		.filter(
			( rel ) =>
				rel.endsWith( '.js' ) && hasMotion( join( BUILD, rel ) )
		)
		.sort();

	const editorBundles = blockNames
		.map( ( n ) => blocks[ n ][ 'index.js' ] )
		.filter( ( n ) => 'number' === typeof n );

	const sum = ( list ) => list.reduce( ( a, b ) => a + b, 0 );

	return {
		measuredAt: new Date().toISOString(),
		totals,
		blockCount: blockNames.length,
		summary: {
			editorJsTotal: sum( editorBundles ),
			editorJsLargest: editorBundles.length ? Math.max( ...editorBundles ) : 0,
			editorJsMean: editorBundles.length
				? Math.round( sum( editorBundles ) / editorBundles.length )
				: 0,
			cssTotal: sum(
				blockNames.flatMap( ( n ) =>
					[ 'index.css', 'index-rtl.css', 'style-index.css' ]
						.map( ( a ) => blocks[ n ][ a ] )
						.filter( ( v ) => 'number' === typeof v )
				)
			),
			renderPhpTotal: sum(
				blockNames
					.map( ( n ) => blocks[ n ][ 'render.php' ] )
					.filter( ( v ) => 'number' === typeof v )
			),
			emptyViewJs,
			emptyStyleIndexCss,
			motionBundles,
		},
		motionFiles,
		blocks,
	};
}

/**
 * Human-readable byte size.
 *
 * @param {number|null} bytes Byte count.
 * @return {string} Formatted size.
 */
function fmt( bytes ) {
	if ( null === bytes || undefined === bytes ) {
		return '-';
	}
	if ( Math.abs( bytes ) < 1024 ) {
		return bytes + ' B';
	}
	if ( Math.abs( bytes ) < 1024 * 1024 ) {
		return ( bytes / 1024 ).toFixed( 1 ) + ' KB';
	}
	return ( bytes / 1024 / 1024 ).toFixed( 2 ) + ' MB';
}

/**
 * Print the summary table for one measurement.
 *
 * @param {Object} data Measurement record.
 */
function printTable( data ) {
	const { totals, summary } = data;

	const rows = [
		[ 'Blocks built', String( data.blockCount ) ],
		[ 'Total build/', fmt( totals.buildBytes ) ],
		[ '  of which .map', fmt( totals.mapBytes ) + ' (' + totals.mapFiles + ' files)' ],
		[ '  of which .js', fmt( totals.jsBytes ) ],
		[ '  of which .css', fmt( totals.cssBytes ) ],
		[ '  of which .php', fmt( totals.phpBytes ) ],
		[ 'Block editor JS total', fmt( summary.editorJsTotal ) ],
		[ '  largest bundle', fmt( summary.editorJsLargest ) ],
		[ '  mean bundle', fmt( summary.editorJsMean ) ],
		[ 'Block CSS total', fmt( summary.cssTotal ) ],
		[ 'render.php total', fmt( summary.renderPhpTotal ) ],
		[ 'Blocks with empty view.js', String( summary.emptyViewJs ) ],
		[ 'Blocks with empty style-index.css', String( summary.emptyStyleIndexCss ) ],
		[ 'Bundles containing Motion', String( summary.motionBundles ) ],
		[ 'Built files containing Motion', String( data.motionFiles.length ) ],
	];

	const width = Math.max( ...rows.map( ( r ) => r[ 0 ].length ) );
	for ( const [ label, value ] of rows ) {
		process.stdout.write( label.padEnd( width ) + '  ' + value + '\n' );
	}
}

/**
 * Print a before/after comparison table.
 *
 * @param {Object} before Earlier measurement.
 * @param {Object} after  Current measurement.
 */
function printDelta( before, after ) {
	// `count` metrics are tallies, not byte sizes, so they skip `fmt()`.
	const metrics = [
		[ 'Total build/', ( d ) => d.totals.buildBytes ],
		[ 'Editor JS total', ( d ) => d.summary.editorJsTotal ],
		[ 'Largest bundle', ( d ) => d.summary.editorJsLargest ],
		[ 'Mean bundle', ( d ) => d.summary.editorJsMean ],
		[ 'Block CSS total', ( d ) => d.summary.cssTotal ],
		[ 'render.php total', ( d ) => d.summary.renderPhpTotal ],
		[ 'Motion bundles', ( d ) => d.summary.motionBundles, 'count' ],
		[ 'Empty view.js', ( d ) => d.summary.emptyViewJs, 'count' ],
	];

	const width = Math.max( ...metrics.map( ( m ) => m[ 0 ].length ) );
	for ( const [ label, get, kind ] of metrics ) {
		const a = get( before );
		const b = get( after );
		const show = 'count' === kind ? String : fmt;
		const pct = a ? ' (' + ( ( ( b - a ) / a ) * 100 ).toFixed( 1 ) + '%)' : '';
		process.stdout.write(
			label.padEnd( width ) +
				'  ' +
				show( a ).padStart( 10 ) +
				' -> ' +
				show( b ).padStart( 10 ) +
				'  ' +
				show( b - a ).padStart( 10 ) +
				pct +
				'\n'
		);
	}
}

const args = process.argv.slice( 2 );

/**
 * Value following a CLI flag.
 *
 * @param {string} flag Flag name.
 * @return {string|null} The value, or null when absent.
 */
function argOf( flag ) {
	const i = args.indexOf( flag );
	return -1 === i ? null : args[ i + 1 ];
}

const data = measure();
const outPath = argOf( '--out' ) || join( ROOT, '.perf', 'current.json' );

mkdirSync( dirname( outPath ), { recursive: true } );
writeFileSync( outPath, JSON.stringify( data, null, '\t' ) + '\n' );

if ( args.includes( '--json' ) ) {
	process.stdout.write( JSON.stringify( data, null, '\t' ) + '\n' );
} else {
	printTable( data );

	const against = argOf( '--against' );
	if ( against ) {
		process.stdout.write( '\n' );
		printDelta( JSON.parse( readFileSync( against, 'utf8' ) ), data );
	}

	process.stdout.write(
		'\nWrote ' + relative( ROOT, outPath ).split( sep ).join( '/' ) + '\n'
	);
}

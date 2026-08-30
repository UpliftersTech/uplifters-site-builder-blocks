/**
 * Shared style primitives, small building blocks, and Motion helpers reused
 * across the per-block inserter preview files in this directory.
 *
 * Sizing is container-relative, not pixel-fixed: `frame` establishes a query
 * container (`containerType: 'inline-size'`) and sets its own font-size from
 * `cqw` (a percentage of the *preview's own* rendered width, clamped to a
 * sane range). Every other primitive here sizes itself in `em`/`%` off that
 * one root value, so the whole preview scales fluidly with the container —
 * tiny inserter thumbnail or a large hover panel — with no media queries.
 */

import { useEffect, useState } from '@wordpress/element';
import { motion } from 'motion/react';

/**
 * Standard easing curve used for every inserter-preview animation so the
 * whole panel feels like one consistent system rather than 41 one-offs.
 */
export const EASE = [ 0.22, 1, 0.36, 1 ];

/**
 * clamp( min px, preferred cqw, max px ) — the one place that ties every
 * preview's scale to the container's actual rendered width.
 */
function cq( minPx, vwCq, maxPx ) {
	return `clamp(${ minPx }px, ${ vwCq }cqw, ${ maxPx }px)`;
}

/**
 * Cycles through `0..length-1` on a timer so a preview can demonstrate
 * discrete states (which accordion item is open, which slide is active…)
 * without wiring up per-block interval logic.
 */
export function useLoopIndex( length, interval = 1600 ) {
	const [ index, setIndex ] = useState( 0 );

	useEffect( () => {
		if ( length <= 1 ) {
			return undefined;
		}

		const id = window.setInterval( () => {
			setIndex( ( current ) => ( current + 1 ) % length );
		}, interval );

		return () => window.clearInterval( id );
	}, [ length, interval ] );

	return index;
}

/**
 * Outer card. Fills 100% of whatever box the inserter gives it (width AND
 * height) instead of floating a small fixed-height box inside a larger,
 * mostly-empty area.
 */
export const frame = {
	boxSizing: 'border-box',
	width: '100%',
	height: '100%',
	// Whenever the inserter gives this component an indefinite height (so
	// `height: 100%` above resolves to `auto`), fall back to a height derived
	// from our own width instead of collapsing to 0 — this is what caused
	// some previews to render as an empty sliver.
	aspectRatio: '16 / 10',
	display: 'flex',
	flexDirection: 'column',
	containerType: 'inline-size',
	padding: cq( 10, 5, 22 ),
	border: '1px solid #dbe3ec',
	borderRadius: cq( 8, 3, 16 ),
	background: '#fff',
	color: '#172033',
	fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontSize: cq( 12, 6.4, 30 ),
	overflow: 'hidden',
};

/**
 * The main demo area inside a frame: grows to fill all remaining space
 * (after any label/eyebrow text) and centers its content, so the animated
 * subject is always the dominant, obvious thing in the preview.
 */
export const stage = {
	flex: '1 1 auto',
	minHeight: 0,
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '0.6em',
};

export const row = {
	display: 'flex',
	alignItems: 'center',
	gap: '0.7em',
};

/**
 * A large rectangular media placeholder meant to grow inside a flex stage
 * (`flex: 1`) rather than claim a fixed pixel height, so it always fills the
 * space the preview actually has.
 */
export const imageTile = {
	flex: '1 1 auto',
	width: '100%',
	minHeight: 0,
	borderRadius: '0.5em',
	background:
		'linear-gradient(135deg, #dbeafe 0%, #c7d2fe 48%, #e9d5ff 100%)',
	display: 'grid',
	placeItems: 'center',
	color: '#475569',
	fontSize: '2em',
};

export const title = { margin: 0, fontSize: '1.5em', lineHeight: 1.2, fontWeight: 700 };
export const muted = {
	margin: '0.4em 0 0',
	color: '#64748b',
	fontSize: '0.78em',
	lineHeight: 1.4,
};
export const chip = {
	padding: '0.55em 0.9em',
	borderRadius: '0.5em',
	fontSize: '0.82em',
	fontWeight: 650,
};
export const eyebrow = {
	margin: '0 0 0.5em',
	fontSize: '0.7em',
	letterSpacing: 0.4,
	textTransform: 'uppercase',
	color: '#94a3b8',
};

export function Brand() {
	return (
		<div style={ row }>
			<div
				style={ {
					width: '1.9em',
					height: '1.9em',
					borderRadius: '0.5em',
					background: '#2563eb',
					color: '#fff',
					display: 'grid',
					placeItems: 'center',
					fontWeight: 800,
					flexShrink: 0,
				} }
			>
				u
			</div>
			<strong style={ { fontSize: '1.1em' } }>Your Site</strong>
		</div>
	);
}

export function Avatar( { size = '2.6em', tone = '#c7d2fe', style } ) {
	return (
		<div
			style={ {
				width: size,
				height: size,
				borderRadius: '50%',
				background: tone,
				flexShrink: 0,
				...style,
			} }
		/>
	);
}

export function Dots( { count = 3, active = 0 } ) {
	return (
		<div style={ { ...row, justifyContent: 'center', gap: '0.5em' } }>
			{ Array.from( { length: count } ).map( ( _, i ) => (
				<motion.span
					key={ i }
					animate={ {
						background: i === active ? '#2563eb' : '#cbd5e1',
						scale: i === active ? 1.3 : 1,
					} }
					transition={ { duration: 0.3, ease: EASE } }
					style={ {
						width: '0.55em',
						height: '0.55em',
						borderRadius: '50%',
						flexShrink: 0,
					} }
				/>
			) ) }
		</div>
	);
}

/**
 * Drop-in replacement for the small slice of `motion/react` that the inserter
 * previews actually use.
 *
 * Why this exists: every block's editor bundle imported `motion/react`, and
 * webpack has no way to share a module across separate entry points, so the
 * whole library was duplicated once per block (~142 KB x 46 = ~6.5 MB).
 *
 * The previews only ever animate discrete state changes driven by React
 * (`useLoopIndex` flips an index, the component re-renders with new `animate`
 * values). That is exactly what a CSS transition does — so the same visual
 * result needs no animation library at all.
 *
 * Supported: motion.<tag> with `initial`, `animate`, `transition`
 * ({ duration, delay, ease }), `AnimatePresence` (mount/unmount without exit
 * tweens), and `useReducedMotion`. Anything beyond that (springs, gestures,
 * layout/FLIP, variants) is intentionally not supported — no preview needs it.
 */

import { createElement, forwardRef, useEffect, useState } from '@wordpress/element';

/**
 * Keys that belong inside a single `transform` value rather than being their
 * own CSS property, mapped to the transform function they produce.
 */
const TRANSFORM_FNS = {
	x: 'translateX',
	y: 'translateY',
	z: 'translateZ',
	scale: 'scale',
	scaleX: 'scaleX',
	scaleY: 'scaleY',
	rotate: 'rotate',
	rotateX: 'rotateX',
	rotateY: 'rotateY',
	skewX: 'skewX',
	skewY: 'skewY',
};

/** Transform functions whose numeric value is an angle, not a length. */
const ANGLE_FNS = new Set( [ 'rotate', 'rotateX', 'rotateY', 'skewX', 'skewY' ] );

/** Transform functions whose numeric value is a bare ratio. */
const RATIO_FNS = new Set( [ 'scale', 'scaleX', 'scaleY' ] );

/** CSS properties that take a bare number, so never get a `px` suffix. */
const UNITLESS_CSS = new Set( [
	'opacity',
	'zIndex',
	'flex',
	'flexGrow',
	'flexShrink',
	'fontWeight',
	'lineHeight',
	'order',
	'zoom',
] );

/** Props consumed by this shim — they must never reach the DOM. */
const MOTION_PROPS = [
	'initial',
	'animate',
	'exit',
	'transition',
	'variants',
	'layout',
	'layoutId',
	'whileHover',
	'whileTap',
	'whileInView',
	'viewport',
	'drag',
	'onAnimationComplete',
];

/**
 * Turn a Motion-style transform key/value into a CSS transform function call.
 *
 * @param {string}        key   Transform key, e.g. 'x' or 'scale'.
 * @param {number|string} value Raw value from the `animate` object.
 * @return {string} A transform function, e.g. 'translateX(12px)'.
 */
function transformFn( key, value ) {
	const fn = TRANSFORM_FNS[ key ];

	if ( typeof value !== 'number' ) {
		return `${ fn }(${ value })`;
	}

	if ( RATIO_FNS.has( key ) ) {
		return `${ fn }(${ value })`;
	}

	if ( ANGLE_FNS.has( key ) ) {
		return `${ fn }(${ value }deg)`;
	}

	return `${ fn }(${ value }px)`;
}

/**
 * Convert Motion's `ease` (array of 4 bezier control points, or a keyword)
 * into a CSS timing function.
 *
 * @param {Array|string|undefined} ease Motion easing value.
 * @return {string} CSS timing function.
 */
function toTimingFunction( ease ) {
	if ( Array.isArray( ease ) && 4 === ease.length ) {
		return `cubic-bezier(${ ease.join( ',' ) })`;
	}

	if ( 'string' === typeof ease ) {
		return 'easeInOut' === ease
			? 'ease-in-out'
			: ease.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
	}

	return 'ease';
}

/**
 * Build the inline style object for one render pass.
 *
 * `initial` and `animate` are merged, with `animate` winning — React re-renders
 * whenever the preview's state changes, and the browser tweens between the old
 * and new values using the `transition` shorthand we emit alongside them.
 *
 * @param {Object} props            Component props.
 * @param {Object} props.initial    Starting values (first render only).
 * @param {Object} props.animate    Target values.
 * @param {Object} props.transition Timing options.
 * @param {Object} props.style      Author's own static styles.
 * @param {boolean} props.isFirst   Whether this is the initial mount.
 * @return {Object} React style object.
 */
function buildStyle( { initial, animate, transition = {}, style, isFirst } ) {
	const source = isFirst && initial ? { ...animate, ...initial } : { ...animate };
	const out = { ...style };
	const transforms = [];
	const animated = [];

	Object.keys( source ).forEach( ( key ) => {
		const value = source[ key ];

		if ( TRANSFORM_FNS[ key ] ) {
			transforms.push( transformFn( key, value ) );
			return;
		}

		out[ key ] =
			'number' === typeof value && ! UNITLESS_CSS.has( key ) ? `${ value }px` : value;

		// camelCase -> kebab-case for the transition property list.
		animated.push( key.replace( /([a-z0-9])([A-Z])/g, '$1-$2' ).toLowerCase() );
	} );

	if ( transforms.length ) {
		out.transform = transforms.join( ' ' );
		animated.push( 'transform' );
	}

	if ( animated.length ) {
		const duration = undefined === transition.duration ? 0.3 : transition.duration;
		const delay = transition.delay || 0;
		const timing = toTimingFunction( transition.ease );

		// Only the properties actually being animated — never `all`, which
		// forces the browser to watch every computed property on the element.
		out.transition = animated
			.map( ( prop ) => `${ prop } ${ duration }s ${ timing } ${ delay }s` )
			.join( ',' );
	}

	return out;
}

/**
 * Create a `motion.<tag>` component for one DOM tag.
 *
 * @param {string} tag DOM tag name.
 * @return {Function} React component.
 */
function createMotionTag( tag ) {
	const Component = forwardRef( function MotionTag( props, ref ) {
		const [ isFirst, setIsFirst ] = useState( true );

		useEffect( () => {
			if ( isFirst ) {
				// Next frame: swap `initial` out for `animate` so the browser
				// has a previous value to transition from.
				const id = window.requestAnimationFrame( () => setIsFirst( false ) );
				return () => window.cancelAnimationFrame( id );
			}
			return undefined;
		}, [ isFirst ] );

		const domProps = { ...props, ref };
		MOTION_PROPS.forEach( ( key ) => delete domProps[ key ] );

		domProps.style = buildStyle( {
			initial: props.initial,
			animate: props.animate,
			transition: props.transition,
			style: props.style,
			isFirst,
		} );

		return createElement( tag, domProps );
	} );

	Component.displayName = `motion.${ tag }`;

	return Component;
}

const cache = {};

/**
 * `motion.div`, `motion.span`, `motion.p`, … created lazily on first access,
 * matching the ergonomics of the real library.
 */
export const motion = new Proxy(
	{},
	{
		get( _target, tag ) {
			if ( 'string' !== typeof tag ) {
				return undefined;
			}
			if ( ! cache[ tag ] ) {
				cache[ tag ] = createMotionTag( tag );
			}
			return cache[ tag ];
		},
	}
);

/**
 * Passthrough stand-in. Previews mount and unmount children through normal
 * React conditionals; exit tweens are not worth a library for a thumbnail.
 *
 * @param {Object} props          Component props.
 * @param {*}      props.children Children to render.
 * @return {*} The children.
 */
export function AnimatePresence( { children } ) {
	return children;
}

/**
 * Mirrors Motion's hook so callers do not need changing.
 *
 * @return {boolean} Whether the user asked for reduced motion.
 */
export function useReducedMotion() {
	const [ reduced, setReduced ] = useState( () => {
		if ( 'undefined' === typeof window || ! window.matchMedia ) {
			return false;
		}
		return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	} );

	useEffect( () => {
		if ( 'undefined' === typeof window || ! window.matchMedia ) {
			return undefined;
		}

		const query = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const onChange = ( event ) => setReduced( event.matches );

		query.addEventListener( 'change', onChange );
		return () => query.removeEventListener( 'change', onChange );
	}, [] );

	return reduced;
}

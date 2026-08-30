/**
 * Reusable Uplifters Website Builder logo.
 *
 * One shared SVG definition, rendered either as a native SVG DOM element or
 * as a wp.element tree. It is applied to this plugin's block categories on
 * load, and exported for any other editor surface that needs it.
 *
 * The admin sidebar menu icon is NOT handled here. That icon is emitted by
 * PHP as an SVG data URI on add_menu_page(), so it exists before JavaScript
 * runs and no core admin markup is rewritten at runtime. Injecting a second
 * mark into that menu item would sit on top of the PHP one and fill in the
 * arrow gap, so this module deliberately stays out of the sidebar.
 *
 * The arrow cutout is baked into MARK_PATH rather than punched out with a
 * <mask> at paint time. The geometry is the boolean result of U minus arrow:
 * two closed rings with the arrow channel running clean between them. Since
 * the arrow region belongs to no ring, nothing can paint it at any point in
 * the render, and there is no id to resolve and no compositing step to wait
 * on.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */
(function (window, document) {
	'use strict';

	if (!window || !document) {
		return;
	}

	var SVG_NS = 'http://www.w3.org/2000/svg';
	var VIEW_BOX = '-50.7 -68.2 676.5 676.5';
	var CATEGORY_SLUGS = [
		'uplifters-site-builder-blocks-gene',
		'uplifters-site-builder-blocks-text',
		'uplifters-site-builder-blocks-layout',
	];

	/**
	 * Mark outline with the arrow already subtracted.
	 *
	 * Ring 1 is the left arm. Ring 2 is the right arm plus the bowl. Kept
	 * byte-identical to DashboardSidebarMenuRegister::MARK_PATH in dashboard-sidebar-menu-register.php;
	 * change both together.
	 */
	var MARK_PATH = 'M82 76.1L82 330.3L82.3 342.8L83.1 352.6L84.3 362.1L86 371.4L88 380.4L90.6 389.1L93.5 397.5L96.9 405.6L100.7 413.5L120.1 411.6L139.2 408.9L157.9 405.1L176.3 400.4L194.1 394.8L211.5 388.3L228.4 380.8L244.7 372.5L252.4 368.1L250.1 359.1L248.2 348.9L247 337.2L246.2 324.3L246 311.4L246 74.1L245.6 69.1L244.8 64.4L243.4 59.9L241.5 55.8L239.5 52.7L237.2 49.9L234.6 47.4L231.7 45.2L228.5 43.4L225.2 42L221.6 40.9L217.8 40.3L213.2 40L118 40L112.4 40.3L105.9 41.7L99.9 44.2L97.1 45.7L94.6 47.6L90.2 51.8L88.3 54.3L86.7 56.9L85.2 59.8L84.1 62.8L82.5 69.1Z' +
		'M172.3 478.6L181 482.2L190 485.5L199.4 488.5L209.1 491.1L219.2 493.4L229.6 495.3L240.4 496.9L251.5 498.2L263.5 499.2L275.7 499.8L288.4 500L301.5 499.9L314.1 499.4L326.2 498.5L337.9 497.4L349.3 495.8L359.3 494.1L369 492.1L378.3 489.8L387.3 487.2L395.9 484.3L404.2 481.1L412.1 477.7L419.6 473.9L426.7 469.9L433.5 465.5L439.9 460.9L446 456L451.7 450.8L457 445.3L462 439.5L466.6 433.4L472.4 424.5L477.5 415L481.8 405L485.4 394.5L488.4 383.4L490.6 371.7L492.1 359.5L492.9 346.8L492.9 73.7L492.6 69.5L491.8 65.3L490.6 61.4L489 57.7L487.1 54.4L484.8 51.3L482.2 48.6L479.3 46.2L475.2 43.8L470.8 42L465.9 40.7L460.8 40.1L375.3 40.1L371.2 40.5L367.1 41.4L363.3 42.6L359.6 44.2L356.4 46.2L353.3 48.6L350.6 51.2L348.2 54.1L345.6 58.5L343.7 63.2L342.5 68.4L342 73.9L342 288.9L347.3 281.6L352.2 274.1L356.9 266.5L361.3 258.7L365.5 250.8L369.4 242.6L373 234.4L376.4 225.9L380.5 215L384 204.6L387 194.6L389.6 185L391.7 175.8L393.3 167.1L394.4 158.7L395 151L350 166L425 63L492 162L448 148L446.8 163.9L444.7 180L441.9 196.2L438.1 212.6L433.6 229.1L428.2 245.8L422 262.6L415.1 279L408.3 293.3L400.9 307.1L392.9 320.6L384.2 333.8L374.9 346.5L364.9 358.9L354.4 370.9L343.2 382.5L334.2 391.1L324.9 399.4L315.2 407.5L305.2 415.4L294.7 423L284 430.3L273.7 436.9L263.2 443L252.6 448.8L241.8 454.1L230.7 459.1L219.5 463.8L208.2 467.9L196.7 471.8L185.4 475.1Z';

	/**
	 * SVG attribute names that wp.element (React) expects in camelCase.
	 *
	 * Names already camelCase in the SVG spec (gradientUnits,
	 * gradientTransform, stdDeviation, viewBox) pass through unchanged.
	 */
	var REACT_PROP_NAMES = {
		'class': 'className',
		'color-interpolation-filters': 'colorInterpolationFilters',
		'flood-color': 'floodColor',
		'flood-opacity': 'floodOpacity',
		'stop-color': 'stopColor',
		'stop-opacity': 'stopOpacity',
	};

	var logoInstance = 0;

	function getWp() {
		// Read lazily. This script can parse before wp.blocks is defined.
		return window.wp || null;
	}

	function nextIds(prefix) {
		logoInstance += 1;

		return {
			gradient: prefix + '-gradient-' + logoInstance,
			shadow: prefix + '-shadow-' + logoInstance,
		};
	}

	/* -------------------------------------------------------------------- */
	/* Renderer-agnostic node description                                    */
	/* -------------------------------------------------------------------- */

	function node(name, attributes, children) {
		return {
			name: name,
			attributes: attributes || {},
			children: children || [],
		};
	}

	function stop(offset, color) {
		return node('stop', { offset: offset, 'stop-color': color });
	}

	/**
	 * Describe the complete logo as a plain tree.
	 *
	 * @param {Object} ids      Unique id map for this instance.
	 * @param {Object} settings Size and class options.
	 * @return {Object} Node tree.
	 */
	function buildTree(ids, settings) {
		var size = String(settings.size || 24);
		var svgAttributes = {
			width: size,
			height: size,
			viewBox: VIEW_BOX,
			fill: 'none',
			xmlns: SVG_NS,
			// Decorative: the category name carries the meaning.
			'aria-hidden': 'true',
			focusable: 'false',
		};

		if (settings.className) {
			svgAttributes['class'] = settings.className;
		}

		var defs = node('defs', null, [
			node('linearGradient', {
				id: ids.gradient,
				x1: '122', y1: '38', x2: '445', y2: '500',
				gradientUnits: 'userSpaceOnUse',
			}, [
				stop('0', '#4fe2ff'),
				stop('0.27', '#20b7f7'),
				stop('0.60', '#087ce7'),
				stop('1', '#043eb8'),
			]),
			node('filter', {
				id: ids.shadow,
				x: '-25%', y: '-20%', width: '150%', height: '165%',
				'color-interpolation-filters': 'sRGB',
			}, [
				node('feDropShadow', {
					dx: '0', dy: '6', stdDeviation: '9',
					'flood-color': '#00349b', 'flood-opacity': '0.28',
				}),
			]),
		]);

		// A single path. The shadow follows the cut outline, including the
		// inner edges of the arrow channel.
		var mark = node('path', {
			d: MARK_PATH,
			fill: 'url(#' + ids.gradient + ')',
			filter: 'url(#' + ids.shadow + ')',
		});

		return node('svg', svgAttributes, [defs, mark]);
	}

	/* -------------------------------------------------------------------- */
	/* Renderers                                                             */
	/* -------------------------------------------------------------------- */

	function toDomElement(tree) {
		var element = document.createElementNS(SVG_NS, tree.name);

		Object.keys(tree.attributes).forEach(function (name) {
			element.setAttribute(name, tree.attributes[name]);
		});

		tree.children.forEach(function (child) {
			element.appendChild(toDomElement(child));
		});

		return element;
	}

	function toWpElement(createElement, tree, key) {
		var props = {};

		if (typeof key !== 'undefined') {
			props.key = key;
		}

		Object.keys(tree.attributes).forEach(function (name) {
			props[REACT_PROP_NAMES[name] || name] = tree.attributes[name];
		});

		return createElement(
			tree.name,
			props,
			tree.children.map(function (child, index) {
				return toWpElement(createElement, child, String(index));
			})
		);
	}

	/**
	 * Create the logo as a native SVG DOM element.
	 *
	 * @param {Object} options Logo options: size, className, idPrefix.
	 * @return {SVGElement} SVG logo element.
	 */
	function createSvgElement(options) {
		var settings = options || {};
		var ids = nextIds(settings.idPrefix || 'uplifters-site-builder-blocks-logo');

		return toDomElement(buildTree(ids, settings));
	}

	/**
	 * Create the logo as a Gutenberg-compatible element.
	 *
	 * @return {Object|null} WordPress element, or null when wp.element is absent.
	 */
	function createWpElement() {
		var wp = getWp();

		if (!wp || !wp.element || typeof wp.element.createElement !== 'function') {
			return null;
		}

		var ids = nextIds('uplifters-site-builder-blocks-category');

		return toWpElement(wp.element.createElement, buildTree(ids, { size: 24 }));
	}

	/* -------------------------------------------------------------------- */
	/* Block category icons                                                  */
	/* -------------------------------------------------------------------- */

	/**
	 * Apply the logo to this plugin's registered block categories.
	 */
	function updateBlockCategories() {
		var wp = getWp();

		if (
			!wp || !wp.blocks ||
			typeof wp.blocks.updateCategory !== 'function' ||
			typeof wp.blocks.getCategories !== 'function'
		) {
			return;
		}

		var registered = wp.blocks.getCategories().map(function (category) {
			return category.slug;
		});

		CATEGORY_SLUGS.forEach(function (slug) {
			if (registered.indexOf(slug) === -1) {
				return;
			}

			var icon = createWpElement();

			if (icon) {
				wp.blocks.updateCategory(slug, { icon: icon });
			}
		});
	}

	window.UpliftersSiteBuilderBlocksLogo = {
		createSvgElement: createSvgElement,
		createWpElement: createWpElement,
	};

	function ready(callback) {
		var wp = getWp();

		if (wp && typeof wp.domReady === 'function') {
			wp.domReady(callback);
			return;
		}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', callback, { once: true });
			return;
		}

		callback();
	}

	ready(updateBlockCategories);
})(window, document);
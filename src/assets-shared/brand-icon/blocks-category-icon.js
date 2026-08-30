/**
 * Uplifters Website Builder custom block-category icon + label.
 *
 * Uses the polished Uplifters Website Builder mark with a true transparent arrow cutout.
 * Each rendered icon receives unique SVG definition IDs to prevent
 * gradient, mask, clip-path, and filter conflicts inside Gutenberg.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */
(function (wp) {
	'use strict';

	if (!wp || !wp.domReady || !wp.blocks || !wp.element) {
		return;
	}

	var createElement = wp.element.createElement;
	var iconInstance = 0;
	var SVG_NS = 'http://www.w3.org/2000/svg';
	var U_PATH = 'M82 76C82 54 97 40 118 40H213C233 40 246 54 246 75V311C246 368 257 399 290 399C325 399 342 377 342 338V75C342 54 357 40 378 40H458C480 40 493 55 493 76V339C493 444 426 500 290 500C149 500 82 434 82 330V76Z';
	var ARROW_CUTOUT_PATH = 'M91 414C159 411 220 391 270 357C321 322 356 279 376 227C388 196 394 171 395 151L350 166L425 63L492 162L448 148C446 188 436 229 419 270C393 333 349 386 289 427C232 466 165 487 91 489V414Z';

	function nextIds() {
		iconInstance += 1;

		var prefix = 'uplifters-site-builder-blocks-category-icon-' + iconInstance;

		return {
			uGradient: prefix + '-u-gradient',
			upperGlow: prefix + '-upper-glow',
			sideGlow: prefix + '-side-glow',
			bottomDepth: prefix + '-bottom-depth',
			edgeDepth: prefix + '-edge-depth',
			shadow: prefix + '-shadow',
			uClip: prefix + '-u-clip',
			cutoutMask: prefix + '-cutout-mask',
		};
	}

	function stop(offset, color, opacity) {
		var props = {
			offset: offset,
			stopColor: color,
		};

		if (typeof opacity !== 'undefined') {
			props.stopOpacity = opacity;
		}

		return createElement('stop', props);
	}

	function polishRect(gradientId) {
		return createElement('rect', {
			x: 0,
			y: 0,
			width: 560,
			height: 520,
			fill: 'url(#' + gradientId + ')',
		});
	}

	function UpliftersSiteBuilderBlocksCategoryRegisterIcon() {
		var ids = nextIds();

		return createElement(
			'svg',
			{
				width: 18,
				height: 18,
				viewBox: '0 0 560 520',
				fill: 'none',
				xmlns: SVG_NS,
				'aria-hidden': true,
				focusable: false,
				role: 'img',
				style: {
					flexShrink: 0,
					display: 'block',
					overflow: 'visible',
				},
			},
			createElement(
				'defs',
				null,
				createElement(
					'linearGradient',
					{
						id: ids.uGradient,
						x1: 122,
						y1: 38,
						x2: 445,
						y2: 500,
						gradientUnits: 'userSpaceOnUse',
					},
					stop('0', '#4fe2ff'),
					stop('0.27', '#20b7f7'),
					stop('0.60', '#087ce7'),
					stop('1', '#043eb8')
				),
				createElement(
					'radialGradient',
					{
						id: ids.upperGlow,
						cx: 0,
						cy: 0,
						r: 1,
						gradientUnits: 'userSpaceOnUse',
						gradientTransform: 'translate(168 79) rotate(31) scale(170 126)',
					},
					stop('0', '#ffffff', '0.48'),
					stop('0.48', '#ffffff', '0.17'),
					stop('1', '#ffffff', '0')
				),
				createElement(
					'radialGradient',
					{
						id: ids.sideGlow,
						cx: 0,
						cy: 0,
						r: 1,
						gradientUnits: 'userSpaceOnUse',
						gradientTransform: 'translate(397 94) rotate(119) scale(118 94)',
					},
					stop('0', '#ffffff', '0.24'),
					stop('1', '#ffffff', '0')
				),
				createElement(
					'radialGradient',
					{
						id: ids.bottomDepth,
						cx: 0,
						cy: 0,
						r: 1,
						gradientUnits: 'userSpaceOnUse',
						gradientTransform: 'translate(291 485) rotate(-90) scale(152 264)',
					},
					stop('0', '#00145f', '0.32'),
					stop('0.58', '#00145f', '0.08'),
					stop('1', '#00145f', '0')
				),
				createElement(
					'linearGradient',
					{
						id: ids.edgeDepth,
						x1: 82,
						y1: 260,
						x2: 493,
						y2: 260,
						gradientUnits: 'userSpaceOnUse',
					},
					stop('0', '#002484', '0.18'),
					stop('0.17', '#002484', '0'),
					stop('0.82', '#001669', '0'),
					stop('1', '#001669', '0.23')
				),
				createElement(
					'filter',
					{
						id: ids.shadow,
						x: '-25%',
						y: '-20%',
						width: '150%',
						height: '165%',
						colorInterpolationFilters: 'sRGB',
					},
					createElement('feDropShadow', {
						dx: 0,
						dy: 5,
						stdDeviation: 4,
						floodColor: '#022e84',
						floodOpacity: 0.24,
					}),
					createElement('feDropShadow', {
						dx: 0,
						dy: 15,
						stdDeviation: 13,
						floodColor: '#00349b',
						floodOpacity: 0.24,
					}),
					createElement('feDropShadow', {
						dx: 0,
						dy: 27,
						stdDeviation: 20,
						floodColor: '#002b84',
						floodOpacity: 0.15,
					})
				),
				createElement(
					'clipPath',
					{ id: ids.uClip },
					createElement('path', { d: U_PATH })
				),
				createElement(
					'mask',
					{
						id: ids.cutoutMask,
						maskUnits: 'userSpaceOnUse',
						x: 0,
						y: 0,
						width: 560,
						height: 520,
					},
					createElement('rect', {
						x: 0,
						y: 0,
						width: 560,
						height: 520,
						fill: '#ffffff',
					}),
					createElement('path', {
						d: ARROW_CUTOUT_PATH,
						fill: '#000000',
					})
				)
			),
			createElement(
				'g',
				{
					mask: 'url(#' + ids.cutoutMask + ')',
					filter: 'url(#' + ids.shadow + ')',
				},
				createElement('path', {
					d: U_PATH,
					fill: 'url(#' + ids.uGradient + ')',
				}),
				createElement(
					'g',
					{
						clipPath: 'url(#' + ids.uClip + ')',
						pointerEvents: 'none',
					},
					polishRect(ids.upperGlow),
					polishRect(ids.sideGlow),
					polishRect(ids.bottomDepth),
					polishRect(ids.edgeDepth)
				)
			)
		);
	}

	/**
	 * Render the category icon to the left of its label.
	 *
	 * @param {string} label Category label.
	 * @return {WPElement} Category title element.
	 */
	function UpliftersSiteBuilderBlocksCategoryRegisterTitle(label) {
		return createElement(
			'span',
			{
				className: 'uplifters-site-builder-blocks-category-title',
				style: {
					display: 'inline-flex',
					alignItems: 'center',
					gap: '6px',
					lineHeight: 1,
					verticalAlign: 'middle',
				},
			},
			createElement(UpliftersSiteBuilderBlocksCategoryRegisterIcon),
			createElement('span', null, label)
		);
	}

	wp.domReady(function () {
		var categories = [
			{ slug: 'uplifters-site-builder-blocks-gene', label: 'Uplifters Website Builder' },
			{ slug: 'uplifters-site-builder-blocks-text', label: 'Uplifters Website Builder - Text' },
			{ slug: 'uplifters-site-builder-blocks-layout', label: 'Uplifters Website Builder - Layout' },
		];

		categories.forEach(function (item) {
			wp.blocks.updateCategory(item.slug, {
				title: UpliftersSiteBuilderBlocksCategoryRegisterTitle(item.label),
			});
		});
	});
})(window.wp);

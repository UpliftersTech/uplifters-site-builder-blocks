/**
 * Uplifters Website Builder reusable editor topbar icon.
 *
 * CSS logo converted to a self-contained, DOM-based SVG factory.
 * The arrow is a true transparent cutout, not a separately filled shape.
 *
 * Exposes:
 * window.UpliftersSiteBuilderBlocksEditorTopbarIcon.createIcon()
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */
(function (window, document) {
	'use strict';

	if (!window || !document) {
		return;
	}

	var SVG_NS = 'http://www.w3.org/2000/svg';
	var instanceCount = 0;

	function createSvgElement(tagName, attributes) {
		var element = document.createElementNS(SVG_NS, tagName);

		Object.keys(attributes || {}).forEach(function (name) {
			element.setAttribute(name, attributes[name]);
		});

		return element;
	}

	function appendGradientStops(gradient, stops) {
		stops.forEach(function (stopData) {
			var attributes = {
				offset: stopData.offset,
				'stop-color': stopData.color,
			};

			if (typeof stopData.opacity !== 'undefined') {
				attributes['stop-opacity'] = stopData.opacity;
			}

			gradient.appendChild(createSvgElement('stop', attributes));
		});
	}

	function createIcon() {
		instanceCount += 1;

		var uniqueId = 'uplifters-site-builder-blocks-editor-topbar-icon-' + instanceCount;
		var uGradientId = uniqueId + '-u-gradient';
		var upperGlowId = uniqueId + '-upper-glow';
		var sideGlowId = uniqueId + '-side-glow';
		var bottomDepthId = uniqueId + '-bottom-depth';
		var edgeDepthId = uniqueId + '-edge-depth';
		var cutoutMaskId = uniqueId + '-cutout-mask';
		var shadowId = uniqueId + '-shadow';
		var uClipId = uniqueId + '-u-clip';

		var svg = createSvgElement('svg', {
			class: 'uplifters-site-builder-blocks-editor-topbar-logo__icon',
			width: '28',
			height: '28',
			viewBox: '0 0 560 520',
			fill: 'none',
			xmlns: SVG_NS,
			'aria-hidden': 'true',
			focusable: 'false',
			role: 'img',
		});

		var defs = createSvgElement('defs');

		var uGradient = createSvgElement('linearGradient', {
			id: uGradientId,
			x1: '122',
			y1: '38',
			x2: '445',
			y2: '500',
			gradientUnits: 'userSpaceOnUse',
		});

		appendGradientStops(uGradient, [
			{ offset: '0', color: '#4fe2ff' },
			{ offset: '0.27', color: '#20b7f7' },
			{ offset: '0.60', color: '#087ce7' },
			{ offset: '1', color: '#043eb8' },
		]);

		var upperGlow = createSvgElement('radialGradient', {
			id: upperGlowId,
			cx: '0',
			cy: '0',
			r: '1',
			gradientUnits: 'userSpaceOnUse',
			gradientTransform: 'translate(168 79) rotate(31) scale(170 126)',
		});

		appendGradientStops(upperGlow, [
			{ offset: '0', color: '#ffffff', opacity: '0.48' },
			{ offset: '0.48', color: '#ffffff', opacity: '0.17' },
			{ offset: '1', color: '#ffffff', opacity: '0' },
		]);

		var sideGlow = createSvgElement('radialGradient', {
			id: sideGlowId,
			cx: '0',
			cy: '0',
			r: '1',
			gradientUnits: 'userSpaceOnUse',
			gradientTransform: 'translate(397 94) rotate(119) scale(118 94)',
		});

		appendGradientStops(sideGlow, [
			{ offset: '0', color: '#ffffff', opacity: '0.24' },
			{ offset: '1', color: '#ffffff', opacity: '0' },
		]);

		var bottomDepth = createSvgElement('radialGradient', {
			id: bottomDepthId,
			cx: '0',
			cy: '0',
			r: '1',
			gradientUnits: 'userSpaceOnUse',
			gradientTransform: 'translate(291 485) rotate(-90) scale(152 264)',
		});

		appendGradientStops(bottomDepth, [
			{ offset: '0', color: '#00145f', opacity: '0.32' },
			{ offset: '0.58', color: '#00145f', opacity: '0.08' },
			{ offset: '1', color: '#00145f', opacity: '0' },
		]);

		var edgeDepth = createSvgElement('linearGradient', {
			id: edgeDepthId,
			x1: '82',
			y1: '260',
			x2: '493',
			y2: '260',
			gradientUnits: 'userSpaceOnUse',
		});

		appendGradientStops(edgeDepth, [
			{ offset: '0', color: '#002484', opacity: '0.18' },
			{ offset: '0.17', color: '#002484', opacity: '0' },
			{ offset: '0.82', color: '#001669', opacity: '0' },
			{ offset: '1', color: '#001669', opacity: '0.23' },
		]);

		var shadow = createSvgElement('filter', {
			id: shadowId,
			x: '-25%',
			y: '-20%',
			width: '150%',
			height: '165%',
			colorInterpolationFilters: 'sRGB',
		});

		shadow.appendChild(
			createSvgElement('feDropShadow', {
				dx: '0',
				dy: '5',
				stdDeviation: '4',
				'flood-color': '#022e84',
				'flood-opacity': '0.24',
			})
		);

		shadow.appendChild(
			createSvgElement('feDropShadow', {
				dx: '0',
				dy: '15',
				stdDeviation: '13',
				'flood-color': '#00349b',
				'flood-opacity': '0.24',
			})
		);

		shadow.appendChild(
			createSvgElement('feDropShadow', {
				dx: '0',
				dy: '27',
				stdDeviation: '20',
				'flood-color': '#002b84',
				'flood-opacity': '0.15',
			})
		);

		var uPathData = 'M82 76C82 54 97 40 118 40H213C233 40 246 54 246 75V311C246 368 257 399 290 399C325 399 342 377 342 338V75C342 54 357 40 378 40H458C480 40 493 55 493 76V339C493 444 426 500 290 500C149 500 82 434 82 330V76Z';
		var arrowCutoutData = 'M91 414C159 411 220 391 270 357C321 322 356 279 376 227C388 196 394 171 395 151L350 166L425 63L492 162L448 148C446 188 436 229 419 270C393 333 349 386 289 427C232 466 165 487 91 489V414Z';

		var uClip = createSvgElement('clipPath', {
			id: uClipId,
		});
		uClip.appendChild(createSvgElement('path', { d: uPathData }));

		var cutoutMask = createSvgElement('mask', {
			id: cutoutMaskId,
			maskUnits: 'userSpaceOnUse',
			x: '0',
			y: '0',
			width: '560',
			height: '520',
		});
		cutoutMask.appendChild(
			createSvgElement('rect', {
				x: '0',
				y: '0',
				width: '560',
				height: '520',
				fill: '#ffffff',
			})
		);
		cutoutMask.appendChild(
			createSvgElement('path', {
				d: arrowCutoutData,
				fill: '#000000',
			})
		);

		defs.appendChild(uGradient);
		defs.appendChild(upperGlow);
		defs.appendChild(sideGlow);
		defs.appendChild(bottomDepth);
		defs.appendChild(edgeDepth);
		defs.appendChild(shadow);
		defs.appendChild(uClip);
		defs.appendChild(cutoutMask);

		var logoGroup = createSvgElement('g', {
			class: 'uplifters-site-builder-blocks-editor-topbar-logo__mark',
			mask: 'url(#' + cutoutMaskId + ')',
			filter: 'url(#' + shadowId + ')',
		});

		logoGroup.appendChild(
			createSvgElement('path', {
				class: 'uplifters-site-builder-blocks-editor-topbar-logo__u-shape',
				d: uPathData,
				fill: 'url(#' + uGradientId + ')',
			})
		);

		var polishGroup = createSvgElement('g', {
			class: 'uplifters-site-builder-blocks-editor-topbar-logo__polish',
			'clip-path': 'url(#' + uClipId + ')',
			'pointer-events': 'none',
		});

		polishGroup.appendChild(
			createSvgElement('rect', {
				x: '0',
				y: '0',
				width: '560',
				height: '520',
				fill: 'url(#' + upperGlowId + ')',
			})
		);

		polishGroup.appendChild(
			createSvgElement('rect', {
				x: '0',
				y: '0',
				width: '560',
				height: '520',
				fill: 'url(#' + sideGlowId + ')',
			})
		);

		polishGroup.appendChild(
			createSvgElement('rect', {
				x: '0',
				y: '0',
				width: '560',
				height: '520',
				fill: 'url(#' + bottomDepthId + ')',
			})
		);

		polishGroup.appendChild(
			createSvgElement('rect', {
				x: '0',
				y: '0',
				width: '560',
				height: '520',
				fill: 'url(#' + edgeDepthId + ')',
			})
		);

		logoGroup.appendChild(polishGroup);
		svg.appendChild(defs);
		svg.appendChild(logoGroup);

		return svg;
	}

	window.UpliftersSiteBuilderBlocksEditorTopbarIcon = {
		createIcon: createIcon,
	};
})(window, document);

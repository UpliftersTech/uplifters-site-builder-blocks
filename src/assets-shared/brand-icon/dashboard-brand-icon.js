/**
 * Uplifters Website Builder reusable plugin page icon.
 *
 * CSS logo converted to a self-contained, DOM-based SVG factory.
 * The arrow is a true transparent cutout, not a separately filled shape.
 *
 * Exposes:
 * window.UpliftersSiteBuilderBlocksDashboardBrandIcon.createIcon()
 *
 * It can also be imported as an ES module:
 * import { createIcon } from './dashboard-brand-icon';
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
let instanceCount = 0;

function createSvgElement(tagName, attributes = {}) {
	const element = document.createElementNS(SVG_NS, tagName);

	Object.keys(attributes).forEach((name) => {
		element.setAttribute(name, attributes[name]);
	});

	return element;
}

function appendGradientStops(gradient, stops) {
	stops.forEach((stopData) => {
		const attributes = {
			offset: stopData.offset,
			'stop-color': stopData.color,
		};

		if (typeof stopData.opacity !== 'undefined') {
			attributes['stop-opacity'] = stopData.opacity;
		}

		gradient.appendChild(createSvgElement('stop', attributes));
	});
}

export function createIcon() {
	if (typeof document === 'undefined') {
		return null;
	}

	instanceCount += 1;

	const uniqueId = `uplifters-site-builder-blocks-dashboard-brand-icon-${instanceCount}`;
	const uGradientId = `${uniqueId}-u-gradient`;
	const upperGlowId = `${uniqueId}-upper-glow`;
	const sideGlowId = `${uniqueId}-side-glow`;
	const bottomDepthId = `${uniqueId}-bottom-depth`;
	const edgeDepthId = `${uniqueId}-edge-depth`;
	const cutoutMaskId = `${uniqueId}-cutout-mask`;
	const shadowId = `${uniqueId}-shadow`;
	const uClipId = `${uniqueId}-u-clip`;

	const svg = createSvgElement('svg', {
		class: 'uplifters-site-builder-blocks-dashboard-brand-icon',
		width: '28',
		height: '28',
		viewBox: '0 0 560 520',
		fill: 'none',
		xmlns: SVG_NS,
		'aria-hidden': 'true',
		focusable: 'false',
		role: 'img',
	});

	const defs = createSvgElement('defs');
	const uGradient = createSvgElement('linearGradient', {
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

	const upperGlow = createSvgElement('radialGradient', {
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

	const sideGlow = createSvgElement('radialGradient', {
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

	const bottomDepth = createSvgElement('radialGradient', {
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

	const edgeDepth = createSvgElement('linearGradient', {
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

	const shadow = createSvgElement('filter', {
		id: shadowId,
		x: '-25%',
		y: '-20%',
		width: '150%',
		height: '165%',
		colorInterpolationFilters: 'sRGB',
	});

	[
		{ dx: '0', dy: '5', stdDeviation: '4', color: '#022e84', opacity: '0.24' },
		{ dx: '0', dy: '15', stdDeviation: '13', color: '#00349b', opacity: '0.24' },
		{ dx: '0', dy: '27', stdDeviation: '20', color: '#002b84', opacity: '0.15' },
	].forEach((shadowData) => {
		shadow.appendChild(createSvgElement('feDropShadow', {
			dx: shadowData.dx,
			dy: shadowData.dy,
			stdDeviation: shadowData.stdDeviation,
			'flood-color': shadowData.color,
			'flood-opacity': shadowData.opacity,
		}));
	});

	const uPathData = 'M82 76C82 54 97 40 118 40H213C233 40 246 54 246 75V311C246 368 257 399 290 399C325 399 342 377 342 338V75C342 54 357 40 378 40H458C480 40 493 55 493 76V339C493 444 426 500 290 500C149 500 82 434 82 330V76Z';
	const arrowCutoutData = 'M91 414C159 411 220 391 270 357C321 322 356 279 376 227C388 196 394 171 395 151L350 166L425 63L492 162L448 148C446 188 436 229 419 270C393 333 349 386 289 427C232 466 165 487 91 489V414Z';

	const uClip = createSvgElement('clipPath', { id: uClipId });
	uClip.appendChild(createSvgElement('path', { d: uPathData }));

	const cutoutMask = createSvgElement('mask', {
		id: cutoutMaskId,
		maskUnits: 'userSpaceOnUse',
		x: '0',
		y: '0',
		width: '560',
		height: '520',
	});
	cutoutMask.appendChild(createSvgElement('rect', {
		x: '0',
		y: '0',
		width: '560',
		height: '520',
		fill: '#ffffff',
	}));
	cutoutMask.appendChild(createSvgElement('path', {
		d: arrowCutoutData,
		fill: '#000000',
	}));

	defs.appendChild(uGradient);
	defs.appendChild(upperGlow);
	defs.appendChild(sideGlow);
	defs.appendChild(bottomDepth);
	defs.appendChild(edgeDepth);
	defs.appendChild(shadow);
	defs.appendChild(uClip);
	defs.appendChild(cutoutMask);

	const logoGroup = createSvgElement('g', {
		class: 'uplifters-site-builder-blocks-dashboard-brand-icon__mark',
		mask: `url(#${cutoutMaskId})`,
		filter: `url(#${shadowId})`,
	});

	logoGroup.appendChild(createSvgElement('path', {
		class: 'uplifters-site-builder-blocks-dashboard-brand-icon__u-shape',
		d: uPathData,
		fill: `url(#${uGradientId})`,
	}));

	const polishGroup = createSvgElement('g', {
		class: 'uplifters-site-builder-blocks-dashboard-brand-icon__polish',
		'clip-path': `url(#${uClipId})`,
		'pointer-events': 'none',
	});

	[
		upperGlowId,
		sideGlowId,
		bottomDepthId,
		edgeDepthId,
	].forEach((gradientId) => {
		polishGroup.appendChild(createSvgElement('rect', {
			x: '0',
			y: '0',
			width: '560',
			height: '520',
			fill: `url(#${gradientId})`,
		}));
	});

	logoGroup.appendChild(polishGroup);
	svg.appendChild(defs);
	svg.appendChild(logoGroup);

	return svg;
}

if (typeof window !== 'undefined') {
	window.UpliftersSiteBuilderBlocksDashboardBrandIcon = {
		createIcon,
	};
}

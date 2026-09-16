/**
 * Posts Section — registered from inside the Posts Layout folder rather than
 * its own block folder, following the same pattern as row-layout/row-section.js.
 *
 * Unlike row-section, Posts Section still needs real server-side dynamic
 * rendering (context propagation, singular-post guard, child fallback
 * rendering, per-instance CSS) — that logic now lives in
 * includes/blocks-helper/section-wrapper/posts-section-block-register.php, registered via a
 * plain register_block_type() args array instead of a block.json file.
 *
 * This block shows up only as a layer in the editor's block list — it has no
 * Settings or Styles tab of its own; every user-facing control for the Posts
 * Layout + Posts Section pairing lives on the parent Posts Layout block.
 */

import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useEffect, useMemo, useState } from '@wordpress/element';

const TEMPLATE = [];

const DEVICES = [ 'desktop', 'tablet', 'mobile' ];
const RESPONSIVE_DEVICE_STORAGE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';

const normalizeDevice = ( value ) => {
	if ( ! value ) {
		return null;
	}

	const normalizedValue = String( value ).toLowerCase();

	if (
		normalizedValue === 'desktop' ||
		normalizedValue === 'large' ||
		normalizedValue === 'wide'
	) {
		return 'desktop';
	}

	if (
		normalizedValue === 'tablet' ||
		normalizedValue === 'medium'
	) {
		return 'tablet';
	}

	if (
		normalizedValue === 'mobile' ||
		normalizedValue === 'small' ||
		normalizedValue === 'phone'
	) {
		return 'mobile';
	}

	if ( DEVICES.includes( normalizedValue ) ) {
		return normalizedValue;
	}

	return null;
};

const getResponsiveWindowCandidates = () => {
	const candidates = [];

	if ( typeof window !== 'undefined' ) {
		candidates.push( window );

		try {
			if ( window.parent && window.parent !== window ) {
				candidates.push( window.parent );
			}
		} catch ( error ) {}
	}

	return candidates;
};

const getCurrentResponsiveDeviceFromLocalStorage = () => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	try {
		const device = normalizeDevice(
			window.localStorage.getItem( RESPONSIVE_DEVICE_STORAGE_KEY )
		);

		if ( device ) {
			return device;
		}
	} catch ( error ) {}

	try {
		if ( window.parent && window.parent !== window ) {
			const device = normalizeDevice(
				window.parent.localStorage.getItem(
					RESPONSIVE_DEVICE_STORAGE_KEY
				)
			);

			if ( device ) {
				return device;
			}
		}
	} catch ( error ) {}

	return null;
};

const getCurrentResponsiveDeviceFromWindow = () => {
	const windows = getResponsiveWindowCandidates();

	for ( const currentWindow of windows ) {
		try {
			if (
				currentWindow.UpliftersSiteBuilderBlocksResponsive &&
				typeof currentWindow.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
			) {
				const device = normalizeDevice(
					currentWindow.UpliftersSiteBuilderBlocksResponsive.getDevice()
				);

				if ( device ) {
					return device;
				}
			}

			if ( currentWindow.upliftersSiteBuilderBlocksResponsiveDevice ) {
				const device = normalizeDevice(
					currentWindow.upliftersSiteBuilderBlocksResponsiveDevice
				);

				if ( device ) {
					return device;
				}
			}
		} catch ( error ) {}
	}

	return getCurrentResponsiveDeviceFromLocalStorage();
};

const useGlobalResponsiveDevice = () => {
	const [ device, setDevice ] = useState(
		() => getCurrentResponsiveDeviceFromWindow() || 'desktop'
	);

	useEffect( () => {
		const updateDevice = ( event ) => {
			const eventDevice = normalizeDevice(
				event?.detail?.device ||
					event?.detail?.deviceType ||
					event?.detail?.previewDeviceType
			);

			setDevice(
				eventDevice ||
					getCurrentResponsiveDeviceFromWindow() ||
					'desktop'
			);
		};

		updateDevice();

		if ( typeof window === 'undefined' ) {
			return undefined;
		}

		const windows = getResponsiveWindowCandidates();

		windows.forEach( ( currentWindow ) => {
			try {
				currentWindow.addEventListener(
					'uplifters-site-builder-blocks-responsive-device-change',
					updateDevice
				);
				currentWindow.addEventListener(
					'uplifters-site-builder-blocks-device-change',
					updateDevice
				);
				currentWindow.addEventListener(
					'core-preview-device-change',
					updateDevice
				);
				currentWindow.addEventListener( 'storage', updateDevice );
			} catch ( error ) {}
		} );

		const interval = window.setInterval( updateDevice, 250 );

		return () => {
			windows.forEach( ( currentWindow ) => {
				try {
					currentWindow.removeEventListener(
						'uplifters-site-builder-blocks-responsive-device-change',
						updateDevice
					);
					currentWindow.removeEventListener(
						'uplifters-site-builder-blocks-device-change',
						updateDevice
					);
					currentWindow.removeEventListener(
						'core-preview-device-change',
						updateDevice
					);
					currentWindow.removeEventListener(
						'storage',
						updateDevice
					);
				} catch ( error ) {}
			} );

			window.clearInterval( interval );
		};
	}, [] );

	return device;
};

const normalizePixelNumber = ( value ) => {
	if ( value === null || typeof value === 'undefined' || value === '' ) {
		return 0;
	}

	if ( typeof value === 'number' ) {
		return Math.max( 0, Math.round( value ) );
	}

	if ( typeof value !== 'string' ) {
		return 0;
	}

	const parsedValue = parseFloat( value );

	if ( Number.isNaN( parsedValue ) ) {
		return 0;
	}

	return Math.max( 0, Math.round( parsedValue ) );
};

const normalizePadding = ( value ) => normalizePixelNumber( value );

const normalizeGap = ( value ) => normalizePixelNumber( value );

const normalizeBorderRadius = ( value ) => normalizePixelNumber( value );

const getPixelStyleValue = ( value ) => {
	const normalizedValue = normalizePixelNumber( value );

	return normalizedValue > 0 ? `${ normalizedValue }px` : '0px';
};

const normalizeBackgroundColor = ( value ) => {
	if ( typeof value !== 'string' ) {
		return '';
	}

	return value.trim();
};

/*
 * Returns a device value.
 *
 * Tablet and Mobile inherit Desktop only when they do not have
 * their own attribute key. Mirrors footer-section's own resolution
 * order for its responsive style attributes.
 */
const getResponsiveStyleValue = ( values, device, normalizeValue ) => {
	if ( typeof values === 'string' || typeof values === 'number' ) {
		return normalizeValue( values );
	}

	if ( ! values || typeof values !== 'object' || Array.isArray( values ) ) {
		return normalizeValue( '' );
	}

	if ( Object.prototype.hasOwnProperty.call( values, device ) ) {
		return normalizeValue( values[ device ] );
	}

	if (
		device !== 'desktop' &&
		Object.prototype.hasOwnProperty.call( values, 'desktop' )
	) {
		return normalizeValue( values.desktop );
	}

	return normalizeValue( '' );
};

const getResponsivePadding = ( padding, device ) =>
	getResponsiveStyleValue( padding, device, normalizePadding );

const getResponsiveGap = ( gap, device ) =>
	getResponsiveStyleValue( gap, device, normalizeGap );

const getResponsiveBorderRadius = ( borderRadius, device ) =>
	getResponsiveStyleValue( borderRadius, device, normalizeBorderRadius );

const getResponsiveBackgroundColor = ( backgroundColor, device ) =>
	getResponsiveStyleValue(
		backgroundColor,
		device,
		normalizeBackgroundColor
	);

export const POSTS_SECTION_NAME = 'uplifters-site-builder-blocks/posts-section';

export const postsSectionMetadata = {
	apiVersion: 3,
	name: POSTS_SECTION_NAME,
	title: 'Posts Section',
	category: 'uplifters-site-builder-blocks-post',
	parent: [ 'uplifters-site-builder-blocks/posts-layout' ],
	description: 'A section container inside the Posts Layout block for arranging post template content. All settings live on the parent Posts Layout block.',
	textdomain: 'uplifters-site-builder-blocks',
	usesContext: [ 'postId', 'postType' ],
	providesContext: {
		postId: 'postId',
		postType: 'postType',
	},
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
		padding: {
			type: 'object',
			default: { desktop: 0, tablet: 0, mobile: 0 },
		},
		gap: {
			type: 'object',
			default: { desktop: 18, tablet: 18, mobile: 18 },
		},
		borderRadius: {
			type: 'object',
			default: { desktop: 0, tablet: 0, mobile: 0 },
		},
		backgroundColor: {
			type: 'object',
			default: { desktop: '', tablet: '', mobile: '' },
		},
	},
	supports: {
		align: [ 'full' ],
		html: false,
		inserter: false,
	},
};

export function PostsSectionEdit( { attributes, clientId } ) {
	const {
		padding = {},
		gap = {},
		borderRadius = {},
		backgroundColor = {},
	} = attributes;

	const globalResponsiveDevice = useGlobalResponsiveDevice();
	const device = normalizeDevice( globalResponsiveDevice ) || 'desktop';

	const uniqueClassName = useMemo( () => {
		const safeClientId = String( clientId || 'default' ).replace(
			/[^a-zA-Z0-9_-]/g,
			'-'
		);

		return `uplifters-site-builder-blocks-posts-section-editor-${ safeClientId }`;
	}, [ clientId ] );

	const normalizedPadding = useMemo(
		() => getResponsivePadding( padding, device ),
		[ padding, device ]
	);

	const normalizedGap = useMemo(
		() => getResponsiveGap( gap, device ),
		[ gap, device ]
	);

	const normalizedBorderRadius = useMemo(
		() => getResponsiveBorderRadius( borderRadius, device ),
		[ borderRadius, device ]
	);

	const normalizedBackgroundColor = useMemo(
		() => getResponsiveBackgroundColor( backgroundColor, device ),
		[ backgroundColor, device ]
	);

	const blockProps = useBlockProps( {
		className: `uplifters-site-builder-blocks-posts-section uplifters-site-builder-blocks-posts-section-editor ${ uniqueClassName } uplifters-site-builder-blocks-responsive-device-${ device }`,
		'data-uplifters-site-builder-blocks-posts-section': 'true',
		'data-uplifters-site-builder-blocks-responsive-device': device,
		style: {
			boxSizing: 'border-box',
			position: 'relative',
			width: '100%',
		},
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'uplifters-site-builder-blocks-posts-section__inner',
			'data-uplifters-site-builder-blocks-posts-section-inner': 'true',
			style: {
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				minWidth: '0',
				padding: getPixelStyleValue( normalizedPadding ),
				gap: getPixelStyleValue( normalizedGap ),
				borderRadius: getPixelStyleValue( normalizedBorderRadius ),
				backgroundColor: normalizedBackgroundColor || 'transparent',
				'--wp--style--block-gap': getPixelStyleValue( normalizedGap ),
			},
		},
		{
			template: TEMPLATE,
			templateLock: false,
			orientation: 'vertical',
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}

export function PostsSectionSave() {
	return <InnerBlocks.Content />;
}

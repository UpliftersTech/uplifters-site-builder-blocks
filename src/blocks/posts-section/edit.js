import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	ColorPalette,
	PanelBody,
	RangeControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';


const TEMPLATE = [];

const DEVICE_LABELS = {
	desktop: __( 'Desktop', 'uplifters-site-builder-blocks' ),
	tablet: __( 'Tablet', 'uplifters-site-builder-blocks' ),
	mobile: __( 'Mobile', 'uplifters-site-builder-blocks' ),
};

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

const updateResponsiveStyleValue = (
	values,
	device,
	nextValue,
	normalizeValue
) => {
	let currentValues = {};

	if ( values && typeof values === 'object' && ! Array.isArray( values ) ) {
		currentValues = values;
	} else if ( typeof values === 'string' || typeof values === 'number' ) {
		currentValues = {
			desktop: normalizeValue( values ),
		};
	}

	return {
		...currentValues,
		[ device ]: normalizeValue( nextValue ),
	};
};

const getResponsivePadding = ( padding, device ) =>
	getResponsiveStyleValue( padding, device, normalizePadding );

const updateResponsivePadding = ( padding, device, nextPadding ) =>
	updateResponsiveStyleValue( padding, device, nextPadding, normalizePadding );

const getResponsiveGap = ( gap, device ) =>
	getResponsiveStyleValue( gap, device, normalizeGap );

const updateResponsiveGap = ( gap, device, nextGap ) =>
	updateResponsiveStyleValue( gap, device, nextGap, normalizeGap );

const getResponsiveBorderRadius = ( borderRadius, device ) =>
	getResponsiveStyleValue( borderRadius, device, normalizeBorderRadius );

const updateResponsiveBorderRadius = ( borderRadius, device, nextRadius ) =>
	updateResponsiveStyleValue(
		borderRadius,
		device,
		nextRadius,
		normalizeBorderRadius
	);

const getResponsiveBackgroundColor = ( backgroundColor, device ) =>
	getResponsiveStyleValue(
		backgroundColor,
		device,
		normalizeBackgroundColor
	);

const updateResponsiveBackgroundColor = (
	backgroundColor,
	device,
	nextBackgroundColor
) =>
	updateResponsiveStyleValue(
		backgroundColor,
		device,
		nextBackgroundColor,
		normalizeBackgroundColor
	);

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		padding = {},
		gap = {},
		borderRadius = {},
		backgroundColor = {},
	} = attributes;

	const globalResponsiveDevice = useGlobalResponsiveDevice();
	const device = normalizeDevice( globalResponsiveDevice ) || 'desktop';

	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

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

	const updatePadding = ( nextPadding ) => {
		setAttributes( {
			padding: updateResponsivePadding( padding, device, nextPadding ),
		} );
	};

	const updateGap = ( nextGap ) => {
		setAttributes( {
			gap: updateResponsiveGap( gap, device, nextGap ),
		} );
	};

	const updateBorderRadius = ( nextRadius ) => {
		setAttributes( {
			borderRadius: updateResponsiveBorderRadius(
				borderRadius,
				device,
				nextRadius
			),
		} );
	};

	const updateBackgroundColor = ( nextBackgroundColor ) => {
		setAttributes( {
			backgroundColor: updateResponsiveBackgroundColor(
				backgroundColor,
				device,
				nextBackgroundColor || ''
			),
		} );
	};

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
		<>
			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf(
						__( 'Spacing — %s', 'uplifters-site-builder-blocks' ),
						DEVICE_LABELS[ device ]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<div className="uplifters-site-builder-blocks-responsive-device-badge">
						{ DEVICE_LABELS[ device ] }
					</div>

					<RangeControl
						label={ __( 'Padding', 'uplifters-site-builder-blocks' ) }
						value={ normalizedPadding }
						onChange={ updatePadding }
						min={ 0 }
						max={ 200 }
						step={ 1 }
						renderTooltipContent={ ( value ) => `${ value }px` }
					/>

					<RangeControl
						label={ __( 'Gap', 'uplifters-site-builder-blocks' ) }
						value={ normalizedGap }
						onChange={ updateGap }
						min={ 0 }
						max={ 120 }
						step={ 1 }
						renderTooltipContent={ ( value ) => `${ value }px` }
					/>

					<RangeControl
						label={ __( 'Border Radius', 'uplifters-site-builder-blocks' ) }
						value={ normalizedBorderRadius }
						onChange={ updateBorderRadius }
						min={ 0 }
						max={ 200 }
						step={ 1 }
						renderTooltipContent={ ( value ) => `${ value }px` }
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						__( 'Colors — %s', 'uplifters-site-builder-blocks' ),
						DEVICE_LABELS[ device ]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'colors' }
					onToggle={ () => toggleStylesPanel( 'colors' ) }
				>
					<p>{ __( 'Background Color', 'uplifters-site-builder-blocks' ) }</p>

					<ColorPalette
						value={ normalizedBackgroundColor }
						onChange={ updateBackgroundColor }
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="posts-section" /> : <Editor { ...props } />;
}

import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

/*
 * header-section places no restriction on its inner blocks — any block may be
 * inserted here, matching posts-section. This constant is retained only to
 * feed the default TEMPLATE below and is deliberately NOT passed to
 * useInnerBlocksProps as `allowedBlocks`.
 */
const ALLOWED_BLOCKS = [
	'uplifters-site-builder-blocks/site-logo',
	'uplifters-site-builder-blocks/search-live',
	'uplifters-site-builder-blocks/page-nav',
	'uplifters-site-builder-blocks/button-single',
];

const TEMPLATE = [
	[ 'uplifters-site-builder-blocks/site-logo', {} ],
	[ 'uplifters-site-builder-blocks/search-live', {} ],
	[ 'uplifters-site-builder-blocks/page-nav', {} ],
	[ 'uplifters-site-builder-blocks/button-single', {} ],
];

const DEVICE_LABELS = {
	desktop: __( 'Desktop', 'uplifters-site-builder-blocks' ),
	tablet: __( 'Tablet', 'uplifters-site-builder-blocks' ),
	mobile: __( 'Mobile', 'uplifters-site-builder-blocks' ),
};

const VERTICAL_ALIGNMENT_OPTIONS = [
	{
		label: __( 'Top', 'uplifters-site-builder-blocks' ),
		value: 'start',
	},
	{
		label: __( 'Middle', 'uplifters-site-builder-blocks' ),
		value: 'center',
	},
	{
		label: __( 'Bottom', 'uplifters-site-builder-blocks' ),
		value: 'end',
	},
];

const DEFAULT_COLUMN_COUNT = 4;
const MIN_COLUMN_WIDTH = 8;
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

	return DEVICES.includes( normalizedValue )
		? normalizedValue
		: null;
};

const getResponsiveWindowCandidates = () => {
	const candidates = [];

	if ( typeof window === 'undefined' ) {
		return candidates;
	}

	candidates.push( window );

	try {
		if ( window.parent && window.parent !== window ) {
			candidates.push( window.parent );
		}
	} catch ( error ) {}

	return candidates;
};

const getCurrentResponsiveDeviceFromLocalStorage = () => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const windows = getResponsiveWindowCandidates();

	for ( const currentWindow of windows ) {
		try {
			const device = normalizeDevice(
				currentWindow.localStorage.getItem(
					RESPONSIVE_DEVICE_STORAGE_KEY
				)
			);

			if ( device ) {
				return device;
			}
		} catch ( error ) {}
	}

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

			const globalDevice = normalizeDevice(
				currentWindow.upliftersSiteBuilderBlocksResponsiveDevice
			);

			if ( globalDevice ) {
				return globalDevice;
			}
		} catch ( error ) {}
	}

	return getCurrentResponsiveDeviceFromLocalStorage();
};

const useGlobalResponsiveDevice = () => {
	const [ activeDevice, setActiveDevice ] = useState( () => {
		return (
			getCurrentResponsiveDeviceFromWindow() ||
			'desktop'
		);
	} );

	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return undefined;
		}

		const updateDevice = ( event ) => {
			const eventDevice = normalizeDevice(
				event?.detail?.device ||
					event?.detail?.deviceType ||
					event?.detail?.previewDeviceType
			);

			const detectedDevice =
				eventDevice ||
				getCurrentResponsiveDeviceFromWindow();

			/*
			 * Never overwrite the current active device with
			 * null/undefined. This prevents Tablet/Mobile from
			 * flashing briefly and then resetting to Desktop.
			 */
			if ( detectedDevice ) {
				setActiveDevice( detectedDevice );
			}
		};

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

				currentWindow.addEventListener(
					'storage',
					updateDevice
				);
			} catch ( error ) {}
		} );

		const initialDevice =
			getCurrentResponsiveDeviceFromWindow();

		if ( initialDevice ) {
			setActiveDevice( initialDevice );
		}

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
		};
	}, [] );

	return activeDevice;
};

const getDefaultWidthsForCount = ( count ) => {
	if ( count === 4 ) {
		return [ 25, 25, 25, 25 ];
	}

	if ( count === 3 ) {
		return [ 33, 34, 33 ];
	}

	if ( count === 2 ) {
		return [ 50, 50 ];
	}

	return Array.from(
		{ length: count },
		() => 100 / count
	);
};

const getActiveColumnCount = ( innerBlocks ) => {
	if (
		Array.isArray( innerBlocks ) &&
		innerBlocks.length > 0
	) {
		return innerBlocks.length;
	}

	return DEFAULT_COLUMN_COUNT;
};

const normalizeWidths = ( widths, count ) => {
	if (
		! Array.isArray( widths ) ||
		widths.length !== count
	) {
		return getDefaultWidthsForCount( count );
	}

	const numericWidths = widths.map(
		( width ) => Number( width ) || 0
	);

	const total = numericWidths.reduce(
		( sum, width ) => sum + width,
		0
	);

	if ( total <= 0 ) {
		return getDefaultWidthsForCount( count );
	}

	return numericWidths.map( ( width ) =>
		Number(
			( ( width / total ) * 100 ).toFixed( 4 )
		)
	);
};

const normalizeVerticalAlignment = ( value ) => {
	const allowedValues =
		VERTICAL_ALIGNMENT_OPTIONS.map(
			( option ) => option.value
		);

	return allowedValues.includes( value )
		? value
		: 'center';
};

/*
 * Order entries are "block-name#occurrence" composite keys, not raw block
 * names — a saved order must be able to distinguish between multiple
 * blocks that share the same name (e.g. two core/paragraph blocks), which
 * a plain name can't do. A legacy entry (no "#") is migrated in place by
 * treating it as occurrence 0 — every pre-existing saved array had at
 * most one entry per name by construction, so this is unambiguous. The
 * migration is naturally idempotent: an already-migrated entry already
 * contains "#" and passes through unchanged.
 */
const migrateOrderEntry = ( entry ) => {
	if ( typeof entry !== 'string' || entry.length === 0 ) {
		return '';
	}

	return entry.includes( '#' ) ? entry : `${ entry }#0`;
};

const getCompositeBlockKeys = ( blocks ) => {
	const occurrenceCounts = new Map();

	return ( Array.isArray( blocks ) ? blocks : [] ).map( ( block ) => {
		const name = block?.name;

		if ( ! name ) {
			return '';
		}

		const occurrence = occurrenceCounts.get( name ) || 0;
		occurrenceCounts.set( name, occurrence + 1 );

		return `${ name }#${ occurrence }`;
	} );
};

const normalizeBlockOrder = ( order ) => {
	if ( ! Array.isArray( order ) ) {
		return [];
	}

	const usedKeys = new Set();
	const normalizedOrder = [];

	order.forEach( ( rawEntry ) => {
		const key = migrateOrderEntry( rawEntry );

		if ( key.length > 0 && ! usedKeys.has( key ) ) {
			normalizedOrder.push( key );
			usedKeys.add( key );
		}
	} );

	return normalizedOrder;
};

const areOrdersEqual = ( firstOrder, secondOrder ) => {
	const normalizedFirstOrder = normalizeBlockOrder( firstOrder );
	const normalizedSecondOrder = normalizeBlockOrder( secondOrder );

	if (
		normalizedFirstOrder.length !==
		normalizedSecondOrder.length
	) {
		return false;
	}

	return normalizedFirstOrder.every(
		( key, index ) =>
			key ===
			normalizedSecondOrder[ index ]
	);
};

const getGridTemplateColumns = (
	widths,
	count
) =>
	normalizeWidths( widths, count )
		.map(
			( width ) =>
				`minmax(0, ${ width }fr)`
		)
		.join( ' ' );

const getHandlePositions = ( widths ) => {
	let total = 0;

	return widths
		.slice( 0, -1 )
		.map( ( width ) => {
			total += width;
			return total;
		} );
};

const getColumnLabelPositions = (
	widths
) => {
	let total = 0;

	return widths.map( ( width ) => {
		const center = total + width / 2;
		total += width;

		return center;
	} );
};

const formatPercentage = ( width ) => {
	const numericWidth = Number( width ) || 0;
	const roundedWidth = Number(
		numericWidth.toFixed( 1 )
	);

	return Number.isInteger( roundedWidth )
		? String( Math.round( roundedWidth ) )
		: String( roundedWidth );
};

const getResponsiveColumnWidths = (
	columnWidths,
	device,
	count
) => {
	if ( Array.isArray( columnWidths ) ) {
		return normalizeWidths(
			columnWidths,
			count
		);
	}

	if (
		columnWidths &&
		Array.isArray(
			columnWidths[ device ]
		)
	) {
		return normalizeWidths(
			columnWidths[ device ],
			count
		);
	}

	if (
		columnWidths &&
		Array.isArray(
			columnWidths.desktop
		)
	) {
		return normalizeWidths(
			columnWidths.desktop,
			count
		);
	}

	return getDefaultWidthsForCount( count );
};

const updateResponsiveColumnWidths = (
	columnWidths,
	device,
	nextWidths,
	count
) => {
	const normalizedNextWidths =
		normalizeWidths(
			nextWidths,
			count
		);

	const currentValues =
		columnWidths &&
		typeof columnWidths === 'object' &&
		! Array.isArray( columnWidths )
			? columnWidths
			: {};

	return {
		...currentValues,
		[ device ]: normalizedNextWidths,
	};
};

const getResponsiveVerticalAlignment = (
	verticalAlignment,
	device
) => {
	if (
		typeof verticalAlignment === 'string'
	) {
		return normalizeVerticalAlignment(
			verticalAlignment
		);
	}

	if (
		verticalAlignment &&
		typeof verticalAlignment[ device ] ===
			'string'
	) {
		return normalizeVerticalAlignment(
			verticalAlignment[ device ]
		);
	}

	if (
		verticalAlignment &&
		typeof verticalAlignment.desktop ===
			'string'
	) {
		return normalizeVerticalAlignment(
			verticalAlignment.desktop
		);
	}

	return 'center';
};

const updateResponsiveVerticalAlignment = (
	verticalAlignment,
	device,
	nextAlignment
) => {
	const currentValues =
		verticalAlignment &&
		typeof verticalAlignment === 'object' &&
		! Array.isArray( verticalAlignment )
			? verticalAlignment
			: {};

	return {
		...currentValues,
		[ device ]:
			normalizeVerticalAlignment(
				nextAlignment
			),
	};
};

const normalizeCssSize = ( value ) => {
	if (
		value === null ||
		typeof value === 'undefined'
	) {
		return '';
	}

	if ( typeof value === 'number' ) {
		return `${ value }px`;
	}

	if ( typeof value !== 'string' ) {
		return '';
	}

	return value.trim();
};

const normalizeBorderRadius =
	normalizeCssSize;

const normalizeHeight =
	normalizeCssSize;

const getBorderRadiusNumber = (
	value
) => {
	const normalizedValue =
		normalizeBorderRadius( value );

	const numericValue =
		parseFloat( normalizedValue );

	return Number.isFinite( numericValue )
		? numericValue
		: 0;
};

const getHeightNumber = ( value ) => {
	const normalizedValue =
		normalizeHeight( value );

	const numericValue =
		parseFloat( normalizedValue );

	return Number.isFinite( numericValue )
		? numericValue
		: 0;
};

const normalizeBackgroundColor = (
	value
) => {
	if ( typeof value !== 'string' ) {
		return '';
	}

	return value.trim();
};

/*
 * Returns a device value.
 *
 * Tablet and Mobile inherit Desktop only when they do not have
 * their own attribute key.
 *
 * An explicitly empty device value remains empty and does not
 * automatically become the Desktop value.
 */
const getResponsiveStyleValue = (
	values,
	device,
	normalizeValue
) => {
	if (
		typeof values === 'string' ||
		typeof values === 'number'
	) {
		return normalizeValue( values );
	}

	if (
		! values ||
		typeof values !== 'object' ||
		Array.isArray( values )
	) {
		return '';
	}

	if (
		Object.prototype.hasOwnProperty.call(
			values,
			device
		)
	) {
		return normalizeValue(
			values[ device ]
		);
	}

	if (
		device !== 'desktop' &&
		Object.prototype.hasOwnProperty.call(
			values,
			'desktop'
		)
	) {
		return normalizeValue(
			values.desktop
		);
	}

	return '';
};

/*
 * Only the active device key is changed.
 *
 * The old implementation calculated Desktop/Tablet/Mobile using
 * fallback values and then saved all three keys. That caused one
 * Desktop color to be permanently copied into every device.
 */
const updateResponsiveStyleValue = (
	values,
	device,
	nextValue,
	normalizeValue
) => {
	let currentValues = {};

	if (
		values &&
		typeof values === 'object' &&
		! Array.isArray( values )
	) {
		currentValues = values;
	} else if (
		typeof values === 'string' ||
		typeof values === 'number'
	) {
		currentValues = {
			desktop: normalizeValue( values ),
		};
	}

	return {
		...currentValues,
		[ device ]: normalizeValue( nextValue ),
	};
};

const getResponsiveBorderRadius = (
	borderRadius,
	device
) =>
	getResponsiveStyleValue(
		borderRadius,
		device,
		normalizeBorderRadius
	);

const updateResponsiveBorderRadius = (
	borderRadius,
	device,
	nextRadius
) =>
	updateResponsiveStyleValue(
		borderRadius,
		device,
		nextRadius,
		normalizeBorderRadius
	);

const getResponsiveHeight = (
	height,
	device
) =>
	getResponsiveStyleValue(
		height,
		device,
		normalizeHeight
	);

const updateResponsiveHeight = (
	height,
	device,
	nextHeight
) =>
	updateResponsiveStyleValue(
		height,
		device,
		nextHeight,
		normalizeHeight
	);

const getResponsiveBackgroundColor = (
	backgroundColor,
	device
) =>
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

const getResponsiveBlockOrder = (
	responsiveBlockOrder,
	device
) => {
	if (
		responsiveBlockOrder &&
		Array.isArray(
			responsiveBlockOrder[ device ]
		)
	) {
		return normalizeBlockOrder(
			responsiveBlockOrder[ device ]
		);
	}

	return [];
};

const updateResponsiveBlockOrder = (
	responsiveBlockOrder,
	device,
	nextOrder
) => {
	const currentValues =
		responsiveBlockOrder &&
		typeof responsiveBlockOrder ===
			'object' &&
		! Array.isArray(
			responsiveBlockOrder
		)
			? responsiveBlockOrder
			: {};

	return {
		...currentValues,
		[ device ]:
			normalizeBlockOrder(
				nextOrder
			),
	};
};

const getOrderValueForBlock = (
	compositeKey,
	savedOrder,
	fallbackOrder
) => {
	if (
		! Array.isArray( savedOrder ) ||
		! savedOrder.length
	) {
		return fallbackOrder;
	}

	const position =
		savedOrder.indexOf( compositeKey );

	/*
	 * A block inserted while a different device was active is absent from
	 * this device's saved order. Offsetting the fallback by the saved
	 * length places every unknown block after all known ones instead of
	 * colliding with their order values, while preserving source order
	 * among the unknown blocks themselves.
	 */
	return position !== -1
		? position + 1
		: savedOrder.length + fallbackOrder;
};

const applyEditorSurfaceStyles = (
	rowElement,
	backgroundColor,
	borderRadius,
	verticalAlignment,
	gridTemplateColumns,
	height,
	innerBlocks,
	savedOrder
) => {
	if ( ! rowElement ) {
		return;
	}

	const normalizedBackgroundColor =
		normalizeBackgroundColor( backgroundColor ) || 'transparent';
	const normalizedBorderRadius =
		normalizeBorderRadius( borderRadius ) || '0px';
	const normalizedHeight = normalizeHeight( height );

	const innerBlocksWrap = rowElement.querySelector(
		':scope > .block-editor-inner-blocks'
	);

	/*
	 * useInnerBlocksProps() is spread directly onto the row element, so
	 * the row IS the block list layout — Gutenberg does not nest a
	 * .block-editor-inner-blocks > .block-editor-block-list__layout pair
	 * beneath it. The descendant lookup below therefore returns null in
	 * practice, which is why the per-device CSS `order` was never written
	 * and the canvas always showed a single layout. The lookup is kept as
	 * a fallback in case a future Gutenberg release reintroduces the
	 * wrapper, but the row itself is the default target.
	 */
	const nestedLayoutElement = rowElement.querySelector(
		':scope > .block-editor-inner-blocks > .block-editor-block-list__layout'
	);
	const layoutElement = nestedLayoutElement || rowElement;

	const surfaceElements = Array.from(
		new Set( [ rowElement, layoutElement ] )
	);

	surfaceElements.forEach( ( element ) => {
		element.style.setProperty(
			'background-color',
			normalizedBackgroundColor,
			'important'
		);
		element.style.setProperty(
			'border-radius',
			normalizedBorderRadius,
			'important'
		);
		element.style.setProperty( 'overflow', 'hidden', 'important' );
	} );

	if ( innerBlocksWrap ) {
		innerBlocksWrap.style.setProperty( 'display', 'contents', 'important' );
	}

	if ( layoutElement ) {
		layoutElement.style.setProperty( 'align-items', verticalAlignment );
		layoutElement.style.setProperty( 'box-sizing', 'border-box' );
		layoutElement.style.setProperty( 'display', 'grid', 'important' );
		layoutElement.style.setProperty( 'grid-auto-flow', 'column' );
		layoutElement.style.setProperty(
			'grid-template-columns',
			gridTemplateColumns
		);

		if ( normalizedHeight ) {
			layoutElement.style.setProperty( 'height', normalizedHeight );
		}

		layoutElement.style.setProperty( 'min-width', '0' );
		layoutElement.style.setProperty( 'width', '100%' );
		layoutElement.style.setProperty(
			'--wp--style--block-gap',
			'0px'
		);

		const compositeKeys = getCompositeBlockKeys( innerBlocks );

		/*
		 * Resolve each wrapper by its clientId rather than by child
		 * index. The layout element also contains non-block children
		 * (block appender, drop indicators, popovers), so an index walk
		 * over children silently misaligns the composite keys with the
		 * elements they describe.
		 */
		( Array.isArray( innerBlocks ) ? innerBlocks : [] ).forEach(
			( innerBlock, index ) => {
				const innerClientId = innerBlock?.clientId;

				if ( ! innerClientId ) {
					return;
				}

				let child = null;

				try {
					child = layoutElement.querySelector(
						`:scope > [data-block="${ innerClientId }"]`
					);
				} catch ( error ) {}

				if ( ! child ) {
					return;
				}

				child.style.setProperty( 'box-sizing', 'border-box' );
				child.style.setProperty( 'margin-left', '0' );
				child.style.setProperty( 'margin-right', '0' );
				child.style.setProperty( 'max-width', 'none' );
				child.style.setProperty( 'min-width', '0' );

				const compositeKey = compositeKeys[ index ];
				const fallbackOrder = index + 1;
				const orderValue = compositeKey
					? getOrderValueForBlock(
							compositeKey,
							savedOrder,
							fallbackOrder
					  )
					: fallbackOrder;

				child.style.setProperty(
					'order',
					String( orderValue ),
					'important'
				);
			}
		);
	}
};

const getInnerStyle = (
	columnWidths,
	columnCount,
	verticalAlignment,
	backgroundColor,
	borderRadius,
	height
) => {
	const normalizedBackgroundColor =
		normalizeBackgroundColor(
			backgroundColor
		) || 'transparent';

	const normalizedBorderRadius =
		normalizeBorderRadius(
			borderRadius
		) || '0px';

	const normalizedHeight =
		normalizeHeight( height );

	return {
		alignItems:
			normalizeVerticalAlignment(
				verticalAlignment
			),
		backgroundColor:
			normalizedBackgroundColor,
		borderRadius:
			normalizedBorderRadius,
		boxSizing: 'border-box',
		display: 'grid',
		gridAutoFlow: 'column',
		gridTemplateColumns:
			getGridTemplateColumns(
				columnWidths,
				columnCount
			),
		height:
			normalizedHeight || undefined,
		minWidth: '0',
		overflow: 'hidden',
		width: '100%',
		'--wp--style--block-gap': '0px',
	};
};

function Editor( {
	attributes,
	setAttributes,
	clientId,
} ) {
	const {
		columnWidths = {},
		verticalAlignment = {},
		height = {},
		responsiveBlockOrder = {},
		borderRadius = {},
		backgroundColor = {},
	} = attributes;

	const globalResponsiveDevice =
		useGlobalResponsiveDevice();

	const device =
		normalizeDevice(
			globalResponsiveDevice
		) || 'desktop';

	const wrapperRef = useRef( null );
	const rowRef = useRef( null );
	const resizeStateRef = useRef( null );

	const previousInnerBlockClientIdSignatureRef =
		useRef( null );

	/*
	 * Guards the very first populated render of this component. A ref
	 * resets to its initial value whenever the block remounts — and the
	 * canvas remounts every time the global responsive switch changes
	 * device (the editor iframe is rebuilt). Without this flag the order
	 * capture effect below treats that remount as a user reordering and
	 * overwrites the newly selected device's saved order with the raw
	 * source order, which silently destroys per-device customisation and
	 * makes the canvas preview identical on every device.
	 */
	const hasCapturedInitialOrderRef = useRef( false );

	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleStylesPanel = ( key ) =>
		setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	const [
		activeResizeHandleIndex,
		setActiveResizeHandleIndex,
	] = useState( null );

	const [
		liveHandlePosition,
		setLiveHandlePosition,
	] = useState( null );

	const innerBlocks = useSelect(
		( select ) => {
			const blockEditor =
				select(
					'core/block-editor'
				);

			const blockClientIds =
				blockEditor.getBlockOrder(
					clientId
				);

			return blockClientIds
				.map(
					( innerClientId ) => ( {
						clientId:
							innerClientId,
						name:
							blockEditor.getBlockName(
								innerClientId
							),
					} )
				)
				.filter(
					( innerBlock ) =>
						Boolean( innerBlock.name )
				);
		},
		[ clientId ]
	);

	const innerBlockCompositeKeys = useMemo(
		() => getCompositeBlockKeys( innerBlocks ),
		[ innerBlocks ]
	);

	const innerBlockClientIdSignature = useMemo(
		() =>
			innerBlocks
				.map(
					( innerBlock ) =>
						innerBlock.clientId
				)
				.join( '|' ),
		[ innerBlocks ]
	);

	const activeColumnCount = useMemo(
		() =>
			getActiveColumnCount(
				innerBlocks
			),
		[ innerBlocks ]
	);

	const savedDeviceOrder = useMemo(
		() =>
			getResponsiveBlockOrder(
				responsiveBlockOrder,
				device
			),
		[
			responsiveBlockOrder,
			device,
		]
	);

	const uniqueClassName = useMemo( () => {
		const safeClientId = String(
			clientId || 'default'
		).replace(
			/[^a-zA-Z0-9_-]/g,
			'-'
		);

		return `uplifters-site-builder-blocks-header-section-editor-${ safeClientId }`;
	}, [ clientId ] );

	const normalizedColumnWidths =
		useMemo(
			() =>
				getResponsiveColumnWidths(
					columnWidths,
					device,
					activeColumnCount
				),
			[
				columnWidths,
				device,
				activeColumnCount,
			]
		);

	const normalizedVerticalAlignment =
		useMemo(
			() =>
				getResponsiveVerticalAlignment(
					verticalAlignment,
					device
				),
			[
				verticalAlignment,
				device,
			]
		);

	const normalizedHeight =
		useMemo(
			() =>
				getResponsiveHeight(
					height,
					device
				),
			[
				height,
				device,
			]
		);

	const normalizedBorderRadius =
		useMemo(
			() =>
				getResponsiveBorderRadius(
					borderRadius,
					device
				),
			[
				borderRadius,
				device,
			]
		);

	const normalizedBackgroundColor =
		useMemo(
			() =>
				getResponsiveBackgroundColor(
					backgroundColor,
					device
				),
			[
				backgroundColor,
				device,
			]
		);

	const editorPreviewKey = useMemo(
		() =>
			[
				uniqueClassName,
				device,
				normalizedBackgroundColor ||
					'transparent',
				normalizedBorderRadius ||
					'0px',
				normalizedHeight ||
					'auto',
				normalizedColumnWidths.join(
					'-'
				),
				normalizedVerticalAlignment,
			].join( '|' ),
		[
			uniqueClassName,
			device,
			normalizedBackgroundColor,
			normalizedBorderRadius,
			normalizedHeight,
			normalizedColumnWidths,
			normalizedVerticalAlignment,
		]
	);

	const gridTemplateColumns = getGridTemplateColumns(
		normalizedColumnWidths,
		activeColumnCount
	);

	useEffect( () => {
		applyEditorSurfaceStyles(
			rowRef.current,
			normalizedBackgroundColor,
			normalizedBorderRadius,
			normalizedVerticalAlignment,
			gridTemplateColumns,
			normalizedHeight,
			innerBlocks,
			savedDeviceOrder
		);

		const rowElement = rowRef.current;

		if ( ! rowElement ) {
			return undefined;
		}

		let animationFrameId;
		let timeoutId;
		let observer;

		const repaint = () => {
			applyEditorSurfaceStyles(
				rowElement,
				normalizedBackgroundColor,
				normalizedBorderRadius,
				normalizedVerticalAlignment,
				gridTemplateColumns,
				normalizedHeight,
				innerBlocks,
				savedDeviceOrder
			);
		};

		const scheduleRepaint = () => {
			if ( animationFrameId ) {
				cancelAnimationFrame( animationFrameId );
			}

			animationFrameId = requestAnimationFrame( repaint );
		};

		scheduleRepaint();

		timeoutId = window.setTimeout( repaint, 80 );

		try {
			observer = new MutationObserver( scheduleRepaint );
			observer.observe( rowElement, {
				attributes: true,
				childList: true,
				subtree: true,
			} );
		} catch ( error ) {}

		return () => {
			if ( animationFrameId ) {
				cancelAnimationFrame( animationFrameId );
			}

			if ( timeoutId ) {
				window.clearTimeout( timeoutId );
			}

			if ( observer ) {
				observer.disconnect();
			}
		};
	}, [
		normalizedBackgroundColor,
		normalizedBorderRadius,
		normalizedVerticalAlignment,
		gridTemplateColumns,
		normalizedHeight,
		innerBlocks,
		savedDeviceOrder,
	] );

	/*
	 * Captures the current block order automatically whenever the header
	 * child blocks are reordered in List View (or inserted/deleted) while
	 * a given device is selected in the global responsive switch. This is
	 * the entire feature — there is no manual save/reset UI. Composite
	 * keys (block name + occurrence) are used so two blocks that share a
	 * name are tracked independently.
	 */
	useEffect( () => {
		if ( innerBlockCompositeKeys.length < 1 ) {
			previousInnerBlockClientIdSignatureRef.current =
				innerBlockClientIdSignature;

			return;
		}

		if (
			previousInnerBlockClientIdSignatureRef.current ===
			innerBlockClientIdSignature
		) {
			return;
		}

		previousInnerBlockClientIdSignatureRef.current =
			innerBlockClientIdSignature;

		/*
		 * First populated run after a mount: record the signature only.
		 * Nothing has been reordered yet, so writing here would clobber
		 * the saved order for the active device.
		 */
		if ( ! hasCapturedInitialOrderRef.current ) {
			hasCapturedInitialOrderRef.current = true;

			return;
		}

		if (
			! areOrdersEqual(
				savedDeviceOrder,
				innerBlockCompositeKeys
			)
		) {
			setAttributes( {
				responsiveBlockOrder: updateResponsiveBlockOrder(
					responsiveBlockOrder,
					device,
					innerBlockCompositeKeys
				),
			} );
		}
	}, [
		device,
		innerBlockClientIdSignature,
		innerBlockCompositeKeys,
		responsiveBlockOrder,
		savedDeviceOrder,
		setAttributes,
	] );

	const resizeColumnsRef = useRef( null );
	const stopResizeRef = useRef( null );

	const stopResize = () => {
		resizeStateRef.current = null;

		setActiveResizeHandleIndex(
			null
		);

		setLiveHandlePosition(
			null
		);

		if (
			typeof document !==
				'undefined' &&
			document.body
		) {
			document.body.style.cursor =
				'';

			document.body.style.userSelect =
				'';
		}
	};

	const resizeColumns = (
		clientX
	) => {
		const state =
			resizeStateRef.current;

		if (
			! state ||
			state.rowRect.width <= 0
		) {
			return;
		}

		const clampedClientX =
			Math.min(
				Math.max(
					clientX,
					state.rowRect.left
				),
				state.rowRect.right
			);

		const deltaPercent =
			(
				(
					clampedClientX -
					state.startX
				) /
				state.rowRect.width
			) * 100;

		const combinedWidth =
			state.leftStartWidth +
			state.rightStartWidth;

		let nextLeftWidth =
			state.leftStartWidth +
			deltaPercent;

		let nextRightWidth =
			state.rightStartWidth -
			deltaPercent;

		if (
			nextLeftWidth <
			MIN_COLUMN_WIDTH
		) {
			nextLeftWidth =
				MIN_COLUMN_WIDTH;

			nextRightWidth =
				combinedWidth -
				MIN_COLUMN_WIDTH;
		}

		if (
			nextRightWidth <
			MIN_COLUMN_WIDTH
		) {
			nextRightWidth =
				MIN_COLUMN_WIDTH;

			nextLeftWidth =
				combinedWidth -
				MIN_COLUMN_WIDTH;
		}

		if (
			nextLeftWidth <
				MIN_COLUMN_WIDTH ||
			nextRightWidth <
				MIN_COLUMN_WIDTH
		) {
			return;
		}

		const nextWidths = [
			...state.startWidths,
		];

		nextWidths[
			state.leftIndex
		] = nextLeftWidth;

		nextWidths[
			state.rightIndex
		] = nextRightWidth;

		let cumulativeLeft = 0;

		for (
			let widthIndex = 0;
			widthIndex <= state.leftIndex;
			widthIndex++
		) {
			cumulativeLeft +=
				nextWidths[ widthIndex ];
		}

		setLiveHandlePosition( {
			index: state.leftIndex,
			position: cumulativeLeft,
		} );

		setAttributes( {
			columnWidths:
				updateResponsiveColumnWidths(
					columnWidths,
					state.device,
					nextWidths,
					state.columnCount
				),
		} );
	};

	const startResize = (
		event,
		handleIndex
	) => {
		if ( event.button !== 0 ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const rowElement =
			rowRef.current;

		if ( ! rowElement ) {
			return;
		}

		const startWidths = [
			...normalizedColumnWidths,
		];

		const leftIndex =
			handleIndex;

		const rightIndex =
			handleIndex + 1;

		resizeStateRef.current = {
			device,
			columnCount:
				activeColumnCount,
			rowRect:
				rowElement.getBoundingClientRect(),
			startX: event.clientX,
			startWidths,
			leftIndex,
			rightIndex,
			leftStartWidth:
				startWidths[
					leftIndex
				],
			rightStartWidth:
				startWidths[
					rightIndex
				],
		};

		setActiveResizeHandleIndex(
			handleIndex
		);

		if (
			typeof document !==
				'undefined' &&
			document.body
		) {
			document.body.style.cursor =
				'col-resize';

			document.body.style.userSelect =
				'none';
		}

		if (
			event.currentTarget
				.setPointerCapture
		) {
			event.currentTarget.setPointerCapture(
				event.pointerId
			);
		}
	};

	const handleResizeMove = (
		event
	) => {
		if (
			! resizeStateRef.current
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		resizeColumns(
			event.clientX
		);
	};

	resizeColumnsRef.current = resizeColumns;
	stopResizeRef.current = stopResize;

	/*
	 * Drag চলাকালীন window এ move/up listener বসানো হয়।
	 * Pointer capture ভেঙে গেলেও এতে handle pointer-এর সাথে
	 * নিখুঁতভাবে চলতে থাকে — কোনো ঝাঁকুনি হয় না।
	 */
	useEffect( () => {
		if (
			activeResizeHandleIndex ===
			null
		) {
			return undefined;
		}

		if (
			typeof window ===
			'undefined'
		) {
			return undefined;
		}

		const onMove = ( event ) => {
			if (
				! resizeStateRef.current
			) {
				return;
			}

			if (
				typeof resizeColumnsRef.current ===
				'function'
			) {
				resizeColumnsRef.current(
					event.clientX
				);
			}
		};

		const onUp = () => {
			if (
				typeof stopResizeRef.current ===
				'function'
			) {
				stopResizeRef.current();
			}
		};

		window.addEventListener(
			'pointermove',
			onMove
		);

		window.addEventListener(
			'pointerup',
			onUp
		);

		window.addEventListener(
			'pointercancel',
			onUp
		);

		return () => {
			window.removeEventListener(
				'pointermove',
				onMove
			);

			window.removeEventListener(
				'pointerup',
				onUp
			);

			window.removeEventListener(
				'pointercancel',
				onUp
			);
		};
	}, [ activeResizeHandleIndex ] );

	const handleResizeEnd = (
		event
	) => {
		if (
			event.currentTarget
				.releasePointerCapture
		) {
			try {
				event.currentTarget.releasePointerCapture(
					event.pointerId
				);
			} catch ( error ) {}
		}

		stopResize();
	};

	const updateVerticalAlignment = (
		nextAlignment
	) => {
		setAttributes( {
			verticalAlignment:
				updateResponsiveVerticalAlignment(
					verticalAlignment,
					device,
					nextAlignment
				),
		} );
	};

	const updateHeight = (
		nextHeight
	) => {
		setAttributes( {
			height:
				updateResponsiveHeight(
					height,
					device,
					nextHeight
						? `${ nextHeight }px`
						: ''
				),
		} );
	};

	const updateBorderRadius = (
		nextRadius
	) => {
		setAttributes( {
			borderRadius:
				updateResponsiveBorderRadius(
					borderRadius,
					device,
					nextRadius
						? `${ nextRadius }px`
						: ''
				),
		} );
	};

	const updateBackgroundColor = (
		nextBackgroundColor
	) => {
		setAttributes( {
			backgroundColor:
				updateResponsiveBackgroundColor(
					backgroundColor,
					device,
					nextBackgroundColor || ''
				),
		} );
	};

	/*
	 * Gutenberg may preserve the InnerBlocks canvas DOM between renders.
	 * Apply the currently active device color directly to every editor
	 * canvas layer so switching Desktop/Tablet/Mobile updates instantly.
	 */
	useEffect( () => {
		const wrapper = wrapperRef.current;

		if ( ! wrapper ) {
			return;
		}

		const activeBackgroundColor =
			normalizedBackgroundColor ||
			'transparent';

		const previewElements = [
			wrapper,
			...wrapper.querySelectorAll(
				'.uplifters-site-builder-blocks-header-section__inner, ' +
				'.block-editor-inner-blocks, ' +
				'.block-editor-block-list__layout'
			),
		];

		previewElements.forEach( ( element ) => {
			if ( element?.style ) {
				element.style.setProperty(
					'background-color',
					activeBackgroundColor,
					'important'
				);
			}
		} );
	}, [ device, normalizedBackgroundColor, innerBlocks.length ] );

	const previewStyle = {
		backgroundColor:
			normalizedBackgroundColor ||
			'transparent',
		borderRadius:
			normalizedBorderRadius ||
			'0px',
		boxSizing: 'border-box',
		position: 'relative',
		width: '100%',
	};

	const blockProps = useBlockProps( {
		ref: wrapperRef,

		className:
			`uplifters-site-builder-blocks-header-section ` +
			`uplifters-site-builder-blocks-header-section-editor ` +
			`${ uniqueClassName } ` +
			`uplifters-site-builder-blocks-responsive-device-${ device }`,

		'data-uplifters-site-builder-blocks-responsive-device':
			device,

		'data-uplifters-site-builder-blocks-background-color':
			normalizedBackgroundColor ||
			'transparent',

		style: previewStyle,
	} );

	const innerBlocksProps =
		useInnerBlocksProps(
			{
				ref: rowRef,

				className:
					'uplifters-site-builder-blocks-header-section__inner',

				'data-uplifters-site-builder-blocks-inner-preview-key':
					editorPreviewKey,

				'data-uplifters-site-builder-blocks-responsive-device':
					device,

				style: getInnerStyle(
					normalizedColumnWidths,
					activeColumnCount,
					normalizedVerticalAlignment,
					normalizedBackgroundColor,
					normalizedBorderRadius,
					normalizedHeight
				),
			},
			{
				template:
					TEMPLATE,

				templateLock:
					false,

				orientation:
					'horizontal',

				renderAppender:
					false,
			}
		);

	const handlePositions =
		getHandlePositions(
			normalizedColumnWidths
		);

	const columnLabelPositions =
		getColumnLabelPositions(
			normalizedColumnWidths
		);

	const isResizing =
		activeResizeHandleIndex !==
		null;

	return (
		<>
			<InspectorControls group="settings">
				<div aria-hidden="true" />
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf(
						__(
							'Layout — %s',
							'uplifters-site-builder-blocks'
						),
						DEVICE_LABELS[
							device
						]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'layout' }
					onToggle={ () => toggleStylesPanel( 'layout' ) }
				>
					<RangeControl
						label={ __(
							'Height',
							'uplifters-site-builder-blocks'
						) }
						value={ getHeightNumber(
							normalizedHeight
						) }
						onChange={
							updateHeight
						}
						min={ 0 }
						max={ 1000 }
						step={ 1 }
						withInputField={
							false
						}
					/>

					<SelectControl
						label={ __(
							'Vertical Alignment',
							'uplifters-site-builder-blocks'
						) }
						value={
							normalizedVerticalAlignment
						}
						options={
							VERTICAL_ALIGNMENT_OPTIONS
						}
						onChange={
							updateVerticalAlignment
						}
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						__(
							'Spacing — %s',
							'uplifters-site-builder-blocks'
						),
						DEVICE_LABELS[
							device
						]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<RangeControl
						label={ __(
							'Border Radius',
							'uplifters-site-builder-blocks'
						) }
						value={ getBorderRadiusNumber(
							normalizedBorderRadius
						) }
						onChange={
							updateBorderRadius
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
						withInputField={
							false
						}
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						__(
							'Colors — %s',
							'uplifters-site-builder-blocks'
						),
						DEVICE_LABELS[
							device
						]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'colors' }
					onToggle={ () => toggleStylesPanel( 'colors' ) }
				>
					<p>{ __(
						'Background Color',
						'uplifters-site-builder-blocks'
					) }</p>

					<ColorPalette
						value={
							normalizedBackgroundColor
						}
						onChange={
							updateBackgroundColor
						}
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div
				{ ...blockProps }
			>
				<div
					{ ...innerBlocksProps }
				/>

			{ /* Column width badges — always visible, sticky to top of block */ }
			<div
				aria-hidden="true"
				style={ {
					position: 'sticky',
					top: '8px',
					height: 0,
					width: '100%',
					zIndex: 1000,
					pointerEvents: 'none',
				} }
			>
				{ columnLabelPositions.map( ( position, index ) => {
					const isActiveColumn =
						isResizing &&
						( index === activeResizeHandleIndex ||
							index === activeResizeHandleIndex + 1 );

					return (
						<span
							key={ index }
							style={ {
								position: 'absolute',
								left: `${ position }%`,
								top: 0,
								padding: '4px 8px',
								borderRadius: '999px',
								background: isActiveColumn
									? '#3858e9'
									: '#1e1e1e',
								color: '#fff',
								fontSize: '12px',
								fontWeight: 600,
								lineHeight: 1.2,
								whiteSpace: 'nowrap',
								boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
								transform: 'translateX(-50%)',
								opacity: isResizing ? 1 : 0.85,
								transition: 'background 120ms ease, opacity 120ms ease',
								pointerEvents: 'none',
							} }
						>
							{ `${ formatPercentage(
								normalizedColumnWidths[ index ]
							) }%` }
						</span>
					);
				} ) }
			</div>

				{ handlePositions.map(
					(
						position,
						index
					) => {
						const handleLeft =
							liveHandlePosition &&
							liveHandlePosition.index ===
								index
								? liveHandlePosition.position
								: position;

						return (
						<button
							key={
								index
							}
							type="button"
							aria-label={ __(
								'Resize header section columns',
								'uplifters-site-builder-blocks'
							) }
							onPointerDown={ (
								event
							) =>
								startResize(
									event,
									index
								)
							}
							onPointerMove={
								handleResizeMove
							}
							onPointerUp={
								handleResizeEnd
							}
							onPointerCancel={
								handleResizeEnd
							}
							style={ {
								position:
									'absolute',

								left:
									`${ handleLeft }%`,

								top:
									'50%',

								width:
									'24px',

								height:
									'24px',

								padding:
									0,

								border:
									'2px solid #1e1e1e',

								borderRadius:
									'999px',

								background:
									activeResizeHandleIndex ===
									index
										? '#1e1e1e'
										: '#fff',

								boxShadow:
									'0 1px 4px rgba(0,0,0,0.25)',

								transform:
									'translate(-50%, -50%)',

								cursor:
									'col-resize',

								zIndex:
									999,

								touchAction:
									'none',

								pointerEvents:
									'auto',
							} }
						/>
						);
					}
				) }
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="header-section" /> : <Editor { ...props } />;
}
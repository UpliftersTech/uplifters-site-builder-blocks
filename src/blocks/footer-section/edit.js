import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

/*
 * footer-section places no restriction on its inner blocks — any block may be
 * inserted here, matching posts-section. This constant is retained only to
 * feed the default TEMPLATE below and is deliberately NOT passed to
 * useInnerBlocksProps as `allowedBlocks`.
 */
const ALLOWED_BLOCKS = [
	'uplifters-site-builder-blocks/site-logo',
	'uplifters-site-builder-blocks/social-icon',
	'uplifters-site-builder-blocks/page-grid',
	'uplifters-site-builder-blocks/copyright-component-rearrange',
];

const TEMPLATE = [
	[ 'uplifters-site-builder-blocks/site-logo', {} ],
	[ 'uplifters-site-builder-blocks/social-icon', {} ],
	[ 'uplifters-site-builder-blocks/page-grid', {} ],
	[ 'uplifters-site-builder-blocks/copyright-component-rearrange', {} ],
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

const MAX_COLUMN_COUNT = 4;
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

const getActiveColumnCount = ( innerBlocks ) => {
	if ( Array.isArray( innerBlocks ) && innerBlocks.length > 0 ) {
		return innerBlocks.length;
	}

	return MAX_COLUMN_COUNT;
};

const getEqualWidths = ( count ) => {
	return Array.from( { length: count }, () => 100 / count );
};

const normalizeWidths = ( widths, count ) => {
	if ( ! Array.isArray( widths ) || widths.length !== count ) {
		return getEqualWidths( count );
	}

	const numericWidths = widths.map( ( width ) => Number( width ) || 0 );
	const total = numericWidths.reduce( ( sum, width ) => sum + width, 0 );

	if ( total <= 0 ) {
		return getEqualWidths( count );
	}

	return numericWidths.map( ( width ) =>
		Number( ( ( width / total ) * 100 ).toFixed( 4 ) )
	);
};

const normalizeVerticalAlignment = ( value ) => {
	const allowedValues = VERTICAL_ALIGNMENT_OPTIONS.map(
		( option ) => option.value
	);

	if ( allowedValues.includes( value ) ) {
		return value;
	}

	return 'center';
};

const getGridTemplateColumns = ( widths, count ) => {
	return normalizeWidths( widths, count )
		.map( ( width ) => `minmax(0, ${ width }fr)` )
		.join( ' ' );
};

const getHandlePositions = ( widths ) => {
	let total = 0;

	return widths.slice( 0, -1 ).map( ( width ) => {
		total += width;
		return total;
	} );
};

const getColumnLabelPositions = ( widths ) => {
	let total = 0;

	return widths.map( ( width ) => {
		const center = total + width / 2;
		total += width;

		return center;
	} );
};

const formatPercentage = ( width ) => {
	const numericWidth = Number( width ) || 0;
	const roundedWidth = Number( numericWidth.toFixed( 1 ) );

	return Number.isInteger( roundedWidth )
		? String( Math.round( roundedWidth ) )
		: String( roundedWidth );
};

const getResponsiveColumnWidths = ( columnWidths, device, count ) => {
	if ( Array.isArray( columnWidths ) ) {
		return normalizeWidths( columnWidths, count );
	}

	if ( columnWidths && Array.isArray( columnWidths[ device ] ) ) {
		return normalizeWidths( columnWidths[ device ], count );
	}

	if ( columnWidths && Array.isArray( columnWidths.desktop ) ) {
		return normalizeWidths( columnWidths.desktop, count );
	}

	return getEqualWidths( count );
};

const updateResponsiveColumnWidths = (
	columnWidths,
	device,
	nextWidths,
	count
) => {
	const normalizedNextWidths = normalizeWidths( nextWidths, count );

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

const getResponsiveVerticalAlignment = ( verticalAlignment, device ) => {
	if ( typeof verticalAlignment === 'string' ) {
		return normalizeVerticalAlignment( verticalAlignment );
	}

	if (
		verticalAlignment &&
		typeof verticalAlignment[ device ] === 'string'
	) {
		return normalizeVerticalAlignment( verticalAlignment[ device ] );
	}

	if (
		verticalAlignment &&
		typeof verticalAlignment.desktop === 'string'
	) {
		return normalizeVerticalAlignment( verticalAlignment.desktop );
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
		[ device ]: normalizeVerticalAlignment( nextAlignment ),
	};
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

const normalizeHeight = normalizePixelNumber;

const normalizeBorderRadius = ( value ) => normalizePixelNumber( value );

const normalizeGap = ( value ) => normalizePixelNumber( value );

const getPixelStyleValue = ( value ) => {
	const normalizedValue = normalizePixelNumber( value );

	return normalizedValue > 0 ? `${ normalizedValue }px` : '';
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
 * their own attribute key.
 *
 * An explicitly empty device value remains empty and does not
 * automatically become the Desktop value.
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

/*
 * Only the active device key is changed.
 *
 * The old implementation calculated Desktop/Tablet/Mobile using
 * fallback values and then saved all three keys. That caused one
 * Desktop value to be permanently copied into every device.
 */
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

const getResponsiveHeight = ( height, device ) =>
	getResponsiveStyleValue( height, device, normalizeHeight );

const updateResponsiveHeight = ( height, device, nextHeight ) =>
	updateResponsiveStyleValue( height, device, nextHeight, normalizeHeight );

const getResponsiveBorderRadius = ( borderRadius, device ) =>
	getResponsiveStyleValue( borderRadius, device, normalizeBorderRadius );

const updateResponsiveBorderRadius = ( borderRadius, device, nextRadius ) =>
	updateResponsiveStyleValue(
		borderRadius,
		device,
		nextRadius,
		normalizeBorderRadius
	);

const getResponsiveGap = ( gap, device ) =>
	getResponsiveStyleValue( gap, device, normalizeGap );

const updateResponsiveGap = ( gap, device, nextGap ) =>
	updateResponsiveStyleValue( gap, device, nextGap, normalizeGap );

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

const applyEditorSurfaceStyles = (
	rowElement,
	backgroundColor,
	borderRadius,
	verticalAlignment,
	gridAutoFlow,
	gridTemplateColumns,
	height,
	gap
) => {
	if ( ! rowElement ) {
		return;
	}

	const normalizedBackgroundColor =
		normalizeBackgroundColor( backgroundColor ) || 'transparent';
	const normalizedBorderRadius =
		getPixelStyleValue( borderRadius ) || '0px';
	const normalizedHeight = getPixelStyleValue( height ) || 'auto';
	const normalizedGap = getPixelStyleValue( gap ) || '0px';

	const innerBlocksWrap = rowElement.querySelector(
		':scope > .block-editor-inner-blocks'
	);
	const layoutElement = rowElement.querySelector(
		':scope > .block-editor-inner-blocks > .block-editor-block-list__layout'
	);

	const surfaceElements = [ rowElement, layoutElement ].filter( Boolean );

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
		layoutElement.style.setProperty( 'box-sizing', 'border-box' );
		layoutElement.style.setProperty( 'display', 'grid', 'important' );
		layoutElement.style.setProperty( 'align-content', verticalAlignment );
		layoutElement.style.setProperty( 'align-items', verticalAlignment );
		layoutElement.style.setProperty( 'grid-auto-flow', gridAutoFlow );
		layoutElement.style.setProperty(
			'grid-template-columns',
			gridTemplateColumns
		);
		layoutElement.style.setProperty( 'height', normalizedHeight );
		layoutElement.style.setProperty( 'gap', normalizedGap );
		layoutElement.style.setProperty( 'min-width', '0' );
		layoutElement.style.setProperty( 'width', '100%' );
		layoutElement.style.setProperty(
			'--wp--style--block-gap',
			normalizedGap
		);

		Array.from( layoutElement.children ).forEach( ( child, index ) => {
			child.style.setProperty( 'box-sizing', 'border-box' );
			child.style.setProperty( 'min-width', '0' );
			child.style.setProperty( 'max-width', 'none' );
			child.style.setProperty( 'margin-left', '0' );
			child.style.setProperty( 'margin-right', '0' );

			child.style.setProperty(
				'order',
				String( index + 1 ),
				'important'
			);
		} );
	}
};

const getInnerStyle = (
	columnWidths,
	columnCount,
	verticalAlignment,
	backgroundColor,
	borderRadius,
	height,
	gap,
	isMobileStackActive
) => {
	const normalizedBackgroundColor =
		normalizeBackgroundColor( backgroundColor ) || 'transparent';
	const normalizedBorderRadius =
		getPixelStyleValue( borderRadius ) || '0px';

	return {
		alignContent: normalizeVerticalAlignment( verticalAlignment ),
		alignItems: normalizeVerticalAlignment( verticalAlignment ),
		backgroundColor: normalizedBackgroundColor,
		borderRadius: normalizedBorderRadius,
		boxSizing: 'border-box',
		display: 'grid',
		gridAutoFlow: isMobileStackActive ? 'row' : 'column',
		gridTemplateColumns: isMobileStackActive
			? 'minmax(0, 1fr)'
			: getGridTemplateColumns( columnWidths, columnCount ),
		height: getPixelStyleValue( height ) || 'auto',
		gap: getPixelStyleValue( gap ) || '0px',
		minWidth: '0',
		overflow: 'hidden',
		width: '100%',
		'--wp--style--block-gap': getPixelStyleValue( gap ) || '0px',
	};
};

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		columnWidths = {},
		verticalAlignment = {},
		height = {},
		mobileStack = false,
		borderRadius = {},
		gap = {},
		backgroundColor = {},
	} = attributes;

	const globalResponsiveDevice = useGlobalResponsiveDevice();
	const device = normalizeDevice( globalResponsiveDevice ) || 'desktop';
	const isMobileStackActive = Boolean( mobileStack ) && device === 'mobile';

	const wrapperRef = useRef( null );
	const rowRef = useRef( null );
	const resizeStateRef = useRef( null );
	const resizeColumnsRef = useRef( null );
	const stopResizeRef = useRef( null );

	const [ activeResizeHandleIndex, setActiveResizeHandleIndex ] =
		useState( null );

	const [ liveHandlePosition, setLiveHandlePosition ] = useState( null );

	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleSettingsPanel = ( key ) => setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	const innerBlocks = useSelect(
		( select ) => {
			const blockEditor = select( 'core/block-editor' );
			const blockClientIds = blockEditor.getBlockOrder( clientId );

			return blockClientIds
				.map( ( innerClientId ) => ( {
					clientId: innerClientId,
					name: blockEditor.getBlockName( innerClientId ),
				} ) )
				.filter( ( innerBlock ) => Boolean( innerBlock.name ) );
		},
		[ clientId ]
	);

	const activeColumnCount = useMemo(
		() => getActiveColumnCount( innerBlocks ),
		[ innerBlocks ]
	);

	const uniqueClassName = useMemo( () => {
		const safeClientId = String( clientId || 'default' ).replace(
			/[^a-zA-Z0-9_-]/g,
			'-'
		);

		return `uplifters-site-builder-blocks-footer-section-editor-${ safeClientId }`;
	}, [ clientId ] );

	const normalizedColumnWidths = useMemo(
		() =>
			getResponsiveColumnWidths(
				columnWidths,
				device,
				activeColumnCount
			),
		[ columnWidths, device, activeColumnCount ]
	);

	const normalizedVerticalAlignment = useMemo(
		() => getResponsiveVerticalAlignment( verticalAlignment, device ),
		[ verticalAlignment, device ]
	);

	const normalizedHeight = useMemo(
		() => getResponsiveHeight( height, device ),
		[ height, device ]
	);

	const normalizedBorderRadius = useMemo(
		() => getResponsiveBorderRadius( borderRadius, device ),
		[ borderRadius, device ]
	);

	const normalizedGap = useMemo(
		() => getResponsiveGap( gap, device ),
		[ gap, device ]
	);

	const normalizedBackgroundColor = useMemo(
		() => getResponsiveBackgroundColor( backgroundColor, device ),
		[ backgroundColor, device ]
	);

	const editorPreviewKey = useMemo(
		() =>
			[
				uniqueClassName,
				device,
				normalizedBackgroundColor || 'transparent',
				normalizedBorderRadius || 0,
				normalizedHeight || 'auto',
				normalizedGap || 0,
				normalizedColumnWidths.join( '-' ),
				normalizedVerticalAlignment,
				isMobileStackActive ? 'stacked' : 'inline',
			].join( '|' ),
		[
			uniqueClassName,
			device,
			normalizedBackgroundColor,
			normalizedBorderRadius,
			normalizedHeight,
			normalizedGap,
			normalizedColumnWidths,
			normalizedVerticalAlignment,
			isMobileStackActive,
		]
	);

	const gridAutoFlow = isMobileStackActive ? 'row' : 'column';
	const gridTemplateColumns = isMobileStackActive
		? 'minmax(0, 1fr)'
		: getGridTemplateColumns( normalizedColumnWidths, activeColumnCount );

	useEffect( () => {
		applyEditorSurfaceStyles(
			rowRef.current,
			normalizedBackgroundColor,
			normalizedBorderRadius,
			normalizedVerticalAlignment,
			gridAutoFlow,
			gridTemplateColumns,
			normalizedHeight,
			normalizedGap
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
				gridAutoFlow,
				gridTemplateColumns,
				normalizedHeight,
				normalizedGap
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
		gridAutoFlow,
		gridTemplateColumns,
		normalizedHeight,
		normalizedGap,
	] );

	const stopResize = () => {
		resizeStateRef.current = null;
		setActiveResizeHandleIndex( null );
		setLiveHandlePosition( null );

		if ( typeof document !== 'undefined' && document.body ) {
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}
	};

	const resizeColumns = ( clientX ) => {
		if ( ! resizeStateRef.current || isMobileStackActive ) {
			return;
		}

		const {
			rowRect,
			startX,
			startWidths,
			leftIndex,
			rightIndex,
			leftStartWidth,
			rightStartWidth,
		} = resizeStateRef.current;

		const rowWidth = rowRect.width || 1;

		const clampedClientX = Math.min(
			Math.max( clientX, rowRect.left ),
			rowRect.right
		);

		const deltaPercent = ( ( clampedClientX - startX ) / rowWidth ) * 100;
		const pairTotal = leftStartWidth + rightStartWidth;

		let nextLeftWidth = leftStartWidth + deltaPercent;
		let nextRightWidth = rightStartWidth - deltaPercent;

		if ( nextLeftWidth < MIN_COLUMN_WIDTH ) {
			nextLeftWidth = MIN_COLUMN_WIDTH;
			nextRightWidth = pairTotal - MIN_COLUMN_WIDTH;
		}

		if ( nextRightWidth < MIN_COLUMN_WIDTH ) {
			nextRightWidth = MIN_COLUMN_WIDTH;
			nextLeftWidth = pairTotal - MIN_COLUMN_WIDTH;
		}

		const nextWidths = [ ...startWidths ];
		nextWidths[ leftIndex ] = nextLeftWidth;
		nextWidths[ rightIndex ] = nextRightWidth;

		let cumulativeLeft = 0;

		for ( let widthIndex = 0; widthIndex <= leftIndex; widthIndex++ ) {
			cumulativeLeft += nextWidths[ widthIndex ];
		}

		setLiveHandlePosition( {
			index: leftIndex,
			position: cumulativeLeft,
		} );

		setAttributes( {
			columnWidths: updateResponsiveColumnWidths(
				columnWidths,
				device,
				nextWidths,
				activeColumnCount
			),
		} );
	};

	const startResize = ( event, handleIndex ) => {
		if ( event.button !== 0 || isMobileStackActive ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const rowElement = rowRef.current;

		if ( ! rowElement ) {
			return;
		}

		const startWidths = [ ...normalizedColumnWidths ];
		const leftIndex = handleIndex;
		const rightIndex = handleIndex + 1;

		resizeStateRef.current = {
			device,
			rowRect: rowElement.getBoundingClientRect(),
			startX: event.clientX,
			startWidths,
			leftIndex,
			rightIndex,
			leftStartWidth: startWidths[ leftIndex ],
			rightStartWidth: startWidths[ rightIndex ],
		};

		setActiveResizeHandleIndex( handleIndex );

		if ( typeof document !== 'undefined' && document.body ) {
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		}

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	const handleResizeMove = ( event ) => {
		if ( ! resizeStateRef.current ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		resizeColumns( event.clientX );
	};

	const handleResizeEnd = ( event ) => {
		if ( event.currentTarget.releasePointerCapture ) {
			try {
				event.currentTarget.releasePointerCapture( event.pointerId );
			} catch ( error ) {}
		}

		stopResize();
	};

	resizeColumnsRef.current = resizeColumns;
	stopResizeRef.current = stopResize;

	/*
	 * Move/up listeners live on the window while a drag is active.
	 * The handle keeps following the pointer even if pointer capture
	 * is lost, so the drag never jumps.
	 */
	useEffect( () => {
		if ( activeResizeHandleIndex === null ) {
			return undefined;
		}

		if ( typeof window === 'undefined' ) {
			return undefined;
		}

		const onMove = ( event ) => {
			if ( ! resizeStateRef.current ) {
				return;
			}

			if ( typeof resizeColumnsRef.current === 'function' ) {
				resizeColumnsRef.current( event.clientX );
			}
		};

		const onUp = () => {
			if ( typeof stopResizeRef.current === 'function' ) {
				stopResizeRef.current();
			}
		};

		window.addEventListener( 'pointermove', onMove );
		window.addEventListener( 'pointerup', onUp );
		window.addEventListener( 'pointercancel', onUp );

		return () => {
			window.removeEventListener( 'pointermove', onMove );
			window.removeEventListener( 'pointerup', onUp );
			window.removeEventListener( 'pointercancel', onUp );
		};
	}, [ activeResizeHandleIndex ] );

	const updateHeight = ( nextHeight ) => {
		setAttributes( {
			height: updateResponsiveHeight(
				height,
				device,
				nextHeight
			),
		} );
	};

	const updateVerticalAlignment = ( nextAlignment ) => {
		setAttributes( {
			verticalAlignment: updateResponsiveVerticalAlignment(
				verticalAlignment,
				device,
				nextAlignment
			),
		} );
	};

	const updateMobileStack = ( nextMobileStack ) => {
		setAttributes( {
			mobileStack: Boolean( nextMobileStack ),
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

	const updateGap = ( nextGap ) => {
		setAttributes( {
			gap: updateResponsiveGap( gap, device, nextGap ),
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
			normalizedBackgroundColor || 'transparent';

		const previewElements = [
			wrapper,
			...wrapper.querySelectorAll(
				'.uplifters-site-builder-blocks-footer-section__inner, ' +
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

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: `uplifters-site-builder-blocks-footer-section uplifters-site-builder-blocks-footer-section-editor ${ uniqueClassName } uplifters-site-builder-blocks-responsive-device-${ device }`,
		'data-uplifters-site-builder-blocks-footer-section': 'true',
		'data-uplifters-site-builder-blocks-background-color':
			normalizedBackgroundColor || 'transparent',
		'data-uplifters-site-builder-blocks-responsive-device': device,
		'data-uplifters-site-builder-blocks-column-count': activeColumnCount,
		'data-uplifters-site-builder-blocks-mobile-stack': mobileStack ? 'true' : 'false',
		style: {
			boxSizing: 'border-box',
			position: 'relative',
			width: '100%',
		},
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			ref: rowRef,
			className: 'uplifters-site-builder-blocks-footer-section__inner',
			'data-uplifters-site-builder-blocks-footer-section-inner': 'true',
			'data-uplifters-site-builder-blocks-inner-preview-key': editorPreviewKey,
			'data-uplifters-site-builder-blocks-responsive-device': device,
			style: getInnerStyle(
				normalizedColumnWidths,
				activeColumnCount,
				normalizedVerticalAlignment,
				normalizedBackgroundColor,
				normalizedBorderRadius,
				normalizedHeight,
				normalizedGap,
				isMobileStackActive
			),
		},
		{
			template: TEMPLATE,
			templateLock: false,
			orientation: isMobileStackActive ? 'vertical' : 'horizontal',
			renderAppender: false,
		}
	);

	const handlePositions = getHandlePositions( normalizedColumnWidths );
	const columnLabelPositions = getColumnLabelPositions(
		normalizedColumnWidths
	);
	const isResizing = activeResizeHandleIndex !== null;
	const showColumnControls = ! isMobileStackActive;

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={ __( 'Structure', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'structure' }
					onToggle={ () => toggleSettingsPanel( 'structure' ) }
				>
					<ToggleControl
						label={ __( 'Mobile Stack', 'uplifters-site-builder-blocks' ) }
						checked={ Boolean( mobileStack ) }
						onChange={ updateMobileStack }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf(
						__( 'Layout — %s', 'uplifters-site-builder-blocks' ),
						DEVICE_LABELS[ device ]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'layout' }
					onToggle={ () => toggleStylesPanel( 'layout' ) }
				>
					<RangeControl
						label={ __( 'Height', 'uplifters-site-builder-blocks' ) }
						value={ normalizedHeight }
						onChange={ updateHeight }
						min={ 0 }
						max={ 1000 }
						step={ 1 }
						renderTooltipContent={ ( value ) =>
							value > 0 ? `${ value }px` : __( 'Auto', 'uplifters-site-builder-blocks' )
						}
					/>

					<SelectControl
						label={ __( 'Vertical Alignment', 'uplifters-site-builder-blocks' ) }
						value={ normalizedVerticalAlignment }
						options={ VERTICAL_ALIGNMENT_OPTIONS }
						onChange={ updateVerticalAlignment }
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						__( 'Spacing — %s', 'uplifters-site-builder-blocks' ),
						DEVICE_LABELS[ device ]
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<RangeControl
						label={ __( 'Gap', 'uplifters-site-builder-blocks' ) }
						value={ normalizedGap }
						onChange={ updateGap }
						min={ 0 }
						max={ 200 }
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

				{ showColumnControls &&
					columnLabelPositions.map( ( position, index ) => (
						<span
							key={ `footer-column-label-${ index }` }
							aria-hidden="true"
							style={ {
								position: 'absolute',
								left: `${ position }%`,
								top: '-22px',
								transform: 'translateX(-50%)',
								fontSize: '11px',
								lineHeight: '1',
								padding: '2px 6px',
								borderRadius: '999px',
								background: '#1e1e1e',
								color: '#fff',
								pointerEvents: 'none',
								opacity: isResizing ? 1 : 0.85,
								zIndex: 1000,
							} }
						>
							{ `${ formatPercentage(
								normalizedColumnWidths[ index ]
							) }%` }
						</span>
					) ) }

				{ showColumnControls &&
					handlePositions.map( ( position, index ) => {
						const handleLeft =
							liveHandlePosition &&
							liveHandlePosition.index === index
								? liveHandlePosition.position
								: position;

						return (
							<button
								key={ index }
								type="button"
								aria-label={ __( 'Resize footer section columns', 'uplifters-site-builder-blocks' ) }
								onPointerDown={ ( event ) => startResize( event, index ) }
								onPointerMove={ handleResizeMove }
								onPointerUp={ handleResizeEnd }
								onPointerCancel={ handleResizeEnd }
								style={ {
									position: 'absolute',
									left: `${ handleLeft }%`,
									top: '50%',
									width: '24px',
									height: '24px',
									padding: 0,
									border: '2px solid #1e1e1e',
									borderRadius: '999px',
									background:
										activeResizeHandleIndex === index
											? '#1e1e1e'
											: '#fff',
									boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
									transform: 'translate(-50%, -50%)',
									cursor: 'col-resize',
									zIndex: 999,
									touchAction: 'none',
									pointerEvents: 'auto',
								} }
							/>
						);
					} ) }
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="footer-section" /> : <Editor { ...props } />;
}
import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview-register';
import ResponsiveOrderControl, {
	getDocumentMove,
	getNaturalOrder,
	getSlotOrder,
	remapSequence,
	resolveOrder,
	useChildOrder,
	withSlotMoved,
	withSlotRemoved,
} from '../../blocks-section-responsive-order/responsive-order';

// eslint-disable-next-line import/no-extraneous-dependencies -- provided by WordPress core at runtime, not an npm dependency
import { useMergeRefs } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';

// eslint-disable-next-line import/no-extraneous-dependencies -- provided by WordPress core at runtime, not an npm dependency
import { getBlockType } from '@wordpress/blocks';
import {
	InspectorControls,
	Inserter,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Button,
	Tooltip,
} from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

const DEVICES = [ 'desktop', 'tablet', 'mobile' ];
const RESPONSIVE_DEVICE_STORAGE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';

const MIN_COLUMN_WIDTH_PX = 8; // about one alphabet/1ch on most fonts
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 6;

const RESPONSIVE_DEFAULTS = {
	padding: 0,
	margin: 0,
	gap: 16,
	height: 0,
	backgroundColor: '',
	borderRadius: 0,
	shadow: 0,
};

const DEVICE_LABELS = {
	desktop: __( 'Desktop', 'uplifters-site-builder-blocks' ),
	tablet: __( 'Tablet', 'uplifters-site-builder-blocks' ),
	mobile: __( 'Mobile', 'uplifters-site-builder-blocks' ),
};

const COLUMN_OPTIONS = [
	{ label: __( '1 Column', 'uplifters-site-builder-blocks' ), value: 1 },
	{ label: __( '2 Columns', 'uplifters-site-builder-blocks' ), value: 2 },
	{ label: __( '3 Columns', 'uplifters-site-builder-blocks' ), value: 3 },
	{ label: __( '4 Columns', 'uplifters-site-builder-blocks' ), value: 4 },
	{ label: __( '5 Columns', 'uplifters-site-builder-blocks' ), value: 5 },
	{ label: __( '6 Columns', 'uplifters-site-builder-blocks' ), value: 6 },
];

const VERTICAL_ALIGNMENT_OPTIONS = [
	{ label: __( 'Top', 'uplifters-site-builder-blocks' ), value: 'start' },
	{ label: __( 'Middle', 'uplifters-site-builder-blocks' ), value: 'center' },
	{ label: __( 'Bottom', 'uplifters-site-builder-blocks' ), value: 'end' },
];

/**
 * The columns a Footer Layout starts with. A starting point, not a
 * restriction: any of them can be deleted and any other block can be added as
 * a column. The template is re-applied only when the layout is fully empty.
 */
const FOOTER_TEMPLATE = [
	[ 'uplifters-site-builder-blocks/site-logo', {} ],
	[ 'uplifters-site-builder-blocks/social-icon', {} ],
	[ 'uplifters-site-builder-blocks/page-grid', {} ],
	[ 'uplifters-site-builder-blocks/copyright-component-rearrange', {} ],
];

// ─── Responsive device ────────────────────────────────────────────────────────

const normalizeDevice = ( value ) => {
	if ( ! value ) {
		return null;
	}

	const normalizedValue = String( value ).toLowerCase();

	if ( DEVICES.includes( normalizedValue ) ) {
		return normalizedValue;
	}

	if ( normalizedValue.includes( 'tablet' ) ) {
		return 'tablet';
	}

	if (
		normalizedValue.includes( 'mobile' ) ||
		normalizedValue.includes( 'phone' )
	) {
		return 'mobile';
	}

	if ( normalizedValue.includes( 'desktop' ) ) {
		return 'desktop';
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

			const device = normalizeDevice(
				currentWindow.upliftersSiteBuilderBlocksResponsiveDevice ||
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

// ─── Responsive attribute helpers ────────────────────────────────────────────

const getResponsiveObject = ( value, fallback ) => {
	if ( value && typeof value === 'object' && ! Array.isArray( value ) ) {
		return DEVICES.reduce( ( result, device ) => {
			result[ device ] =
				value[ device ] !== undefined && value[ device ] !== null
					? value[ device ]
					: fallback;

			return result;
		}, {} );
	}

	return {
		desktop: value !== undefined && value !== null ? value : fallback,
		tablet: fallback,
		mobile: fallback,
	};
};

const getResponsiveValue = ( value, device, fallback ) => {
	const responsiveObject = getResponsiveObject( value, fallback );

	return responsiveObject[ device ] !== undefined &&
		responsiveObject[ device ] !== null
		? responsiveObject[ device ]
		: fallback;
};

// ─── Column width helpers ────────────────────────────────────────────────────

const getEqualWidths = ( count ) => {
	if ( ! count ) {
		return [];
	}

	return Array.from( { length: count }, () => 100 / count );
};

const normalizeWidths = ( widths, count ) => {
	if ( ! count ) {
		return [];
	}

	if ( ! Array.isArray( widths ) || widths.length !== count ) {
		return getEqualWidths( count );
	}

	const nums = widths.map( ( w ) => Number( w ) || 0 );
	const total = nums.reduce( ( sum, w ) => sum + w, 0 );

	if ( total <= 0 ) {
		return getEqualWidths( count );
	}

	return nums.map( ( w ) => ( w / total ) * 100 );
};

const getGridTemplateColumns = ( widths, count ) =>
	normalizeWidths( widths, count )
		.map( ( w ) => `minmax(1ch, ${ w }fr)` )
		.join( ' ' );

const getHandlePositions = ( widths ) => {
	let total = 0;

	return widths.slice( 0, -1 ).map( ( w ) => {
		total += w;
		return total;
	} );
};

/**
 * Normalise every device's widths array to exactly `count` entries.
 *
 * @param {Object|Array|undefined} raw   Raw columnWidths attribute value.
 * @param {number}                 count Number of columns.
 */
const resolveColumnWidths = ( raw, count ) => {
	if ( Array.isArray( raw ) ) {
		const norm = normalizeWidths( raw, count );

		return { desktop: norm, tablet: [ ...norm ], mobile: [ ...norm ] };
	}

	if ( raw && typeof raw === 'object' ) {
		return DEVICES.reduce( ( acc, key ) => {
			acc[ key ] = normalizeWidths(
				Array.isArray( raw[ key ] ) ? raw[ key ] : [],
				count
			);

			return acc;
		}, {} );
	}

	const eq = getEqualWidths( count );

	return { desktop: eq, tablet: [ ...eq ], mobile: [ ...eq ] };
};

/**
 * Append one column to every device. The existing columns keep their relative
 * proportions and give up an equal share to the new one.
 *
 * @param {Object} widthsObj Per-device widths, already normalised to `count`.
 * @param {number} count     Current number of columns.
 */
const withColumnAdded = ( widthsObj, count ) => {
	const share = 100 / ( count + 1 );

	return DEVICES.reduce( ( acc, key ) => {
		const scaled = normalizeWidths( widthsObj[ key ], count ).map(
			( w ) => w * ( 1 - share / 100 )
		);

		acc[ key ] = normalizeWidths( [ ...scaled, share ], count + 1 );

		return acc;
	}, {} );
};

/**
 * Drop one column from every device. The remaining columns keep their relative
 * proportions and share the freed space between them.
 *
 * @param {Object} widthsObj Per-device widths, already normalised to `count`.
 * @param {number} count     Current number of columns.
 * @param {number} index     Index of the column being removed.
 */
const withColumnRemoved = ( widthsObj, count, index ) =>
	DEVICES.reduce( ( acc, key ) => {
		const next = normalizeWidths( widthsObj[ key ], count ).filter(
			( ignored, i ) => i !== index
		);

		acc[ key ] = normalizeWidths( next, count - 1 );

		return acc;
	}, {} );

// ─── Edit Component ───────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		sections = 0,
		columnWidths = {},
		verticalAlignment = {},
		padding,
		margin,
		gap,
		height,
		backgroundColor,
		borderRadius,
		shadow,
		childOrder = { desktop: [], tablet: [], mobile: [] },
		mobileStack = false,
	} = attributes;

	const device = useGlobalResponsiveDevice();
	const deviceLabel = DEVICE_LABELS[ device ] || DEVICE_LABELS.desktop;

	const columnsRef = useRef( null );
	const resizeStateRef = useRef( null );
	const [ resizePreview, setResizePreview ] = useState( null );

	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleSettingsPanel = ( key ) => setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	// ── Columns ───────────────────────────────────────────────────────────────
	// Every inner block is one column. `sections` can run ahead of the inner
	// blocks: the surplus columns are the empty ones still waiting for content.

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const {
		removeBlock,
		moveBlocksToPosition,
		__unstableMarkNextChangeAsNotPersistent,
	} = useDispatch( 'core/block-editor' );

	const filledCount = innerBlocks.length;
	const columnCount = Math.max(
		Number( sections ) || 0,
		filledCount,
		MIN_COLUMNS
	);
	const emptyCount = columnCount - filledCount;

	const columnWidthsKey = JSON.stringify( columnWidths );

	const columnWidthsObj = useMemo(
		() => resolveColumnWidths( columnWidths, columnCount ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ columnWidthsKey, columnCount ]
	);

	const activeWidths = columnWidthsObj[ device ] ?? getEqualWidths( columnCount );

	const normalizedWidths = useMemo(
		() => normalizeWidths( activeWidths, columnCount ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( activeWidths ), columnCount ]
	);

	/*
	 * Column order for the active device. Every column is one slot, the filled
	 * ones first and the empty placeholders after them, so a track that has no
	 * block in it yet still holds a position.
	 */
	const orderObject = useMemo(
		() => resolveOrder( childOrder, columnCount ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( childOrder ), columnCount ]
	);

	const orderSequence = orderObject[ device ];

	const columnLabels = useMemo(
		() => innerBlocks.map( ( block ) => getBlockType( block.name )?.title || '' ),
		[ innerBlocks ]
	);

	/*
	 * Desktop is the document order itself, so a desktop reorder moves the real
	 * blocks and leaves childOrder.desktop natural. Only the narrower devices
	 * keep a saved order of their own.
	 */
	const setOrderForDevice = ( nextSequence ) => {
		if ( 'desktop' !== device ) {
			setAttributes( {
				childOrder: { ...orderObject, [ device ]: nextSequence },
			} );

			return;
		}

		const move = getDocumentMove(
			getNaturalOrder( nextSequence.length ),
			nextSequence
		);

		if ( ! move ) {
			return;
		}

		const movedBlock = innerBlocks[ move.from ];

		if ( movedBlock ) {
			moveBlocksToPosition(
				[ movedBlock.clientId ],
				clientId,
				clientId,
				move.to
			);
		}
	};

	/*
	 * A move in the canvas — Gutenberg's own arrows or drag-and-drop — arrives
	 * here as a changed block list, with nothing to say which device the person
	 * was looking at. On desktop the move is the point, so it stands and the
	 * other devices are renumbered to keep showing what they showed. On tablet
	 * and mobile the document order has to stay put, so the move is undone and
	 * recorded as that device's own order instead.
	 */
	const documentOrderRef = useRef( null );

	useEffect( () => {
		const currentIds = innerBlocks.map( ( block ) => block.clientId );
		const previousIds = documentOrderRef.current;

		documentOrderRef.current = currentIds;

		// First run, or a column was added or removed rather than moved.
		if ( ! previousIds || previousIds.length !== currentIds.length ) {
			return;
		}

		const move = getDocumentMove( previousIds, currentIds );

		if ( ! move ) {
			return;
		}

		if ( 'desktop' === device ) {
			setAttributes( {
				childOrder: {
					desktop: getNaturalOrder( currentIds.length ),
					tablet: remapSequence(
						orderObject.tablet,
						previousIds,
						currentIds
					),
					mobile: remapSequence(
						orderObject.mobile,
						previousIds,
						currentIds
					),
				},
			} );

			return;
		}

		const sequence = orderObject[ device ];
		const position = sequence.indexOf( move.from + 1 );

		if ( -1 === position ) {
			return;
		}

		// The arrows step through the document, so the same step is applied to
		// what this device shows rather than to the document position.
		const target = Math.max(
			0,
			Math.min(
				sequence.length - 1,
				position + ( move.to - move.from )
			)
		);

		documentOrderRef.current = previousIds;

		if ( typeof __unstableMarkNextChangeAsNotPersistent === 'function' ) {
			__unstableMarkNextChangeAsNotPersistent();
		}

		moveBlocksToPosition(
			[ move.clientId ],
			clientId,
			clientId,
			move.from
		);

		setAttributes( {
			childOrder: {
				...orderObject,
				[ device ]: withSlotMoved( sequence, position, target ),
			},
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ innerBlocks, device ] );

	// The frontend renders `sections` grid tracks, so keep the saved count in
	// step with what the editor is showing.
	useEffect( () => {
		if ( ( Number( sections ) || 0 ) !== columnCount ) {
			setAttributes( { sections: columnCount } );
		}
	}, [ sections, columnCount, setAttributes ] );

	// ── Active device values ──────────────────────────────────────────────────

	const activePadding = getResponsiveValue( padding, device, RESPONSIVE_DEFAULTS.padding );
	const activeMargin = getResponsiveValue( margin, device, RESPONSIVE_DEFAULTS.margin );
	const activeGap = getResponsiveValue( gap, device, RESPONSIVE_DEFAULTS.gap );
	const activeHeight = getResponsiveValue( height, device, RESPONSIVE_DEFAULTS.height );
	const activeBackgroundColor = getResponsiveValue( backgroundColor, device, RESPONSIVE_DEFAULTS.backgroundColor );
	const activeBorderRadius = getResponsiveValue( borderRadius, device, RESPONSIVE_DEFAULTS.borderRadius );
	const activeShadow = getResponsiveValue( shadow, device, RESPONSIVE_DEFAULTS.shadow );
	const activeVerticalAlignment = getResponsiveValue( verticalAlignment, device, 'center' );

	const setResponsiveAttribute = ( attributeName, value, fallback ) => {
		const resolvedFallback =
			fallback !== undefined ? fallback : RESPONSIVE_DEFAULTS[ attributeName ];

		setAttributes( {
			[ attributeName ]: {
				...getResponsiveObject(
					attributes[ attributeName ],
					resolvedFallback
				),
				[ device ]:
					value !== undefined && value !== null
						? value
						: resolvedFallback,
			},
		} );
	};

	const setColumnWidthsForDevice = ( nextWidths ) => {
		setAttributes( {
			columnWidths: { ...columnWidthsObj, [ device ]: nextWidths },
		} );
	};

	// ── Add / remove columns ──────────────────────────────────────────────────

	const addColumn = () => {
		if ( columnCount >= MAX_COLUMNS ) {
			return;
		}

		setAttributes( {
			sections: columnCount + 1,
			columnWidths: withColumnAdded( columnWidthsObj, columnCount ),
		} );
	};

	const deleteColumn = ( index ) => {
		if ( columnCount <= MIN_COLUMNS ) {
			return;
		}

		// A column that still holds a block has to lose the block too; an empty
		// one only exists as a grid track, so dropping the track is enough.
		const block = innerBlocks[ index ];

		if ( block ) {
			removeBlock( block.clientId, false );
		}

		setAttributes( {
			sections: columnCount - 1,
			columnWidths: withColumnRemoved( columnWidthsObj, columnCount, index ),
			childOrder: withSlotRemoved( orderObject, index + 1 ),
		} );
	};

	const setColumnCount = ( value ) => {
		const next = Math.min(
			MAX_COLUMNS,
			Math.max( MIN_COLUMNS, Number( value ) || MIN_COLUMNS )
		);

		if ( next === columnCount ) {
			return;
		}

		// Columns dropped off the end take their blocks with them.
		innerBlocks
			.slice( next )
			.forEach( ( block ) => removeBlock( block.clientId, false ) );

		const eq = getEqualWidths( next );
		const naturalOrder = getNaturalOrder( next );

		setAttributes( {
			sections: next,
			columnWidths: { desktop: eq, tablet: [ ...eq ], mobile: [ ...eq ] },
			childOrder: {
				desktop: naturalOrder,
				tablet: [ ...naturalOrder ],
				mobile: [ ...naturalOrder ],
			},
		} );
	};

	// ── Resize logic ──────────────────────────────────────────────────────────

	const stopResize = () => {
		resizeStateRef.current = null;
		setResizePreview( null );
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	};

	const resizeColumns = ( clientX ) => {
		const state = resizeStateRef.current;

		if ( ! state ) {
			return;
		}

		const {
			columnsRect,
			startX,
			startWidths,
			leftIndex,
			rightIndex,
			leftStart,
			rightStart,
		} = state;

		if ( columnsRect.width <= 0 ) {
			stopResize();
			return;
		}

		const minColumnPercent = Math.max(
			( MIN_COLUMN_WIDTH_PX / columnsRect.width ) * 100,
			0.1
		);
		const clampedX = Math.min(
			Math.max( clientX, columnsRect.left ),
			columnsRect.right
		);
		const combined = leftStart + rightStart;
		const deltaPercent = ( ( clampedX - startX ) / columnsRect.width ) * 100;

		if ( combined < minColumnPercent * 2 ) {
			return;
		}

		let nextLeft = leftStart + deltaPercent;
		let nextRight = rightStart - deltaPercent;

		if ( nextLeft < minColumnPercent ) {
			nextLeft = minColumnPercent;
			nextRight = combined - minColumnPercent;
		}

		if ( nextRight < minColumnPercent ) {
			nextRight = minColumnPercent;
			nextLeft = combined - minColumnPercent;
		}

		if ( nextLeft < minColumnPercent || nextRight < minColumnPercent ) {
			return;
		}

		const next = [ ...startWidths ];

		next[ leftIndex ] = nextLeft;
		next[ rightIndex ] = nextRight;

		const nextNormalized = normalizeWidths( next, columnCount );

		setResizePreview( { handleIndex: leftIndex, widths: nextNormalized } );
		setColumnWidthsForDevice( nextNormalized );
	};

	const startResize = ( event, handleIndex ) => {
		if ( event.button !== 0 ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const columnsEl = columnsRef.current;

		if ( ! columnsEl ) {
			return;
		}

		const startWidths = [ ...normalizedWidths ];
		const leftStart = startWidths[ handleIndex ];
		const rightStart = startWidths[ handleIndex + 1 ];

		if (
			typeof leftStart === 'undefined' ||
			typeof rightStart === 'undefined'
		) {
			return;
		}

		resizeStateRef.current = {
			columnsRect: columnsEl.getBoundingClientRect(),
			startX: event.clientX,
			startWidths,
			leftIndex: handleIndex,
			rightIndex: handleIndex + 1,
			leftStart,
			rightStart,
		};

		setResizePreview( { handleIndex, widths: startWidths } );

		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';

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
			} catch {}
		}

		stopResize();
	};

	// ── Block props ───────────────────────────────────────────────────────────

	// One column per row on mobile, so narrow screens are not asked to fit
	// four footer columns side by side.
	const isMobileStacked = mobileStack && device === 'mobile';

	const wrapperWidth =
		activeMargin > 0 ? `calc(100% - ${ activeMargin * 2 }px)` : '100%';

	// Previews the active device's column order in the canvas.
	const orderRef = useChildOrder( orderSequence );
	const wrapperRef = useMergeRefs( [ columnsRef, orderRef ] );

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: [
			'uplifters-site-builder-blocks-footer-layout',
			'uplifters-site-builder-blocks-footer-layout-editor',
			`is-uplifters-site-builder-blocks-device-${ device }`,
		].join( ' ' ),
		'data-uplifters-site-builder-blocks-device': device,
		style: {
			width: wrapperWidth,
			maxWidth: wrapperWidth,

			gridTemplateColumns: isMobileStacked
				? 'minmax(0, 1fr)'
				: getGridTemplateColumns( normalizedWidths, columnCount ),
			alignItems: activeVerticalAlignment,
			gap: `${ activeGap }px`,
			minHeight: activeHeight > 0 ? `${ activeHeight }px` : undefined,

			padding: `${ activePadding }px`,
			margin: `${ activeMargin }px`,
			backgroundColor: activeBackgroundColor || undefined,
			borderRadius: `${ activeBorderRadius }px`,
			boxShadow: activeShadow
				? `0 ${ activeShadow }px ${ activeShadow * 3 }px rgba(0,0,0,0.18)`
				: 'none',

			position: 'relative',

			'--wp--style--block-gap': `${ activeGap }px`,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: FOOTER_TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: false,
	} );

	const { children: innerBlocksChildren, ...innerBlocksWrapperProps } =
		innerBlocksProps;

	// ── Column overlay geometry ───────────────────────────────────────────────

	const previewWidths = resizePreview?.widths || normalizedWidths;
	const handlePositions = getHandlePositions( previewWidths );

	const formatPercent = ( value ) =>
		( Number( value ) || 0 ).toFixed( 1 ).replace( /\.0$/, '' );

	// Cumulative start offset (in %) for each column, used to centre its badge.
	const columnStarts = previewWidths.reduce( ( acc, w, i ) => {
		acc.push( i === 0 ? 0 : acc[ i - 1 ] + previewWidths[ i - 1 ] );
		return acc;
	}, [] );

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={ __( 'Structure', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'structure' }
					onToggle={ () => toggleSettingsPanel( 'structure' ) }
				>
					<SelectControl
						label={ __( 'Columns', 'uplifters-site-builder-blocks' ) }
						value={ columnCount }
						options={ COLUMN_OPTIONS }
						onChange={ setColumnCount }
						help={ __(
							'Changing columns will reset column widths and order.',
							'uplifters-site-builder-blocks'
						) }
					/>

					<ResponsiveOrderControl
						sequence={ orderSequence }
						labels={ columnLabels }
						deviceLabel={ deviceLabel }
						onChange={ setOrderForDevice }
						help={ __(
							'Moving a column in the canvas does the same thing. With Tablet or Mobile active the move applies to that device only; on Desktop it moves the column for every device.',
							'uplifters-site-builder-blocks'
						) }
					/>

					<SelectControl
						label={ __( 'Vertical Alignment', 'uplifters-site-builder-blocks' ) }
						value={ activeVerticalAlignment }
						options={ VERTICAL_ALIGNMENT_OPTIONS }
						onChange={ ( value ) =>
							setResponsiveAttribute(
								'verticalAlignment',
								value,
								'center'
							)
						}
						help={ sprintf(
							/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
							__( 'Applies to %s.', 'uplifters-site-builder-blocks' ),
							deviceLabel
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Behavior', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'behavior' }
					onToggle={ () => toggleSettingsPanel( 'behavior' ) }
				>
					<ToggleControl
						label={ __( 'Stack on Mobile', 'uplifters-site-builder-blocks' ) }
						checked={ !! mobileStack }
						onChange={ ( value ) =>
							setAttributes( { mobileStack: value } )
						}
						help={ __(
							'Put every column on its own row below 767px.',
							'uplifters-site-builder-blocks'
						) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Spacing', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<div className="uplifters-site-builder-blocks-responsive-device-badge">
						{ deviceLabel }
					</div>

					<RangeControl
						label={ __( 'Padding', 'uplifters-site-builder-blocks' ) }
						value={ activePadding }
						onChange={ ( value ) => setResponsiveAttribute( 'padding', value || 0 ) }
						min={ 0 }
						max={ 200 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Border Radius', 'uplifters-site-builder-blocks' ) }
						value={ activeBorderRadius }
						onChange={ ( value ) => setResponsiveAttribute( 'borderRadius', value || 0 ) }
						min={ 0 }
						max={ 100 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Layout Spacing', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'layoutSpacing' }
					onToggle={ () => toggleStylesPanel( 'layoutSpacing' ) }
				>
					<div className="uplifters-site-builder-blocks-responsive-device-badge">
						{ deviceLabel }
					</div>

					<RangeControl
						label={ __( 'Margin', 'uplifters-site-builder-blocks' ) }
						value={ activeMargin }
						onChange={ ( value ) => setResponsiveAttribute( 'margin', value || 0 ) }
						min={ 0 }
						max={ 200 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Column Gap', 'uplifters-site-builder-blocks' ) }
						value={ activeGap }
						onChange={ ( value ) => setResponsiveAttribute( 'gap', value || 0 ) }
						min={ 0 }
						max={ 100 }
						step={ 1 }
						help={ __(
							'Space between each column in this footer.',
							'uplifters-site-builder-blocks'
						) }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Minimum Height', 'uplifters-site-builder-blocks' ) }
						value={ activeHeight }
						onChange={ ( value ) => setResponsiveAttribute( 'height', value || 0 ) }
						min={ 0 }
						max={ 400 }
						step={ 1 }
						help={ __(
							'0 lets the footer take the height of its content.',
							'uplifters-site-builder-blocks'
						) }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Background Shadow', 'uplifters-site-builder-blocks' ) }
						value={ activeShadow }
						onChange={ ( value ) => setResponsiveAttribute( 'shadow', value || 0 ) }
						min={ 0 }
						max={ 60 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Colors', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'colors' }
					onToggle={ () => toggleStylesPanel( 'colors' ) }
				>
					<div className="uplifters-site-builder-blocks-responsive-device-badge">
						{ deviceLabel }
					</div>

					<p>{ __( 'Background Color', 'uplifters-site-builder-blocks' ) }</p>

					<ColorPalette
						value={ activeBackgroundColor }
						onChange={ ( value ) =>
							setResponsiveAttribute( 'backgroundColor', value || '' )
						}
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksWrapperProps }>
				{ innerBlocksChildren }

				{ /* Columns with no block in them yet: a dashed cell whose plus
				     opens the inserter for that column. */ }
				{ Array.from( { length: emptyCount } ).map( ( ignored, index ) => (
					<div
						key={ `empty-column-${ index }` }
						className="uplifters-site-builder-blocks-footer-layout__empty-column"
						style={ {
							order: getSlotOrder(
								orderSequence,
								filledCount + index + 1
							),
						} }
					>
						<Inserter
							rootClientId={ clientId }
							isAppender
							renderToggle={ ( { onToggle, disabled } ) => (
								<Button
									className="uplifters-site-builder-blocks-footer-layout__empty-column-add"
									icon={ plus }
									label={ __(
										'Add block',
										'uplifters-site-builder-blocks'
									) }
									onClick={ onToggle }
									disabled={ disabled }
								/>
							) }
						/>
					</div>
				) ) }

				{ /* Stacked on mobile there is only one track, so the width
				     badges and drag handles have nothing to describe. */ }
				{ ! isMobileStacked && previewWidths.map( ( width, index ) => (
					<div
						key={ `column-controls-${ index }` }
						className="uplifters-site-builder-blocks-footer-layout__column-controls"
						style={ { left: `${ columnStarts[ index ] + width / 2 }%` } }
					>
						<span className="uplifters-site-builder-blocks-footer-layout__percent-badge">
							{ `${ formatPercent( width ) }%` }
						</span>

						<Tooltip
							text={ __(
								'Delete column',
								'uplifters-site-builder-blocks'
							) }
						>
							<Button
								className="uplifters-site-builder-blocks-footer-layout__column-delete"
								icon={ trash }
								label={ __(
									'Delete column',
									'uplifters-site-builder-blocks'
								) }
								disabled={ columnCount <= MIN_COLUMNS }
								onClick={ () => deleteColumn( index ) }
							/>
						</Tooltip>
					</div>
				) ) }

				<div className="uplifters-site-builder-blocks-footer-layout__add-column">
					<Tooltip
						text={ __( 'Add column', 'uplifters-site-builder-blocks' ) }
					>
						<Button
							className="uplifters-site-builder-blocks-footer-layout__add-column-button"
							icon={ plus }
							label={ __(
								'Add column',
								'uplifters-site-builder-blocks'
							) }
							disabled={ columnCount >= MAX_COLUMNS }
							onClick={ addColumn }
						/>
					</Tooltip>
				</div>

				{ ! isMobileStacked && handlePositions.map( ( position, index ) => (
					<button
						key={ index }
						type="button"
						className="uplifters-site-builder-blocks-footer-layout__resize-handle"
						aria-label={ __(
							'Resize footer columns',
							'uplifters-site-builder-blocks'
						) }
						onPointerDown={ ( event ) => startResize( event, index ) }
						onPointerMove={ handleResizeMove }
						onPointerUp={ handleResizeEnd }
						onPointerCancel={ handleResizeEnd }
						style={ { left: `${ position }%` } }
					/>
				) ) }
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="footer-layout" /> : <Editor { ...props } />;
}


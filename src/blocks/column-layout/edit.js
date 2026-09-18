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
import { __ } from '@wordpress/i18n';

// eslint-disable-next-line import/no-extraneous-dependencies -- provided by WordPress core at runtime, not an npm dependency
import { getBlockType } from '@wordpress/blocks';

import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	Inserter,
} from '@wordpress/block-editor';

import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	Tooltip,
} from '@wordpress/components';

import { plus, trash } from '@wordpress/icons';

import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

// eslint-disable-next-line import/no-extraneous-dependencies -- provided by WordPress core at runtime, not an npm dependency
import { useSelect, useDispatch } from '@wordpress/data';

const MIN_COLUMN_WIDTH_PX = 8; // about one alphabet/1ch on most fonts
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 6;
const DEVICES = [ 'desktop', 'tablet', 'mobile' ];

const COLUMN_OPTIONS = [
	{ label: __( '1 Column', 'uplifters-site-builder-blocks' ), value: 1 },
	{ label: __( '2 Columns', 'uplifters-site-builder-blocks' ), value: 2 },
	{ label: __( '3 Columns', 'uplifters-site-builder-blocks' ), value: 3 },
	{ label: __( '4 Columns', 'uplifters-site-builder-blocks' ), value: 4 },
	{ label: __( '5 Columns', 'uplifters-site-builder-blocks' ), value: 5 },
	{ label: __( '6 Columns', 'uplifters-site-builder-blocks' ), value: 6 },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const getEqualWidths = ( count ) => {
	if ( ! count ) {
		return [];
	}
	const w = 100 / count;
	return Array.from( { length: count }, () => w );
};

const normalizeWidths = ( widths, count ) => {
	if ( ! count ) {
		return [];
	}
	if ( ! Array.isArray( widths ) || widths.length !== count ) {
		return getEqualWidths( count );
	}
	const nums = widths.map( ( w ) => Number( w ) || 0 );
	const total = nums.reduce( ( s, w ) => s + w, 0 );
	if ( total <= 0 ) {
		return getEqualWidths( count );
	}
	return nums.map( ( w ) => ( w / total ) * 100 );
};

const getGridTemplateColumns = ( widths, count ) => {
	const norm = normalizeWidths( widths, count );
	if ( ! norm.length ) {
		return `repeat( ${ count || 1 }, minmax(1ch, 1fr) )`;
	}
	return norm.map( ( w ) => `minmax(1ch, ${ w }fr)` ).join( ' ' );
};

const getHandlePositions = ( widths ) => {
	let total = 0;
	return widths.slice( 0, -1 ).map( ( w ) => {
		total += w;
		return total;
	} );
};

/**
 * Given the raw columnWidths attribute (object, flat array, or undefined),
 * return a stable { desktop, tablet, mobile } object where every device's
 * widths array is normalised to exactly `count` entries summing to 100.
 * @param {Object|Array|undefined} raw   Raw columnWidths attribute value.
 * @param {number}                 count Number of columns.
 */
const resolveColumnWidths = ( raw, count ) => {
	// New object shape: { desktop:[], tablet:[], mobile:[] }
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		const desktop = normalizeWidths(
			Array.isArray( raw.desktop ) ? raw.desktop : [],
			count
		);
		const tablet = normalizeWidths(
			Array.isArray( raw.tablet ) ? raw.tablet : [],
			count
		);
		const mobile = normalizeWidths(
			Array.isArray( raw.mobile ) ? raw.mobile : [],
			count
		);
		return { desktop, tablet, mobile };
	}
	// Legacy flat array: apply to all devices
	if ( Array.isArray( raw ) ) {
		const norm = normalizeWidths( raw, count );
		return { desktop: norm, tablet: [ ...norm ], mobile: [ ...norm ] };
	}
	// Fallback
	const eq = getEqualWidths( count );
	return { desktop: eq, tablet: [ ...eq ], mobile: [ ...eq ] };
};

/**
 * Append one column to every device's widths array. The existing columns keep
 * their relative proportions and give up an equal share to the new one.
 * @param {Object} widthsObj Per-device widths, already normalised to `count`.
 * @param {number} count     Current number of columns.
 */
const withColumnAdded = ( widthsObj, count ) => {
	const share = 100 / ( count + 1 );

	return DEVICES.reduce( ( acc, key ) => {
		const current = normalizeWidths( widthsObj[ key ], count );
		const scaled = current.map( ( w ) => w * ( 1 - share / 100 ) );

		acc[ key ] = normalizeWidths( [ ...scaled, share ], count + 1 );
		return acc;
	}, {} );
};

/**
 * Drop one column from every device's widths array. The remaining columns keep
 * their relative proportions and share the freed space between them.
 * @param {Object} widthsObj Per-device widths, already normalised to `count`.
 * @param {number} count     Current number of columns.
 * @param {number} index     Index of the column being removed.
 */
const withColumnRemoved = ( widthsObj, count, index ) => {
	return DEVICES.reduce( ( acc, key ) => {
		const current = normalizeWidths( widthsObj[ key ], count );
		const next = current.filter( ( ignored, i ) => i !== index );

		acc[ key ] = normalizeWidths( next, count - 1 );
		return acc;
	}, {} );
};

/**
 * Given the raw gap attribute (number or { desktop, tablet, mobile }),
 * return a stable { desktop, tablet, mobile } object of numbers.
 * @param {number|Object} raw Raw gap attribute value.
 */
const resolveGap = ( raw ) => {
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		return {
			desktop: Number( raw.desktop ) || 0,
			tablet: Number( raw.tablet ) || 0,
			mobile: Number( raw.mobile ) || 0,
		};
	}
	const n = Number( raw ) || 0;
	return { desktop: n, tablet: n, mobile: n };
};

/**
 * Given the raw padding/margin attribute (number or { desktop, tablet, mobile }),
 * return a stable { desktop, tablet, mobile } object of numbers.
 * @param {number|Object} raw Raw padding/margin attribute value.
 */
const resolveSpacing = ( raw ) => {
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		return {
			desktop: Number( raw.desktop ) || 0,
			tablet: Number( raw.tablet ) || 0,
			mobile: Number( raw.mobile ) || 0,
		};
	}
	const n = Number( raw ) || 0;
	return { desktop: n, tablet: n, mobile: n };
};

/**
 * Given the raw backgroundColor attribute ({ desktop, tablet, mobile }),
 * return a stable { desktop, tablet, mobile } object of color strings.
 * @param {Object|undefined} raw Raw backgroundColor attribute value.
 */
const resolveBackgroundColor = ( raw ) => {
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		return {
			desktop: raw.desktop || '',
			tablet: raw.tablet || '',
			mobile: raw.mobile || '',
		};
	}
	return { desktop: '', tablet: '', mobile: '' };
};

// ─── Global Responsive Device Hook ───────────────────────────────────────────

function useGlobalResponsiveDevice() {
	const STORE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';
	const EVENT_KEY = 'uplifters-site-builder-blocks-responsive-device-change';

	const getLocalDevice = () =>
		window.localStorage.getItem( STORE_KEY ) || null;

	const gutenbergDevice = useSelect( ( select ) => {
		const editorStore = select( 'core/editor' );
		if ( editorStore?.getDeviceType ) {
			return editorStore.getDeviceType().toLowerCase();
		}
		return null;
	}, [] );

	const [ device, setDevice ] = useState(
		() => getLocalDevice() || gutenbergDevice || 'desktop'
	);

	useEffect( () => {
		const onDeviceChange = ( e ) => {
			const next = e?.detail?.device || getLocalDevice() || 'desktop';
			setDevice( next );
		};
		window.addEventListener( EVENT_KEY, onDeviceChange );
		const local = getLocalDevice();
		if ( local ) {
			setDevice( local );
		}
		return () => window.removeEventListener( EVENT_KEY, onDeviceChange );
	}, [] );

	useEffect( () => {
		if ( ! getLocalDevice() && gutenbergDevice ) {
			setDevice( gutenbergDevice );
		}
	}, [ gutenbergDevice ] );

	return device;
}

// ─── Edit Component ───────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		sections = 0,
		gap = { desktop: 0, tablet: 0, mobile: 0 },
		columnWidths = { desktop: [], tablet: [], mobile: [] },
		padding = { desktop: 0, tablet: 0, mobile: 0 },
		margin = { desktop: 0, tablet: 0, mobile: 0 },
		backgroundColor = { desktop: '', tablet: '', mobile: '' },
		childOrder = { desktop: [], tablet: [], mobile: [] },
	} = attributes;

	const device = useGlobalResponsiveDevice();

	const columnsRef = useRef( null );
	const resizeStateRef = useRef( null );
	const [ resizePreview, setResizePreview ] = useState( null );

	// ── Inspector accordion state (Settings tab exclusive / Styles tab exclusive) ──
	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleSettingsPanel = ( key ) =>
		setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );
	const toggleStylesPanel = ( key ) =>
		setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

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

	// ── Resolve attributes into stable per-device objects ────────────────────
	// JSON-serialise as memo key so object identity changes only when
	// the underlying data actually changes — avoids stale closure / inf-loop.

	const gapKey = JSON.stringify( gap );
	const columnWidthsKey = JSON.stringify( columnWidths );
	const paddingKey = JSON.stringify( padding );
	const marginKey = JSON.stringify( margin );
	const backgroundColorKey = JSON.stringify( backgroundColor );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const gapObj = useMemo( () => resolveGap( gap ), [ gapKey ] );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const paddingObj = useMemo( () => resolveSpacing( padding ), [ paddingKey ] );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const marginObj = useMemo( () => resolveSpacing( margin ), [ marginKey ] );

	const backgroundColorObj = useMemo(
		() => resolveBackgroundColor( backgroundColor ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ backgroundColorKey ]
	);

	const columnWidthsObj = useMemo(
		() => resolveColumnWidths( columnWidths, columnCount ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ columnWidthsKey, columnCount ]
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

	// Active-device slices (primitive / stable references)
	const currentGap = gapObj[ device ] ?? 0;
	const currentPadding = paddingObj[ device ] ?? 0;
	const currentMargin = marginObj[ device ] ?? 0;
	const currentBackgroundColor = backgroundColorObj[ device ] ?? '';
	const activeWidths =
		columnWidthsObj[ device ] ?? getEqualWidths( columnCount );
	const normalizedWidths = useMemo(
		() => normalizeWidths( activeWidths, columnCount ),
		// activeWidths is already normalised by resolveColumnWidths, but
		// stringify keeps the memo key stable.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( activeWidths ), columnCount ]
	);

	// The frontend renders `sections` grid tracks, so keep the saved count in
	// step with what the editor is showing.
	useEffect( () => {
		if ( ( Number( sections ) || 0 ) !== columnCount ) {
			setAttributes( { sections: columnCount } );
		}
	}, [ sections, columnCount, setAttributes ] );

	// ── Setters ───────────────────────────────────────────────────────────────

	const setGapForDevice = ( value ) => {
		setAttributes( {
			gap: { ...gapObj, [ device ]: Number( value ) || 0 },
		} );
	};

	const setPaddingForDevice = ( value ) => {
		setAttributes( {
			padding: { ...paddingObj, [ device ]: Number( value ) || 0 },
		} );
	};

	const setMarginForDevice = ( value ) => {
		setAttributes( {
			margin: { ...marginObj, [ device ]: Number( value ) || 0 },
		} );
	};

	const setBackgroundColorForDevice = ( value ) => {
		setAttributes( {
			backgroundColor: { ...backgroundColorObj, [ device ]: value || '' },
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
			columnWidths: withColumnRemoved(
				columnWidthsObj,
				columnCount,
				index
			),
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
		const deltaPercent =
			( ( clampedX - startX ) / columnsRect.width ) * 100;

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

		setResizePreview( {
			handleIndex: leftIndex,
			widths: nextNormalized,
		} );

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

		const columnsRect = columnsEl.getBoundingClientRect();

		resizeStateRef.current = {
			columnsRect,
			startX: event.clientX,
			startWidths,
			leftIndex: handleIndex,
			rightIndex: handleIndex + 1,
			leftStart,
			rightStart,
		};

		setResizePreview( {
			handleIndex,
			widths: startWidths,
		} );

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

	const deviceLabel = device.charAt( 0 ).toUpperCase() + device.slice( 1 );

	// Previews the active device's column order in the canvas.
	const orderRef = useChildOrder( orderSequence );
	const wrapperRef = useMergeRefs( [ columnsRef, orderRef ] );

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: 'column-layout column-layout--editor',
		style: {
			gridTemplateColumns: getGridTemplateColumns(
				normalizedWidths,
				columnCount
			),
			gap: `${ currentGap }px`,
			padding: `${ currentPadding }px`,
			margin: `${ currentMargin }px`,
			backgroundColor: currentBackgroundColor || undefined,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: false,
	} );

	const { children: innerBlocksChildren, ...innerBlocksWrapperProps } =
		innerBlocksProps;

	// ── Column overlay geometry ───────────────────────────────────────────────

	const previewWidths = resizePreview?.widths || normalizedWidths;
	const handlePositions = getHandlePositions( previewWidths );
	const formatPercent = ( value ) => {
		const n = Number( value ) || 0;
		return n.toFixed( 1 ).replace( /\.0$/, '' );
	};

	// Cumulative start offset (in %) for each column, used to center its badge.
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
						options={ COLUMN_OPTIONS.map( ( o ) => ( {
							label: o.label,
							value: o.value,
						} ) ) }
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
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ `${ deviceLabel } ${ __(
						'Spacing',
						'uplifters-site-builder-blocks'
					) }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<RangeControl
						label={ __( 'Padding', 'uplifters-site-builder-blocks' ) }
						value={ currentPadding }
						onChange={ setPaddingForDevice }
						min={ 0 }
						max={ 200 }
						help={ __(
							'Padding for current device.',
							'uplifters-site-builder-blocks'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ `${ deviceLabel } ${ __(
						'Layout Spacing',
						'uplifters-site-builder-blocks'
					) }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'layoutSpacing' }
					onToggle={ () => toggleStylesPanel( 'layoutSpacing' ) }
				>
					<RangeControl
						label={ __( 'Gap', 'uplifters-site-builder-blocks' ) }
						value={ currentGap }
						onChange={ setGapForDevice }
						min={ 0 }
						max={ 100 }
						help={ __(
							'Gap between columns for current device.',
							'uplifters-site-builder-blocks'
						) }
					/>

					<RangeControl
						label={ __( 'Margin', 'uplifters-site-builder-blocks' ) }
						value={ currentMargin }
						onChange={ setMarginForDevice }
						min={ 0 }
						max={ 200 }
						help={ __(
							'Margin for current device.',
							'uplifters-site-builder-blocks'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ `${ deviceLabel } ${ __(
						'Colors',
						'uplifters-site-builder-blocks'
					) }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'colors' }
					onToggle={ () => toggleStylesPanel( 'colors' ) }
				>
					<p>{ __( 'Background Color', 'uplifters-site-builder-blocks' ) }</p>

					<ColorPalette
						value={ currentBackgroundColor }
						onChange={ setBackgroundColorForDevice }
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksWrapperProps }>
				{ innerBlocksChildren }

				{ /* Columns with no block in them yet: a dashed cell whose plus
				     opens the inserter for that column. */ }
				{ Array.from( { length: emptyCount } ).map(
					( ignored, index ) => (
						<div
							key={ `empty-column-${ index }` }
							className="column-layout__empty-column"
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
										className="column-layout__empty-column-add"
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
					)
				) }

				{ previewWidths.map( ( width, index ) => (
					<div
						key={ `column-controls-${ index }` }
						className="column-layout__column-controls"
						style={ {
							left: `${ columnStarts[ index ] + width / 2 }%`,
						} }
					>
						<span className="column-layout__percent-badge">
							{ `${ formatPercent( width ) }%` }
						</span>

						<Tooltip
							text={ __(
								'Delete column',
								'uplifters-site-builder-blocks'
							) }
						>
							<Button
								className="column-layout__column-delete"
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

				<div className="column-layout__add-column">
					<Tooltip
						text={ __(
							'Add column',
							'uplifters-site-builder-blocks'
						) }
					>
						<Button
							className="column-layout__add-column-button"
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

				{ handlePositions.map( ( position, index ) => (
					<button
						key={ index }
						type="button"
						className="column-layout__resize-handle"
						aria-label={ __(
							'Resize columns',
							'uplifters-site-builder-blocks'
						) }
						onPointerDown={ ( e ) => startResize( e, index ) }
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
	return props.attributes.preview ? (
		<InserterPreview type="column-layout" />
	) : (
		<Editor { ...props } />
	);
}

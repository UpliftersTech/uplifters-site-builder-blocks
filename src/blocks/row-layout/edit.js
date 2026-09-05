import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
} from '@wordpress/components';

import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';

import {
	useSelect,
	useDispatch,
} from '@wordpress/data';

import { createBlock } from '@wordpress/blocks';

// ── useGlobalResponsiveDevice ─────────────────────────────────────────────────

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
		if ( local ) setDevice( local );
		return () => window.removeEventListener( EVENT_KEY, onDeviceChange );
	}, [] );

	useEffect( () => {
		if ( ! getLocalDevice() && gutenbergDevice ) {
			setDevice( gutenbergDevice );
		}
	}, [ gutenbergDevice ] );

	return device;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHILD_BLOCK_NAME  = 'uplifters-site-builder-blocks/row-section';
const MIN_STACK_SIZE    = 8;

// Clamp for the top/bottom edge-space handles (matches row-section's own
// padding RangeControl range, so dragging and typing land on the same scale).
const MIN_EDGE_SPACE = 0;
const MAX_EDGE_SPACE = 200;

// Decorative inset around the dashed-border layout box in the editor only.
// Kept separate from topSpace/bottomSpace so a fresh 0px space still shows
// the same breathing room the box always had.
const EDITOR_LAYOUT_INSET_PX = 4;

// Editor-only floor for a single row. Kept at 40px: tall enough that the
// 24px resize handle still has room to sit on a boundary without two
// adjacent handles overlapping, short enough that a freshly dropped
// 6-stack layout does not swallow the whole canvas.
// NOTE: this value never reaches the frontend — render.php builds its own
// tracks from the stored percentages with minmax(auto, Xfr).
const EDITOR_MIN_ROW_PX = 40;

const STACK_OPTIONS = [
	{ label: __( '1 Stack',  'uplifters-site-builder-blocks' ), value: 1 },
	{ label: __( '2 Stacks', 'uplifters-site-builder-blocks' ), value: 2 },
	{ label: __( '3 Stacks', 'uplifters-site-builder-blocks' ), value: 3 },
	{ label: __( '4 Stacks', 'uplifters-site-builder-blocks' ), value: 4 },
	{ label: __( '5 Stacks', 'uplifters-site-builder-blocks' ), value: 5 },
	{ label: __( '6 Stacks', 'uplifters-site-builder-blocks' ), value: 6 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getEqualSizes = ( count ) => {
	if ( ! count ) return [];
	const size = 100 / count;
	return Array.from( { length: count }, () => size );
};

const normalizeSizes = ( sizes, count ) => {
	if ( ! count ) return [];

	if ( ! Array.isArray( sizes ) || sizes.length !== count ) {
		return getEqualSizes( count );
	}

	const numericSizes = sizes.map( ( s ) => Number( s ) || 0 );
	const total = numericSizes.reduce( ( sum, s ) => sum + s, 0 );

	if ( total <= 0 ) return getEqualSizes( count );

	return numericSizes.map( ( s ) => ( s / total ) * 100 );
};

// Turn a `sizes` array (percentages, sum ≈ 100) into real pixel heights.
//
// Deliberately NOT expressed as CSS `fr` units: this grid container is
// intrinsically sized (only `minHeight`/measured `height`, never a fixed
// block size handed down from a parent), and per the CSS Grid spec, `fr`
// tracks in an indefinitely-sized axis are resolved using a *shared* ratio
// computed across every track in the grid (roughly: the tightest
// base-size-to-flex-factor ratio wins and becomes "1fr" for the whole
// grid). That means nudging just the two rows adjacent to a dragged handle
// can change which row is "tightest" and rescale every other row's pixel
// height too, even though its own entry in `sizes` never changed — this is
// the resizer bug: a shared grid value silently redistributing space
// across unrelated siblings. Precomputing plain pixel tracks ourselves
// removes that shared/pooled computation entirely, so every row's height
// depends only on its own `sizes` entry and the (stable, measured) total.
//
// The fallback here is deliberately just `floorTotal + gapsTotal` (not a
// multiple of it): before the first drag there is no measured height, and
// padding the budget out made every row open at twice its floor, which is
// what made a freshly inserted block eat so much canvas.
// `paddingPx` is the total vertical padding (editor inset + topSpace +
// bottomSpace) already claimed by the box — it never contributes to row
// space, so it comes out of the measured total before rows get their share.
const getRowPixelHeights = ( sizes, count, totalHeightPx, gapPx = 0, paddingPx = 0 ) => {
	const list       = sizes.length ? sizes : getEqualSizes( count || 1 );
	const rowCount   = count || list.length || 1;
	const floorTotal = rowCount * EDITOR_MIN_ROW_PX;
	const gapsTotal  = Math.max( 0, rowCount - 1 ) * ( Number( gapPx ) || 0 );
	const fallback   = floorTotal + gapsTotal;
	const measured   = totalHeightPx ? Math.max( 0, totalHeightPx - paddingPx ) : null;
	const available  = Math.max( floorTotal, ( measured ?? fallback ) - gapsTotal );
	const extra      = available - floorTotal;

	return list.map( ( s ) => EDITOR_MIN_ROW_PX + ( s / 100 ) * extra );
};

// Editor grid rows.
//
// Tracks are minmax(<dragged px>, auto): the drag-resized height is the
// row's MINIMUM, never its maximum. A fixed px maximum was what let a tall
// image spill out of its stack and paint over the stack below it — with an
// `auto` maximum the row simply grows to fit its content instead.
const getEditorGridTemplateRows = ( sizes, count, totalHeightPx, gapPx = 0, paddingPx = 0 ) => {
	const normalized = normalizeSizes( sizes, count );

	if ( ! normalized.length ) {
		return `repeat(${ count || 1 }, minmax(${ EDITOR_MIN_ROW_PX }px, auto))`;
	}

	return getRowPixelHeights( normalized, count, totalHeightPx, gapPx, paddingPx )
		.map( ( px ) => `minmax(${ px.toFixed( 2 ) }px, auto)` )
		.join( ' ' );
};

// Measure real DOM rows so handles land exactly on boundaries.
const getHandlePositions = ( layoutEl, count ) => {
	if ( ! layoutEl || count < 2 ) return [];

	const rows = Array.from(
		layoutEl.querySelectorAll(
			':scope > .uplifters-site-builder-blocks-q-row-section, :scope > [data-block]'
		)
	).slice( 0, count );

	if ( rows.length < 2 ) {
		return normalizeSizes( [], count )
			.slice( 0, -1 )
			.reduce( ( acc, size ) => {
				const prev = acc.length ? acc[ acc.length - 1 ] : 0;
				return [ ...acc, prev + size ];
			}, [] );
	}

	const layoutRect = layoutEl.getBoundingClientRect();
	if ( layoutRect.height <= 0 ) return [];

	let accumulated = 0;
	return rows.slice( 0, -1 ).map( ( row ) => {
		const rowRect = row.getBoundingClientRect();
		accumulated += rowRect.height;
		return ( accumulated / layoutRect.height ) * 100;
	} );
};

// ── Edit ──────────────────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes, clientId } ) {
	const { sections = 0, columnWidths = {}, gap = {}, topSpace = {}, bottomSpace = {} } = attributes;

	const device            = useGlobalResponsiveDevice();
	const stackCount        = Number( sections ) || 0;
	const hasSelectedLayout = stackCount > 0;

	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );

	const toggleSettingsPanel = ( key ) =>
		setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );

	const toggleStylesPanel = ( key ) =>
		setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	// ── Active device values ───────────────────────────────────────────────────

	// columnWidths is now an object { desktop:[], tablet:[], mobile:[] }.
	// Active device's array is used for the editor grid + resize handle.
	const activeWidths = useMemo( () => {
		const raw = Array.isArray( columnWidths?.[ device ] )
			? columnWidths[ device ]
			: [];
		return normalizeSizes( raw, stackCount );
	}, [ columnWidths, device, stackCount ] );

	const activeGap         = Number( gap?.[ device ] )         || 0;
	const activeTopSpace    = Number( topSpace?.[ device ] )    || 0;
	const activeBottomSpace = Number( bottomSpace?.[ device ] ) || 0;

	// ── Setters — only active device branch changes ────────────────────────────

	const setGap = ( value ) => {
		setAttributes( {
			gap: { ...gap, [ device ]: Number( value ) || 0 },
		} );
	};

	const clampEdgeSpace = ( value ) =>
		Math.max( MIN_EDGE_SPACE, Math.min( MAX_EDGE_SPACE, Number( value ) || 0 ) );

	const setTopSpace = ( value ) => {
		setAttributes( {
			topSpace: { ...topSpace, [ device ]: clampEdgeSpace( value ) },
		} );
	};

	const setBottomSpace = ( value ) => {
		setAttributes( {
			bottomSpace: { ...bottomSpace, [ device ]: clampEdgeSpace( value ) },
		} );
	};

	// Write normalized sizes back to the active device branch only.
	const setActiveWidths = ( nextSizes ) => {
		setAttributes( {
			columnWidths: {
				...columnWidths,
				[ device ]: normalizeSizes( nextSizes, stackCount ),
			},
		} );
	};

	// ── Refs ───────────────────────────────────────────────────────────────────

	const layoutRef      = useRef( null );
	const resizeStateRef = useRef( null );
	const rafRef         = useRef( null );   // pending requestAnimationFrame id
	const handleRefs     = useRef( [] );     // live divider handle button elements
	const topHandleRef   = useRef( null );   // live top edge-space handle element
	const bottomHandleRef = useRef( null );  // live bottom edge-space handle element
	const topHandleValueRef    = useRef( null ); // live top edge-space px badge text
	const bottomHandleValueRef = useRef( null ); // live bottom edge-space px badge text
	const isDraggingRef  = useRef( false );  // true only during an active drag
	const handlePositionsRef = useRef( [] ); // last measured handle positions

	// Last real measured height of the layout box, captured at the start of
	// a drag. Used as the stable pixel budget for getRowPixelHeights() so
	// row sizing never depends on the browser's own (shared-across-tracks)
	// grid `fr` resolution. Reset whenever stackCount changes since the
	// stack sizes themselves reset then too (see effect below), and whenever
	// topSpace/bottomSpace change since they shift how much of the measured
	// height is actually available to rows.
	const lastMeasuredHeightRef = useRef( null );

	useEffect( () => {
		lastMeasuredHeightRef.current = null;
	}, [ stackCount ] );

	useEffect( () => {
		lastMeasuredHeightRef.current = null;
	}, [ activeTopSpace, activeBottomSpace ] );

	// ── Inner blocks sync ──────────────────────────────────────────────────────

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const { insertBlock, removeBlock } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		if ( ! hasSelectedLayout ) return;

		const currentCount = innerBlocks.length;

		if ( currentCount < stackCount ) {
			for ( let i = currentCount; i < stackCount; i++ ) {
				insertBlock( createBlock( CHILD_BLOCK_NAME ), i, clientId, false );
			}
		}

		if ( currentCount > stackCount ) {
			innerBlocks.slice( stackCount ).forEach( ( block ) =>
				removeBlock( block.clientId, false )
			);
		}
	}, [ hasSelectedLayout, stackCount, innerBlocks, clientId, insertBlock, removeBlock ] );

	// Sync every device branch length when stackCount changes.
	useEffect( () => {
		if ( ! hasSelectedLayout ) return;

		const devices = [ 'desktop', 'tablet', 'mobile' ];
		let needsUpdate = false;
		const next = { ...columnWidths };

		devices.forEach( ( d ) => {
			const branch = Array.isArray( next[ d ] ) ? next[ d ] : [];
			if ( branch.length !== stackCount ) {
				next[ d ] = normalizeSizes( branch, stackCount );
				needsUpdate = true;
			}
		} );

		if ( needsUpdate ) {
			setAttributes( { columnWidths: next } );
		}
	}, [ hasSelectedLayout, stackCount, columnWidths, setAttributes ] );

	const template = useMemo( () => {
		if ( ! hasSelectedLayout ) return [];
		return Array.from( { length: stackCount }, () => [ CHILD_BLOCK_NAME ] );
	}, [ hasSelectedLayout, stackCount ] );

	// ── Layout picker ──────────────────────────────────────────────────────────

	const selectStackLayout = ( value ) => {
		const nextCount = Number( value ) || 1;
		const equal     = getEqualSizes( nextCount );
		setAttributes( {
			sections:     nextCount,
			columnWidths: { desktop: equal, tablet: equal, mobile: equal },
		} );
	};

	// ── Drag resize ────────────────────────────────────────────────────────────
	//
	// Smoothness strategy:
	//   • During the drag we DO NOT call setAttributes at all. Instead we mutate
	//     the layout's `grid-template-rows` and each handle's `top` directly on
	//     the DOM, batched through requestAnimationFrame. No React re-render, no
	//     store churn → 60fps drag.
	//   • The computed sizes are stashed in state.lastSizes.
	//   • On pointerup we commit ONCE with setActiveWidths( lastSizes ), which
	//     re-renders normally and keeps the DOM in sync with attributes.

	// Compute top/bottom sizes for the current pointer position (pure).
	const computeSizes = ( clientY ) => {
		const state = resizeStateRef.current;
		if ( ! state ) return null;

		const {
			layoutRect, startY, startSizes,
			topIndex, bottomIndex, topStartSize, bottomStartSize,
		} = state;

		if ( layoutRect.height <= 0 ) return null;

		const clampedY     = Math.min( Math.max( clientY, layoutRect.top ), layoutRect.bottom );
		const combinedSize = topStartSize + bottomStartSize;
		const deltaPercent = ( ( clampedY - startY ) / layoutRect.height ) * 100;

		let nextTop    = topStartSize    + deltaPercent;
		let nextBottom = bottomStartSize - deltaPercent;

		if ( nextTop    < MIN_STACK_SIZE ) { nextTop    = MIN_STACK_SIZE; nextBottom = combinedSize - MIN_STACK_SIZE; }
		if ( nextBottom < MIN_STACK_SIZE ) { nextBottom = MIN_STACK_SIZE; nextTop    = combinedSize - MIN_STACK_SIZE; }

		const nextSizes = [ ...startSizes ];
		nextSizes[ topIndex ]    = nextTop;
		nextSizes[ bottomIndex ] = nextBottom;
		return nextSizes;
	};

	// Paint sizes straight onto the DOM (no React). Runs inside rAF.
	const paintSizes = ( sizes ) => {
		const layoutEl = layoutRef.current;
		if ( ! layoutEl ) return;

		// Pixel heights, computed against the height measured at drag-start
		// (resizeStateRef.current.layoutRect) — never `fr`, so this pair's
		// change can't rescale any other row (see getRowPixelHeights above).
		const totalHeightPx = resizeStateRef.current?.layoutRect?.height;
		const paddingPx     = EDITOR_LAYOUT_INSET_PX * 2 + activeTopSpace + activeBottomSpace;
		const rowPx = getRowPixelHeights( sizes, sizes.length, totalHeightPx, activeGap, paddingPx );

		// Same minmax(px, auto) shape as getEditorGridTemplateRows: the
		// dragged value is a floor, content is still allowed to grow past it.
		layoutEl.style.gridTemplateRows = rowPx
			.map( ( px ) => `minmax(${ px.toFixed( 2 ) }px, auto)` )
			.join( ' ' );

		// Reposition each handle on the cumulative boundary %, using the
		// same pixel heights so the handle lands exactly on the boundary.
		// If a row's content is taller than its floor the real boundary sits
		// lower than this estimate; the post-drag re-render re-measures from
		// the DOM (getHandlePositions) and corrects it.
		const totalRowPx = rowPx.reduce( ( sum, h ) => sum + h, 0 ) || 1;
		let accumulated = 0;
		for ( let i = 0; i < rowPx.length - 1; i++ ) {
			accumulated += rowPx[ i ];
			const el = handleRefs.current[ i ];
			if ( el ) el.style.top = `${ ( accumulated / totalRowPx ) * 100 }%`;
		}
	};

	const stopResize = () => {
		if ( rafRef.current ) {
			cancelAnimationFrame( rafRef.current );
			rafRef.current = null;
		}
		isDraggingRef.current          = false;
		resizeStateRef.current         = null;
		document.body.style.cursor     = '';
		document.body.style.userSelect = '';

		// Re-enable grid transitions after the drag.
		const layoutEl = layoutRef.current;
		if ( layoutEl ) layoutEl.style.transition = '';
	};

	const startResize = ( event, handleIndex ) => {
		if ( event.button !== 0 ) return;

		event.preventDefault();
		event.stopPropagation();

		const layoutEl = layoutRef.current;
		if ( ! layoutEl ) return;

		// Cache geometry & start sizes ONCE at drag start.
		const layoutRect      = layoutEl.getBoundingClientRect();

		// Remember this as the stable pixel budget for row sizing (used by
		// getRowPixelHeights) until the next drag re-measures it.
		lastMeasuredHeightRef.current = layoutRect.height;

		const topIndex        = handleIndex;
		const bottomIndex     = handleIndex + 1;
		const startSizes      = [ ...activeWidths ];
		const topStartSize    = startSizes[ topIndex ];
		const bottomStartSize = startSizes[ bottomIndex ];

		if ( typeof topStartSize === 'undefined' || typeof bottomStartSize === 'undefined' ) return;

		resizeStateRef.current = {
			type: 'divider',
			layoutRect, startY: event.clientY, startSizes,
			topIndex, bottomIndex, topStartSize, bottomStartSize,
			lastSizes: startSizes,
		};
		isDraggingRef.current = true;

		document.body.style.cursor     = 'row-resize';
		document.body.style.userSelect = 'none';
		// Kill any transition so rows track the cursor 1:1 while dragging.
		layoutEl.style.transition = 'none';

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	// ── Edge (top/bottom space) resize ────────────────────────────────────────
	//
	// Unlike the internal dividers, there's no sibling row to shrink when you
	// grow the outer edge — dragging it instead adds/removes empty space
	// (padding) above the first row or below the last row, leaving every row's
	// own height untouched.
	//
	// The drag delta is measured from a fixed screen anchor:
	//   • top:    the layout box's own top border — it never moves, since our
	//             own padding can't reposition where the box starts.
	//   • bottom: the fixed boundary between the last row and the bottom
	//             padding — padding-bottom only ever extends space *below*
	//             that point, it never moves it.
	// So `clientY - anchorY` is the new space value directly, no separate
	// "compute then convert" step needed.

	const computeEdgeSpace = ( clientY ) => {
		const state = resizeStateRef.current;
		if ( ! state || state.type !== 'edge' ) return null;
		return Math.max( MIN_EDGE_SPACE, Math.min( MAX_EDGE_SPACE, clientY - state.anchorY ) );
	};

	// Paint the space straight onto the DOM (no React), same rAF strategy as
	// paintSizes(). The bottom handle needs no repaint: it's pinned via
	// `bottom: 0` in its own style, which the browser already keeps glued to
	// the box's bottom edge as padding-bottom grows/shrinks.
	const paintEdgeSpace = ( space ) => {
		const layoutEl = layoutRef.current;
		const state    = resizeStateRef.current;
		if ( ! layoutEl || ! state || state.type !== 'edge' ) return;

		if ( state.edge === 'top' ) {
			layoutEl.style.paddingTop = `${ EDITOR_LAYOUT_INSET_PX + space }px`;
			if ( topHandleRef.current ) {
				topHandleRef.current.style.top = `${ EDITOR_LAYOUT_INSET_PX + space }px`;
			}
			if ( topHandleValueRef.current ) {
				topHandleValueRef.current.textContent = `${ Math.round( space ) }px`;
			}
		} else {
			layoutEl.style.paddingBottom = `${ EDITOR_LAYOUT_INSET_PX + space }px`;
			if ( bottomHandleValueRef.current ) {
				bottomHandleValueRef.current.textContent = `${ Math.round( space ) }px`;
			}
		}
	};

	const startEdgeResize = ( event, edge ) => {
		if ( event.button !== 0 ) return;

		event.preventDefault();
		event.stopPropagation();

		const layoutEl = layoutRef.current;
		if ( ! layoutEl ) return;

		const layoutRect = layoutEl.getBoundingClientRect();
		const startSpace = edge === 'top' ? activeTopSpace : activeBottomSpace;
		const anchorY     = edge === 'top'
			? layoutRect.top + EDITOR_LAYOUT_INSET_PX
			: layoutRect.bottom - ( EDITOR_LAYOUT_INSET_PX + startSpace );

		resizeStateRef.current = {
			type: 'edge', edge, anchorY, startSpace, lastSpace: startSpace,
		};
		isDraggingRef.current = true;

		document.body.style.cursor     = 'row-resize';
		document.body.style.userSelect = 'none';
		layoutEl.style.transition = 'none';

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	const handleResizeMove = ( event ) => {
		if ( ! resizeStateRef.current ) return;
		event.preventDefault();
		event.stopPropagation();

		// Coalesce moves into a single rAF paint — no store update.
		if ( rafRef.current ) return;

		const clientY = event.clientY;
		rafRef.current = requestAnimationFrame( () => {
			rafRef.current = null;
			const state = resizeStateRef.current;
			if ( ! state ) return;

			if ( state.type === 'edge' ) {
				const space = computeEdgeSpace( clientY );
				if ( space === null ) return;
				state.lastSpace = space;
				paintEdgeSpace( space );
			} else {
				const sizes = computeSizes( clientY );
				if ( ! sizes ) return;
				state.lastSizes = sizes;
				paintSizes( sizes );
			}
		} );
	};

	const handleResizeEnd = ( event ) => {
		if ( event.currentTarget.releasePointerCapture ) {
			try { event.currentTarget.releasePointerCapture( event.pointerId ); }
			catch ( e ) { /* already released */ }
		}

		// Commit the final value to the store exactly ONCE.
		const state = resizeStateRef.current;
		stopResize();
		if ( ! state ) return;

		if ( state.type === 'edge' ) {
			if ( state.edge === 'top' ) setTopSpace( state.lastSpace );
			else setBottomSpace( state.lastSpace );
		} else if ( state.lastSizes ) {
			setActiveWidths( state.lastSizes );
		}
	};

	// Safety: if the component unmounts mid-drag, cancel the pending frame.
	useEffect( () => {
		return () => {
			if ( rafRef.current ) cancelAnimationFrame( rafRef.current );
		};
	}, [] );

	// ── Block props ────────────────────────────────────────────────────────────

	const blockProps = useBlockProps( {
		ref: layoutRef,

		className: hasSelectedLayout
			? 'uplifters-site-builder-blocks-q-row-layout'
			: 'uplifters-site-builder-blocks-q-row-layout uplifters-site-builder-blocks-q-row-layout--choose',

		style: hasSelectedLayout
			? {
					display:             'grid',
					gridTemplateColumns: 'minmax(0, 1fr)',
					// Editor uses active device's widths for preview.
					gridTemplateRows:    getEditorGridTemplateRows(
						activeWidths,
						stackCount,
						lastMeasuredHeightRef.current,
						activeGap,
						EDITOR_LAYOUT_INSET_PX * 2 + activeTopSpace + activeBottomSpace
					),
					gap:                 `${ activeGap }px`,
					alignItems:          'stretch',
					width:               '100%',
					maxWidth:            '100%',
					boxSizing:           'border-box',
					overflowWrap:        'break-word',
					minHeight:           `${ stackCount * EDITOR_MIN_ROW_PX + EDITOR_LAYOUT_INSET_PX * 2 + activeTopSpace + activeBottomSpace }px`,
					border:              '1px dashed #c3c4c7',
					paddingTop:          `${ EDITOR_LAYOUT_INSET_PX + activeTopSpace }px`,
					paddingBottom:       `${ EDITOR_LAYOUT_INSET_PX + activeBottomSpace }px`,
					paddingLeft:         `${ EDITOR_LAYOUT_INSET_PX }px`,
					paddingRight:        `${ EDITOR_LAYOUT_INSET_PX }px`,
					position:            'relative',
			  }
			: {
					border:     '1px dashed #c3c4c7',
					padding:    '12px',
					minHeight:  'auto',
					background: '#ffffff',
			  },
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ CHILD_BLOCK_NAME ],
		template,
		templateLock:   false,
		renderAppender: false,
	} );

	const { children: innerBlocksChildren, ...innerBlocksWrapperProps } = innerBlocksProps;

	// ── Layout picker screen ───────────────────────────────────────────────────

	if ( ! hasSelectedLayout ) {
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
							label={ __( 'Stacks', 'uplifters-site-builder-blocks' ) }
							value={ stackCount }
							options={ [
								{ label: __( 'Choose stacks', 'uplifters-site-builder-blocks' ), value: 0 },
								...STACK_OPTIONS.map( ( o ) => ( { label: o.label, value: o.value } ) ),
							] }
							onChange={ selectStackLayout }
						/>
					</PanelBody>
				</InspectorControls>

				<InspectorControls group="styles">
					<div aria-hidden="true" />
				</InspectorControls>

				<div { ...blockProps }>
					<div
						className="uplifters-site-builder-blocks-q-row-layout__chooser"
						style={ { maxWidth: '760px', margin: '0 auto', textAlign: 'center' } }
					>
						<h3 style={ { margin: '0 0 6px', fontSize: '16px' } }>
							{ __( 'Choose stack layout', 'uplifters-site-builder-blocks' ) }
						</h3>
						<p style={ { margin: '0 0 12px', fontSize: '12px', color: '#646970' } }>
							{ __( 'Select how many horizontal stacks you want inside this layout.', 'uplifters-site-builder-blocks' ) }
						</p>
						<div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '8px' } }>
							{ STACK_OPTIONS.map( ( option ) => (
								<Button
									key={ option.value }
									variant="secondary"
									onClick={ () => selectStackLayout( option.value ) }
									style={ { display: 'block', width: '100%', height: 'auto', padding: '8px' } }
								>
									<span style={ { display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', height: '40px', marginBottom: '6px' } }>
										{ Array.from( { length: option.value }, ( _, i ) => (
											<span
												key={ i }
												style={ { display: 'block', flex: '1 1 0', width: '100%', minHeight: '4px', border: '1px solid #c3c4c7', background: '#f6f7f7', borderRadius: '2px', boxSizing: 'border-box' } }
											/>
										) ) }
									</span>
									<strong style={ { fontSize: '12px' } }>{ option.label }</strong>
								</Button>
							) ) }
						</div>
					</div>
				</div>
			</>
		);
	}

	// ── Active layout ──────────────────────────────────────────────────────────

	// Handle positions are measured from the real DOM so they match the
	// editor's rendered rows regardless of minmax floors. While a drag is in
	// progress we skip re-measuring — paintSizes() owns the handle `top` then,
	// and re-measuring would fight it.
	const handlePositions = isDraggingRef.current
		? handlePositionsRef.current
		: getHandlePositions( layoutRef.current, stackCount );
	handlePositionsRef.current = handlePositions;

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
						label={ __( 'Stacks', 'uplifters-site-builder-blocks' ) }
						value={ stackCount }
						options={ STACK_OPTIONS.map( ( o ) => ( { label: o.label, value: o.value } ) ) }
						onChange={ selectStackLayout }
						help={ __( 'Changing stacks will reset stack sizes.', 'uplifters-site-builder-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Layout', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openStylesPanel === 'layout' }
					onToggle={ () => toggleStylesPanel( 'layout' ) }
				>
					<p style={ { margin: '0 0 12px', fontSize: '11px', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.5px' } }>
						{ __( 'Editing:', 'uplifters-site-builder-blocks' ) } <strong>{ device }</strong>
					</p>
					<RangeControl
						label={ __( 'Gap', 'uplifters-site-builder-blocks' ) }
						value={ activeGap }
						onChange={ setGap }
						min={ 0 }
						max={ 100 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksWrapperProps }>
				{ innerBlocksChildren }

				<button
					type="button"
					aria-label={ __( 'Resize top space', 'uplifters-site-builder-blocks' ) }
					ref={ topHandleRef }
					onPointerDown={ ( event ) => startEdgeResize( event, 'top' ) }
					onPointerMove={ handleResizeMove }
					onPointerUp={ handleResizeEnd }
					onPointerCancel={ handleResizeEnd }
					onLostPointerCapture={ handleResizeEnd }
					style={ {
						position:      'absolute',
						left:          '50%',
						top:           `${ EDITOR_LAYOUT_INSET_PX + activeTopSpace }px`,
						minWidth:      '36px',
						height:        '18px',
						padding:       '0 6px',
						border:        '2px solid #1e1e1e',
						borderRadius:  '999px',
						background:    '#ffffff',
						boxShadow:     '0 1px 4px rgba(0,0,0,0.25)',
						transform:     'translate(-50%, -50%)',
						cursor:        'row-resize',
						zIndex:        999,
						touchAction:   'none',
						pointerEvents: 'auto',
						willChange:    'top',
						display:       'flex',
						alignItems:    'center',
						justifyContent: 'center',
						fontSize:      '10px',
						fontWeight:    600,
						lineHeight:    1,
						color:         '#1e1e1e',
						whiteSpace:    'nowrap',
					} }
				>
					<span ref={ topHandleValueRef }>{ Math.round( activeTopSpace ) }px</span>
				</button>

				<button
					type="button"
					aria-label={ __( 'Resize bottom space', 'uplifters-site-builder-blocks' ) }
					ref={ bottomHandleRef }
					onPointerDown={ ( event ) => startEdgeResize( event, 'bottom' ) }
					onPointerMove={ handleResizeMove }
					onPointerUp={ handleResizeEnd }
					onPointerCancel={ handleResizeEnd }
					onLostPointerCapture={ handleResizeEnd }
					style={ {
						position:      'absolute',
						left:          '50%',
						bottom:        0,
						minWidth:      '36px',
						height:        '18px',
						padding:       '0 6px',
						border:        '2px solid #1e1e1e',
						borderRadius:  '999px',
						background:    '#ffffff',
						boxShadow:     '0 1px 4px rgba(0,0,0,0.25)',
						transform:     'translate(-50%, 50%)',
						cursor:        'row-resize',
						zIndex:        999,
						touchAction:   'none',
						pointerEvents: 'auto',
						willChange:    'bottom',
						display:       'flex',
						alignItems:    'center',
						justifyContent: 'center',
						fontSize:      '10px',
						fontWeight:    600,
						lineHeight:    1,
						color:         '#1e1e1e',
						whiteSpace:    'nowrap',
					} }
				>
					<span ref={ bottomHandleValueRef }>{ Math.round( activeBottomSpace ) }px</span>
				</button>

				{ handlePositions.map( ( position, index ) => (
					<button
						key={ index }
						ref={ ( el ) => { handleRefs.current[ index ] = el; } }
						type="button"
						aria-label={ __( 'Resize stacks', 'uplifters-site-builder-blocks' ) }
						onPointerDown={ ( event ) => startResize( event, index ) }
						onPointerMove={ handleResizeMove }
						onPointerUp={ handleResizeEnd }
						onPointerCancel={ handleResizeEnd }
						onLostPointerCapture={ handleResizeEnd }
						style={ {
							position:      'absolute',
							left:          '50%',
							top:           `${ position }%`,
							width:         '32px',
							height:        '16px',
							padding:       0,
							border:        '2px solid #1e1e1e',
							borderRadius:  '999px',
							background:    '#ffffff',
							boxShadow:     '0 1px 4px rgba(0,0,0,0.25)',
							transform:     'translate(-50%, -50%)',
							cursor:        'row-resize',
							zIndex:        999,
							touchAction:   'none',
							pointerEvents: 'auto',
							willChange:    'top',
						} }
					/>
				) ) }
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="row-layout" /> : <Editor { ...props } />;
}
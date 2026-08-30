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

const CHILD_BLOCK_NAME = 'uplifters-site-builder-blocks/column-section';
const MIN_COLUMN_WIDTH_PX = 8; // about one alphabet/1ch on most fonts

const COLUMN_OPTIONS = [
	{ label: __( '1 Column',  'uplifters-site-builder-blocks' ), value: 1 },
	{ label: __( '2 Columns', 'uplifters-site-builder-blocks' ), value: 2 },
	{ label: __( '3 Columns', 'uplifters-site-builder-blocks' ), value: 3 },
	{ label: __( '4 Columns', 'uplifters-site-builder-blocks' ), value: 4 },
	{ label: __( '5 Columns', 'uplifters-site-builder-blocks' ), value: 5 },
	{ label: __( '6 Columns', 'uplifters-site-builder-blocks' ), value: 6 },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const getEqualWidths = ( count ) => {
	if ( ! count ) return [];
	const w = 100 / count;
	return Array.from( { length: count }, () => w );
};

const normalizeWidths = ( widths, count ) => {
	if ( ! count ) return [];
	if ( ! Array.isArray( widths ) || widths.length !== count ) {
		return getEqualWidths( count );
	}
	const nums  = widths.map( ( w ) => Number( w ) || 0 );
	const total = nums.reduce( ( s, w ) => s + w, 0 );
	if ( total <= 0 ) return getEqualWidths( count );
	return nums.map( ( w ) => ( w / total ) * 100 );
};

const getGridTemplateColumns = ( widths, count ) => {
	const norm = normalizeWidths( widths, count );
	if ( ! norm.length ) return `repeat( ${ count || 1 }, minmax(1ch, 1fr) )`;
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
 */
const resolveColumnWidths = ( raw, count ) => {
	// New object shape: { desktop:[], tablet:[], mobile:[] }
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		const desktop = normalizeWidths( Array.isArray( raw.desktop ) ? raw.desktop : [], count );
		const tablet  = normalizeWidths( Array.isArray( raw.tablet  ) ? raw.tablet  : [], count );
		const mobile  = normalizeWidths( Array.isArray( raw.mobile  ) ? raw.mobile  : [], count );
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
 * Given the raw gap attribute (number or { desktop, tablet, mobile }),
 * return a stable { desktop, tablet, mobile } object of numbers.
 */
const resolveGap = ( raw ) => {
	if ( raw !== null && typeof raw === 'object' && ! Array.isArray( raw ) ) {
		return {
			desktop: Number( raw.desktop ) || 0,
			tablet:  Number( raw.tablet  ) || 0,
			mobile:  Number( raw.mobile  ) || 0,
		};
	}
	const n = Number( raw ) || 0;
	return { desktop: n, tablet: n, mobile: n };
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

// ─── Chooser UI (no layout selected) ─────────────────────────────────────────

function LayoutChooser( { onSelect } ) {
	return (
		<div
			className="column-layout__chooser"
			style={ { maxWidth: '760px', margin: '0 auto', textAlign: 'center' } }
		>
			<h3
				style={ { margin: '0 0 8px', fontSize: '18px' } }
			>
				{ __( 'Choose columns layout', 'uplifters-site-builder-blocks' ) }
			</h3>

			<p style={ { margin: '0 0 18px', color: '#646970' } }>
				{ __( 'Select how many columns you want inside this columns layout.', 'uplifters-site-builder-blocks' ) }
			</p>

			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
					gap: '10px',
				} }
			>
				{ COLUMN_OPTIONS.map( ( option ) => (
					<Button
						key={ option.value }
						variant="secondary"
						onClick={ () => onSelect( option.value ) }
						style={ {
							display: 'block',
							width: '100%',
							height: 'auto',
							padding: '12px',
						} }
					>
						<span
							style={ {
								display: 'grid',
								gridTemplateColumns: `repeat(${ option.value }, minmax(0, 1fr))`,
								gap: '4px',
								height: '36px',
								marginBottom: '8px',
							} }
						>
							{ Array.from( { length: option.value }, ( _, i ) => (
								<span
									key={ i }
									style={ {
										display: 'block',
										border: '1px solid #c3c4c7',
										background: '#f6f7f7',
										borderRadius: '2px',
									} }
								/>
							) ) }
						</span>
						<strong>{ option.label }</strong>
					</Button>
				) ) }
			</div>
		</div>
	);
}

// ─── Edit Component ───────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		sections     = 0,
		gap          = { desktop: 0, tablet: 0, mobile: 0 },
		columnWidths = { desktop: [], tablet: [], mobile: [] },
	} = attributes;

	const device      = useGlobalResponsiveDevice();
	const columnCount = Number( sections ) || 0;
	const hasLayout   = columnCount > 0;

	const columnsRef         = useRef( null );
	const resizeStateRef = useRef( null );
	const [ resizePreview, setResizePreview ] = useState( null );

	// ── Inspector accordion state (Settings tab exclusive / Styles tab exclusive) ──
	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleSettingsPanel = ( key ) => setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	// ── Resolve attributes into stable per-device objects ────────────────────
	// JSON-serialise as memo key so object identity changes only when
	// the underlying data actually changes — avoids stale closure / inf-loop.

	const gapKey          = JSON.stringify( gap );
	const columnWidthsKey = JSON.stringify( columnWidths );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const gapObj = useMemo( () => resolveGap( gap ), [ gapKey ] );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const columnWidthsObj = useMemo(
		() => resolveColumnWidths( columnWidths, columnCount ),
		[ columnWidthsKey, columnCount ]
	);

	// Active-device slices (primitive / stable references)
	const currentGap           = gapObj[ device ] ?? 0;
	const activeWidths         = columnWidthsObj[ device ] ?? getEqualWidths( columnCount );
	const normalizedWidths     = useMemo(
		() => normalizeWidths( activeWidths, columnCount ),
		// activeWidths is already normalised by resolveColumnWidths, but
		// stringify keeps the memo key stable.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( activeWidths ), columnCount ]
	);

	// ── Setters ───────────────────────────────────────────────────────────────

	const setGapForDevice = ( value ) => {
		setAttributes( {
			gap: { ...gapObj, [ device ]: Number( value ) || 0 },
		} );
	};

	const setColumnWidthsForDevice = ( nextWidths ) => {
		setAttributes( {
			columnWidths: { ...columnWidthsObj, [ device ]: nextWidths },
		} );
	};

	// ── Column count chooser ──────────────────────────────────────────────────

	const selectColumnLayout = ( value ) => {
		const next = Number( value ) || 1;
		const eq   = getEqualWidths( next );
		setAttributes( {
			sections:     next,
			columnWidths: { desktop: eq, tablet: [ ...eq ], mobile: [ ...eq ] },
		} );
	};

	// ── Inner block sync ──────────────────────────────────────────────────────

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const { insertBlock, removeBlock } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		if ( ! hasLayout ) return;
		const current = innerBlocks.length;

		if ( current < columnCount ) {
			for ( let i = current; i < columnCount; i++ ) {
				insertBlock( createBlock( CHILD_BLOCK_NAME ), i, clientId, false );
			}
		} else if ( current > columnCount ) {
			innerBlocks
				.slice( columnCount )
				.forEach( ( b ) => removeBlock( b.clientId, false ) );
		}
	}, [ hasLayout, columnCount, innerBlocks, clientId, insertBlock, removeBlock ] );

	// Reset device widths to equal whenever the active device has a mismatch
	// (e.g. first time switching to tablet before any resize was done).
	useEffect( () => {
		if ( ! hasLayout ) return;
		if ( ! Array.isArray( activeWidths ) || activeWidths.length !== columnCount ) {
			setColumnWidthsForDevice( getEqualWidths( columnCount ) );
		}
	// We intentionally exclude setColumnWidthsForDevice from deps to avoid
	// triggering on every render — the effect only cares about these values.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasLayout, columnCount, device, columnWidthsKey ] );

	const template = useMemo( () => {
		if ( ! hasLayout ) return [];
		return Array.from( { length: columnCount }, () => [ CHILD_BLOCK_NAME ] );
	}, [ hasLayout, columnCount ] );

	// ── Resize logic ──────────────────────────────────────────────────────────

	const stopResize = () => {
		resizeStateRef.current         = null;
		setResizePreview( null );
		document.body.style.cursor     = '';
		document.body.style.userSelect = '';
	};

	const resizeColumns = ( clientX ) => {
		const state = resizeStateRef.current;
		if ( ! state ) return;

		const { columnsRect, startX, startWidths, leftIndex, rightIndex, leftStart, rightStart } = state;

		if ( columnsRect.width <= 0 ) { stopResize(); return; }

		const minColumnPercent = Math.max( ( MIN_COLUMN_WIDTH_PX / columnsRect.width ) * 100, 0.1 );
		const clampedX         = Math.min( Math.max( clientX, columnsRect.left ), columnsRect.right );
		const combined         = leftStart + rightStart;
		const deltaPercent     = ( ( clampedX - startX ) / columnsRect.width ) * 100;

		if ( combined < minColumnPercent * 2 ) return;

		let nextLeft  = leftStart  + deltaPercent;
		let nextRight = rightStart - deltaPercent;

		if ( nextLeft < minColumnPercent ) {
			nextLeft  = minColumnPercent;
			nextRight = combined - minColumnPercent;
		}

		if ( nextRight < minColumnPercent ) {
			nextRight = minColumnPercent;
			nextLeft  = combined - minColumnPercent;
		}

		if ( nextLeft < minColumnPercent || nextRight < minColumnPercent ) return;

		const next = [ ...startWidths ];
		next[ leftIndex ]  = nextLeft;
		next[ rightIndex ] = nextRight;

		const nextNormalized = normalizeWidths( next, columnCount );

		setResizePreview( {
			handleIndex: leftIndex,
			widths: nextNormalized,
		} );

		setColumnWidthsForDevice( nextNormalized );
	};

	const startResize = ( event, handleIndex ) => {
		if ( event.button !== 0 ) return;
		event.preventDefault();
		event.stopPropagation();

		const columnsEl = columnsRef.current;
		if ( ! columnsEl ) return;

		const columnsRect     = columnsEl.getBoundingClientRect();
		const startWidths = [ ...normalizedWidths ];
		const leftStart   = startWidths[ handleIndex ];
		const rightStart  = startWidths[ handleIndex + 1 ];

		if ( typeof leftStart === 'undefined' || typeof rightStart === 'undefined' ) return;

		resizeStateRef.current = {
			columnsRect,
			startX: event.clientX,
			startWidths,
			leftIndex:  handleIndex,
			rightIndex: handleIndex + 1,
			leftStart,
			rightStart,
		};

		setResizePreview( {
			handleIndex,
			widths: startWidths,
		} );

		document.body.style.cursor     = 'col-resize';
		document.body.style.userSelect = 'none';

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	const handleResizeMove = ( event ) => {
		if ( ! resizeStateRef.current ) return;
		event.preventDefault();
		event.stopPropagation();
		resizeColumns( event.clientX );
	};

	const handleResizeEnd = ( event ) => {
		if ( event.currentTarget.releasePointerCapture ) {
			try { event.currentTarget.releasePointerCapture( event.pointerId ); } catch {}
		}
		stopResize();
	};

	// ── Block props ───────────────────────────────────────────────────────────

	const deviceLabel = device.charAt( 0 ).toUpperCase() + device.slice( 1 );

	const sharedBlockStyle = hasLayout
		? {
				display: 'grid',
				gridTemplateColumns: getGridTemplateColumns( normalizedWidths, columnCount ),
				gap: `${ currentGap }px`,
				width: '100%',
				maxWidth: '100%',
				boxSizing: 'border-box',
				overflowWrap: 'anywhere',
				wordBreak: 'break-word',
				minHeight: '140px',
				border: '1px dashed #c3c4c7',
				padding: '12px',
				position: 'relative',
		  }
		: {
				border: '1px dashed #c3c4c7',
				padding: '18px',
				minHeight: '150px',
				background: '#ffffff',
		  };

	// ── Chooser branch (no layout selected) ──────────────────────────────────
	// Must use useBlockProps unconditionally (Rules of Hooks).
	// We call useInnerBlocksProps unconditionally too, then simply don't render
	// inner blocks in the chooser branch.

	const blockProps = useBlockProps( {
		ref: columnsRef,
		className: hasLayout
			? 'column-layout'
			: 'column-layout column-layout--choose',
		style: sharedBlockStyle,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ CHILD_BLOCK_NAME ],
		template,
		templateLock: hasLayout ? 'all' : false,
		renderAppender: false,
	} );

	const { children: innerBlocksChildren, ...innerBlocksWrapperProps } = innerBlocksProps;

	// ── Shared inspector controls ─────────────────────────────────────────────

	const settingsPanel = (
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
					options={ [
						...( ! hasLayout
							? [ { label: __( 'Choose columns', 'uplifters-site-builder-blocks' ), value: 0 } ]
							: [] ),
						...COLUMN_OPTIONS.map( ( o ) => ( {
							label: o.label,
							value: o.value,
						} ) ),
					] }
					onChange={ selectColumnLayout }
					help={ hasLayout
						? __( 'Changing columns will reset column widths.', 'uplifters-site-builder-blocks' )
						: undefined }
				/>
			</PanelBody>
		</InspectorControls>
	);

	// ── Chooser branch ────────────────────────────────────────────────────────

	if ( ! hasLayout ) {
		return (
			<>
				{ settingsPanel }

				<InspectorControls group="styles">
					<div aria-hidden="true" />
				</InspectorControls>

				<div { ...blockProps }>
					<LayoutChooser onSelect={ selectColumnLayout } />
				</div>
			</>
		);
	}

	// ── Layout active branch ──────────────────────────────────────────────────

	const previewWidths   = resizePreview?.widths || normalizedWidths;
	const handlePositions = getHandlePositions( previewWidths );
	const formatPercent   = ( value ) => {
		const n = Number( value ) || 0;
		return n.toFixed( 1 ).replace( /\.0$/, '' );
	};

	return (
		<>
			{ settingsPanel }

			<InspectorControls group="styles">
				<PanelBody
					title={ `${ __( 'Layout', 'uplifters-site-builder-blocks' ) } – ${ deviceLabel }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'layout' }
					onToggle={ () => toggleStylesPanel( 'layout' ) }
				>
					<RangeControl
						label={ __( 'Gap', 'uplifters-site-builder-blocks' ) }
						value={ currentGap }
						onChange={ setGapForDevice }
						min={ 0 }
						max={ 100 }
						help={ __( 'Gap between columns for current device.', 'uplifters-site-builder-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksWrapperProps }>
				{ innerBlocksChildren }

				{ handlePositions.map( ( position, index ) => {
					const isActive = resizePreview?.handleIndex === index;
					const leftPercent = previewWidths[ index ];
					const rightPercent = previewWidths[ index + 1 ];

					return (
						<button
							key={ index }
							type="button"
							aria-label={ __( 'Resize columns', 'uplifters-site-builder-blocks' ) }
							onPointerDown={ ( e ) => startResize( e, index ) }
							onPointerMove={ handleResizeMove }
							onPointerUp={ handleResizeEnd }
							onPointerCancel={ handleResizeEnd }
							style={ {
								position: 'absolute',
								left: `${ position }%`,
								top: '50%',
								width: '24px',
								height: '24px',
								padding: 0,
								border: '2px solid #1e1e1e',
								borderRadius: '999px',
								background: '#ffffff',
								boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
								transform: 'translate(-50%, -50%)',
								cursor: 'col-resize',
								zIndex: 999,
								touchAction: 'none',
								pointerEvents: 'auto',
							} }
						>
							{ isActive && (
								<span
									style={ {
										position: 'absolute',
										left: '50%',
										bottom: 'calc(100% + 10px)',
										transform: 'translateX(-50%)',
										padding: '4px 8px',
										borderRadius: '999px',
										background: '#1e1e1e',
										color: '#ffffff',
										fontSize: '11px',
										fontWeight: 600,
										lineHeight: 1.2,
										whiteSpace: 'nowrap',
										pointerEvents: 'none',
										boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
									} }
								>
									{ `${ formatPercent( leftPercent ) }% / ${ formatPercent( rightPercent ) }%` }
								</span>
							) }
						</button>
					);
				} ) }
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="column-layout" /> : <Editor { ...props } />;
}

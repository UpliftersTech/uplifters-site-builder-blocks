import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';

// Clamp for the padding drag handle (matches the Padding RangeControl's own
// range, so dragging and typing land on the same scale).
const MIN_PADDING = 0;
const MAX_PADDING = 200;

// ── useGlobalResponsiveDevice ─────────────────────────────────────────────────
//
// Reads the active device from the UPLIFTERS_SITE_BUILDER_BLOCKS floating responsive toolbar.
// Priority: localStorage (set by the toolbar) → Gutenberg store → 'desktop'.
// Stays reactive via a CustomEvent listener.
//
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

		// Sync once on mount in case toolbar fired before we mounted.
		const local = getLocalDevice();
		if ( local ) setDevice( local );

		return () => window.removeEventListener( EVENT_KEY, onDeviceChange );
	}, [] );

	// If Gutenberg store changes and no local override, follow it.
	useEffect( () => {
		if ( ! getLocalDevice() && gutenbergDevice ) {
			setDevice( gutenbergDevice );
		}
	}, [ gutenbergDevice ] );

	return device;
}

// ── Edit ──────────────────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes, clientId } ) {
	const { padding, margin, backgroundColor } = attributes;

	const device = useGlobalResponsiveDevice();

	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );

	const toggleStylesPanel = ( key ) =>
		setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	// Read active device's value from each attribute object.
	const activePadding         = Number( padding?.[ device ] )         || 0;
	const activeMargin          = Number( margin?.[ device ] )          || 0;
	const activeBackgroundColor = backgroundColor?.[ device ]           || '';

	// Update only the active device branch of an attribute object.
	const setDeviceValue = ( attrKey, value ) => {
		setAttributes( {
			[ attrKey ]: {
				...attributes[ attrKey ],
				[ device ]: value,
			},
		} );
	};

	const hasInnerBlocks = useSelect(
		( select ) => {
			const block = select( 'core/block-editor' ).getBlock( clientId );
			return Boolean( block?.innerBlocks?.length );
		},
		[ clientId ]
	);

	// ── Padding drag resize ───────────────────────────────────────────────────
	//
	// Same smoothness strategy as row-layout's edge-space handles: during the
	// drag we mutate the section's own `padding` directly on the DOM (batched
	// via requestAnimationFrame), skipping setAttributes entirely so there's
	// no store churn / re-render per pixel. The final value is committed to
	// the store ONCE on pointerup.
	//
	// The handle itself is pinned at a fixed corner spot (not tracking the
	// live padding value): row-layout renders its own divider/edge handles at
	// exactly the row boundary — the same Y a tracking handle would sit at
	// whenever this section's padding is small — and being later DOM siblings
	// they paint (and hit-test) on top of anything nested inside a row-
	// section, silently swallowing the pointerdown. A fixed inset can never
	// coincide with a boundary line, so it can never be shadowed like that.
	//
	// Padding is a single value applied to all four sides, so one handle is
	// enough. The drag math still anchors to the fixed border-box top edge
	// (padding growth can't move that point — only the box's own bottom edge
	// shifts), so `clientY - anchorY` gives the new padding directly.

	const sectionRef      = useRef( null );
	const paddingValueRef = useRef( null );
	const resizeStateRef  = useRef( null );
	const rafRef          = useRef( null );
	const isDraggingRef   = useRef( false );

	const computePadding = ( clientY ) => {
		const state = resizeStateRef.current;
		if ( ! state ) return null;
		return Math.max( MIN_PADDING, Math.min( MAX_PADDING, clientY - state.anchorY ) );
	};

	const paintPadding = ( value ) => {
		const sectionEl = sectionRef.current;
		if ( ! sectionEl ) return;
		sectionEl.style.padding = `${ value }px`;
		if ( paddingValueRef.current ) paddingValueRef.current.textContent = `${ Math.round( value ) }px`;
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

		const sectionEl = sectionRef.current;
		if ( sectionEl ) sectionEl.style.transition = '';
	};

	const startPaddingResize = ( event ) => {
		if ( event.button !== 0 ) return;

		event.preventDefault();
		event.stopPropagation();

		const sectionEl = sectionRef.current;
		if ( ! sectionEl ) return;

		const rect    = sectionEl.getBoundingClientRect();
		const anchorY = rect.top;

		resizeStateRef.current = { anchorY, startPadding: activePadding, lastPadding: activePadding };
		isDraggingRef.current = true;

		document.body.style.cursor     = 'ns-resize';
		document.body.style.userSelect = 'none';
		sectionEl.style.transition = 'none';

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	const handlePaddingResizeMove = ( event ) => {
		if ( ! resizeStateRef.current ) return;
		event.preventDefault();
		event.stopPropagation();

		if ( rafRef.current ) return;

		const clientY = event.clientY;
		rafRef.current = requestAnimationFrame( () => {
			rafRef.current = null;
			const state = resizeStateRef.current;
			if ( ! state ) return;

			const value = computePadding( clientY );
			if ( value === null ) return;
			state.lastPadding = value;
			paintPadding( value );
		} );
	};

	const handlePaddingResizeEnd = ( event ) => {
		if ( event.currentTarget.releasePointerCapture ) {
			try { event.currentTarget.releasePointerCapture( event.pointerId ); }
			catch ( e ) { /* already released */ }
		}

		const state = resizeStateRef.current;
		stopResize();
		if ( ! state ) return;

		setDeviceValue( 'padding', state.lastPadding );
	};

	// Safety: if the component unmounts mid-drag, cancel the pending frame.
	useEffect( () => {
		return () => {
			if ( rafRef.current ) cancelAnimationFrame( rafRef.current );
		};
	}, [] );

	const blockProps = useBlockProps( {
		ref: sectionRef,
		className: 'uplifters-site-builder-blocks-q-row-section',
		style: {
			width:        '100%',
			minWidth:     0,

			// Grid items default to `min-height: auto`, which lets tall
			// content (an image, mainly) push past the row track instead of
			// being contained by it — that overflow is what painted one
			// stack's image over the stack below. Explicit 0 restores
			// containment.
			minHeight:    hasInnerBlocks ? 0 : '32px',

			maxWidth:     '100%',
			alignSelf:    'stretch',
			boxSizing:    'border-box',
			overflowWrap: 'anywhere',

			// Editor-only visual aid.
			border: '1px dashed #dcdcde',

			// `flow-root` in both states: it establishes a block formatting
			// context (so child margins don't collapse out of the stack and
			// mis-measure the row boundary) without the old flex centering,
			// which was stretching/centering images once inner blocks existed.
			display: 'flow-root',

			position: 'relative',

			padding:         `${ activePadding }px`,
			margin:          `${ activeMargin }px`,
			backgroundColor: activeBackgroundColor || undefined,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock:   false,
		renderAppender: () => <InnerBlocks.ButtonBlockAppender />,
	} );

	const { children: innerBlocksChildren, ...innerBlocksWrapperProps } = innerBlocksProps;

	return (
		<>
			<InspectorControls group="settings">
				<div aria-hidden="true" />
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Spacing', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					{ /* Active device label */ }
					<p style={ { margin: '0 0 12px', fontSize: '11px', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.5px' } }>
						{ __( 'Editing:', 'uplifters-site-builder-blocks' ) } <strong>{ device }</strong>
					</p>

					<RangeControl
						label={ __( 'Padding', 'uplifters-site-builder-blocks' ) }
						value={ activePadding }
						onChange={ ( val ) => setDeviceValue( 'padding', Number( val ) || 0 ) }
						min={ 0 }
						max={ 200 }
					/>

					<RangeControl
						label={ __( 'Margin', 'uplifters-site-builder-blocks' ) }
						value={ activeMargin }
						onChange={ ( val ) => setDeviceValue( 'margin', Number( val ) || 0 ) }
						min={ 0 }
						max={ 200 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksWrapperProps }>
				{ innerBlocksChildren }

				<button
					type="button"
					aria-label={ __( 'Resize padding', 'uplifters-site-builder-blocks' ) }
					onPointerDown={ startPaddingResize }
					onPointerMove={ handlePaddingResizeMove }
					onPointerUp={ handlePaddingResizeEnd }
					onPointerCancel={ handlePaddingResizeEnd }
					onLostPointerCapture={ handlePaddingResizeEnd }
					style={ {
						position:      'absolute',
						// Fixed corner inset — NOT `top: activePadding` — on
						// purpose: row-layout's own divider/edge handles sit
						// exactly at this section's top border whenever padding
						// is small, and being later DOM siblings they win the
						// hit-test there, swallowing clicks meant for this
						// handle. A constant offset can never land on that line.
						right:         '10px',
						top:           '10px',
						minWidth:      '36px',
						height:        '18px',
						padding:       '0 6px',
						border:        '2px solid #1e1e1e',
						borderRadius:  '999px',
						background:    '#ffffff',
						boxShadow:     '0 1px 4px rgba(0,0,0,0.25)',
						cursor:        'ns-resize',
						zIndex:        999,
						touchAction:   'none',
						pointerEvents: 'auto',
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
					<span ref={ paddingValueRef }>{ Math.round( activePadding ) }px</span>
				</button>
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="row-section" /> : <Editor { ...props } />;
}
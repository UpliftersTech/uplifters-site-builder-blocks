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
import { useState, useEffect } from '@wordpress/element';

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

	const blockProps = useBlockProps( {
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

			padding:         `${ activePadding }px`,
			margin:          `${ activeMargin }px`,
			backgroundColor: activeBackgroundColor || undefined,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock:   false,
		renderAppender: () => <InnerBlocks.ButtonBlockAppender />,
	} );

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

			<div { ...innerBlocksProps } />
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="row-section" /> : <Editor { ...props } />;
}
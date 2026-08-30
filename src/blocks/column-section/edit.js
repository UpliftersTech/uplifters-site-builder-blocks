import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	__,
} from '@wordpress/i18n';

import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ColorPalette,
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';

/**
 * Hook to track the globally active responsive device.
 * Reads from UPLIFTERS_SITE_BUILDER_BLOCKS floating toolbar (localStorage + custom event).
 * Falls back to Gutenberg store state.
 *
 * @returns {string} 'desktop' | 'tablet' | 'mobile'
 */
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

function Editor( {
	attributes,
	setAttributes,
	clientId,
} ) {
	const device = useGlobalResponsiveDevice();

	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );

	const toggleStylesPanel = ( key ) =>
		setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	const {
		padding = { desktop: 0, tablet: 0, mobile: 0 },
		margin = { desktop: 0, tablet: 0, mobile: 0 },
		backgroundColor = { desktop: '', tablet: '', mobile: '' },
	} = attributes;

	// Memoize getters to avoid unnecessary re-renders
	const getPaddingForDevice = useMemo(
		() => padding[ device ] ?? 0,
		[ padding, device ]
	);

	const getMarginForDevice = useMemo(
		() => margin[ device ] ?? 0,
		[ margin, device ]
	);

	const getBackgroundForDevice = useMemo(
		() => backgroundColor[ device ] ?? '',
		[ backgroundColor, device ]
	);

	// Update only current device's value
	const setPaddingForDevice = ( value ) => {
		setAttributes( {
			padding: {
				...padding,
				[ device ]: Number( value ) || 0,
			},
		} );
	};

	const setMarginForDevice = ( value ) => {
		setAttributes( {
			margin: {
				...margin,
				[ device ]: Number( value ) || 0,
			},
		} );
	};

	const setBackgroundForDevice = ( value ) => {
		setAttributes( {
			backgroundColor: {
				...backgroundColor,
				[ device ]: value || '',
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
		className: 'column-section',
		style: {
			minHeight: '40px',
			border: '1px dashed #dcdcde',
			padding: `${ getPaddingForDevice }px`,
			margin: `${ getMarginForDevice }px`,
			backgroundColor: getBackgroundForDevice || undefined,
			boxSizing: 'border-box',
			display: 'block',
			width: '100%',
			maxWidth: '100%',
			minWidth: 0,
			overflowWrap: 'anywhere',
			wordBreak: 'break-word',
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
		renderAppender: hasInnerBlocks ? false : () => <InnerBlocks.ButtonBlockAppender />,
	} );

	const deviceLabel =
		device.charAt( 0 ).toUpperCase() + device.slice( 1 );

	return (
		<>
			<InspectorControls group="settings">
				<div aria-hidden="true" />
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ `${ __( 'Spacing', 'uplifters-site-builder-blocks' ) } – ${ deviceLabel }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<RangeControl
						label={ __( 'Padding', 'uplifters-site-builder-blocks' ) }
						value={ getPaddingForDevice }
						onChange={ setPaddingForDevice }
						min={ 0 }
						max={ 100 }
						step={ 1 }
						help={ __( 'Padding for current device', 'uplifters-site-builder-blocks' ) }
					/>

					<RangeControl
						label={ __( 'Margin', 'uplifters-site-builder-blocks' ) }
						value={ getMarginForDevice }
						onChange={ setMarginForDevice }
						min={ 0 }
						max={ 100 }
						step={ 1 }
						help={ __( 'Margin for current device', 'uplifters-site-builder-blocks' ) }
					/>
				</PanelBody>

				<PanelBody
					title={ `${ __( 'Colors', 'uplifters-site-builder-blocks' ) } – ${ deviceLabel }` }
					initialOpen={ false }
					opened={ openStylesPanel === 'colors' }
					onToggle={ () => toggleStylesPanel( 'colors' ) }
				>
					<div>
						<label
							style={ {
								display: 'block',
								marginBottom: '8px',
								fontSize: '13px',
								fontWeight: '500',
							} }
						>
							{ __( 'Background Color', 'uplifters-site-builder-blocks' ) }
						</label>

						<ColorPalette
							value={ getBackgroundForDevice }
							onChange={ setBackgroundForDevice }
							clearable={ true }
						 enableAlpha/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="column-section" /> : <Editor { ...props } />;
}

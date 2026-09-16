/**
 * Column Section — registered from inside the Column Layout folder rather
 * than its own block folder, following the same pattern as
 * row-layout/row-section.js, header-layout/header-section.js, and
 * footer-layout/footer-section.js.
 *
 * Unlike those, Column Layout can have 2-6 independent Column Section
 * children (one per grid column), each keeping its OWN padding/margin/
 * backgroundColor attribute values — this is real per-column
 * customization, not a single shared value. This block still loses its
 * own Inspector (no Settings/Styles tab when a column is selected), so
 * per-column values are frozen at whatever was last saved; Column Layout's
 * own Inspector gained matching padding/margin/backgroundColor controls
 * that apply to the whole layout instead.
 *
 * Dynamic rendering (per-instance responsive padding/margin/background via
 * CSS custom properties) still runs server-side via a manually registered
 * render callback — see includes/blocks-helper/section-wrapper/column-section-block-register.php.
 */

import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';

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

export const COLUMN_SECTION_NAME = 'uplifters-site-builder-blocks/column-section';

export const columnSectionMetadata = {
	apiVersion: 3,
	name: COLUMN_SECTION_NAME,
	title: 'Columns Section',
	category: 'uplifters-site-builder-blocks-wrapper',
	parent: [ 'uplifters-site-builder-blocks/column-layout' ],
	description: 'A section container inside the Columns Layout block with responsive padding, margin, and background controls.',
	textdomain: 'uplifters-site-builder-blocks',
	attributes: {
		padding: {
			type: 'object',
			default: { desktop: 0, tablet: 0, mobile: 0 },
		},
		margin: {
			type: 'object',
			default: { desktop: 0, tablet: 0, mobile: 0 },
		},
		backgroundColor: {
			type: 'object',
			default: { desktop: '', tablet: '', mobile: '' },
		},
	},
	supports: {
		html: false,
		inserter: false,
	},
};

export function ColumnSectionEdit( { attributes, clientId } ) {
	const device = useGlobalResponsiveDevice();

	const {
		padding = { desktop: 0, tablet: 0, mobile: 0 },
		margin = { desktop: 0, tablet: 0, mobile: 0 },
		backgroundColor = { desktop: '', tablet: '', mobile: '' },
	} = attributes;

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

	return <div { ...innerBlocksProps } />;
}

export function ColumnSectionSave() {
	return <InnerBlocks.Content />;
}

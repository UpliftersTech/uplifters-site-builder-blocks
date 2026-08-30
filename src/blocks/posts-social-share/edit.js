import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ }                                            from '@wordpress/i18n';
import { Fragment, useState, useEffect }                  from '@wordpress/element';
import { useSelect }                                      from '@wordpress/data';
import { InspectorControls, useBlockProps }               from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
} from '@wordpress/components';

// ─── useGlobalResponsiveDevice ────────────────────────────────────────────────
//
// Single source-of-truth hook for the currently active preview device.
//
// TWO layers are merged:
//
//   Layer 1 — Gutenberg editor store  (drives WP's native preview toolbar)
//   ─────────────────────────────────────────────────────────────────────
//   WP < 6.5  two separate __experimental selectors:
//     select('core/edit-post').__experimentalGetPreviewDeviceType()
//     select('core/edit-site').__experimentalGetPreviewDeviceType()
//   WP 6.5+   unified public selector (post editor + FSE):
//     select('core/editor').getDeviceType()
//   WP 6.7+   __experimental* deprecated (still present, logs a console
//             warning); core/editor.getDeviceType() is preferred and tried
//             first below, with the deprecated selectors kept only as a
//             fallback for older WP versions.
//
//   Layer 2 — UPLIFTERS_SITE_BUILDER_BLOCKS floating responsive toolbar  (our custom bar)
//   ─────────────────────────────────────────────────────────────
//   The bar writes to localStorage key 'upliftersSiteBuilderBlocksResponsiveDevice' and fires a
//   CustomEvent 'uplifters-site-builder-blocks-responsive-device-change' so any block can react.
//   When the UPLIFTERS_SITE_BUILDER_BLOCKS toolbar is used, its value takes priority over the WP
//   store — this lets designers preview mobile layouts without Gutenberg
//   resizing the whole editor canvas in ways that break multi-column views.
//
// Priority:
//   UPLIFTERS_SITE_BUILDER_BLOCKS localStorage > Gutenberg store > 'desktop'
//
// Why useSelect + useState + useEffect together?
//   useSelect()   — subscribes to Gutenberg store changes (reactive, auto re-render).
//   useState()    — holds the UPLIFTERS_SITE_BUILDER_BLOCKS localStorage value so it can trigger re-renders.
//   useEffect()   — attaches/detaches the CustomEvent listener safely (cleanup on unmount).
//   Both are needed because the two sources use different notification mechanisms.
//
// Returns lowercase: 'desktop' | 'tablet' | 'mobile'

const UPLIFTERS_SITE_BUILDER_BLOCKS_LS_KEY    = 'upliftersSiteBuilderBlocksResponsiveDevice';
const UPLIFTERS_SITE_BUILDER_BLOCKS_EVT_KEY   = 'uplifters-site-builder-blocks-responsive-device-change';
const VALID_DEVICES  = new Set( [ 'desktop', 'tablet', 'mobile' ] );

/** Normalise any raw device string to one of the three valid values. */
function normaliseDevice( raw ) {
	if ( ! raw || typeof raw !== 'string' ) return 'desktop';
	const lower = raw.toLowerCase();
	return VALID_DEVICES.has( lower ) ? lower : 'desktop';
}

/** Read the UPLIFTERS_SITE_BUILDER_BLOCKS localStorage value (null if not set / invalid). */
function readUpliftersSiteBuilderBlocksDevice() {
	try {
		const raw = window.localStorage?.getItem( UPLIFTERS_SITE_BUILDER_BLOCKS_LS_KEY );
		if ( ! raw ) return null;
		const lower = raw.toLowerCase();
		return VALID_DEVICES.has( lower ) ? lower : null;
	} catch {
		return null;
	}
}

export function useGlobalResponsiveDevice() {
	// ── Layer 1: Gutenberg store — reactive via useSelect ─────────────────────
	const wpDevice = useSelect( ( select ) => {
		// Primary: WP 6.5+ unified store (post editor + FSE)
		const editorStore = select( 'core/editor' );
		if ( editorStore?.getDeviceType ) {
			const raw = editorStore.getDeviceType();
			if ( raw ) return normaliseDevice( raw );
		}

		// Fallback A: WP < 6.5 post editor
		const editPostStore = select( 'core/edit-post' );
		if ( editPostStore?.__experimentalGetPreviewDeviceType ) {
			const raw = editPostStore.__experimentalGetPreviewDeviceType();
			if ( raw ) return normaliseDevice( raw );
		}

		// Fallback B: WP < 6.5 FSE / site editor
		const editSiteStore = select( 'core/edit-site' );
		if ( editSiteStore?.__experimentalGetPreviewDeviceType ) {
			const raw = editSiteStore.__experimentalGetPreviewDeviceType();
			if ( raw ) return normaliseDevice( raw );
		}

		return 'desktop';
	} );
	// No dep array — useSelect keeps subscription alive and re-runs on any
	// store state change related to the selectors accessed above.

	// ── Layer 2: UPLIFTERS_SITE_BUILDER_BLOCKS floating toolbar — reactive via CustomEvent ─────────────
	const [ upliftersSiteBuilderBlocksDevice, setUpliftersSiteBuilderBlocksDevice ] = useState( () => readUpliftersSiteBuilderBlocksDevice() );

	useEffect( () => {
		// Sync initial value (may have changed between render and effect run)
		setUpliftersSiteBuilderBlocksDevice( readUpliftersSiteBuilderBlocksDevice() );

		function onUpliftersSiteBuilderBlocksChange( evt ) {
			const raw = evt?.detail?.device;
			setUpliftersSiteBuilderBlocksDevice( raw ? normaliseDevice( raw ) : readUpliftersSiteBuilderBlocksDevice() );
		}

		window.addEventListener( UPLIFTERS_SITE_BUILDER_BLOCKS_EVT_KEY, onUpliftersSiteBuilderBlocksChange );
		return () => window.removeEventListener( UPLIFTERS_SITE_BUILDER_BLOCKS_EVT_KEY, onUpliftersSiteBuilderBlocksChange );
	}, [] );
	// Empty dep array: attach once, clean up on unmount.

	// ── Merge: UPLIFTERS_SITE_BUILDER_BLOCKS wins when set; otherwise defer to Gutenberg ──────────────
	return upliftersSiteBuilderBlocksDevice ?? wpDevice;
}

// ─── Responsive attribute helpers ─────────────────────────────────────────────

/**
 * Read the stored value for ONE device key — NO cascade.
 *
 * Used in sidebar controls so the user sees exactly what is saved for the
 * currently active breakpoint (null = "nothing set yet for this device").
 */
function getResponsiveValue( attributes, key, device ) {
	const obj = attributes[ key ];
	if ( ! obj || typeof obj !== 'object' ) return null;
	const v = obj[ device ];
	return ( v !== undefined && v !== null ) ? v : null;
}

/**
 * Read with desktop → tablet → mobile cascade fallback.
 *
 * Used in the canvas preview so it always renders something meaningful even
 * when only the desktop value has been set.
 */
function getResponsiveValueWithFallback( attributes, key, device ) {
	const obj = attributes[ key ];
	if ( ! obj || typeof obj !== 'object' ) return null;
	return obj[ device ] ?? obj.desktop ?? obj.tablet ?? obj.mobile ?? null;
}

/**
 * Write a value to exactly ONE device branch, preserving all other branches.
 *
 * Only the active device key is updated; tablet and mobile edits never
 * overwrite desktop values and vice-versa.
 */
function setResponsiveValue( attributes, setAttributes, key, device, value ) {
	setAttributes( {
		[ key ]: { ...( attributes[ key ] ?? {} ), [ device ]: value },
	} );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VARIANT_OPTIONS = [
	{ label: __( 'Solid (Brand Colors)',   'uplifters-site-builder-blocks' ), value: 'solid'         },
	{ label: __( 'Rounded (Brand Colors)', 'uplifters-site-builder-blocks' ), value: 'rounded'       },
	{ label: __( 'Square (Brand Colors)',  'uplifters-site-builder-blocks' ), value: 'square'        },
	{ label: __( 'Outline (Brand Colors)', 'uplifters-site-builder-blocks' ), value: 'outline'       },
	{ label: __( 'Black',                  'uplifters-site-builder-blocks' ), value: 'black'         },
	{ label: __( 'White',                  'uplifters-site-builder-blocks' ), value: 'white'         },
	{ label: __( 'Outline — Black',        'uplifters-site-builder-blocks' ), value: 'outline-black' },
	{ label: __( 'Outline — White',        'uplifters-site-builder-blocks' ), value: 'outline-white' },
];

const PLATFORM_COLORS = {
	facebook : '#1877F2',
	x        : '#000000',
	whatsapp : '#25D366',
	email    : '#EA4335',
	reddit   : '#FF4500',
	copyLink : '#6B7280',
};

const PLATFORMS = [ 'facebook', 'x', 'whatsapp', 'email', 'reddit', 'copyLink' ];

const PLATFORM_LABELS = {
	facebook : 'Facebook',
	x        : 'X (Twitter)',
	whatsapp : 'WhatsApp',
	email    : 'Email',
	reddit   : 'Reddit',
	copyLink : 'Copy Link',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ICONS = {
	facebook: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
		</svg>
	),
	x: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	),
	whatsapp: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
		</svg>
	),
	email: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
			<polyline points="22,6 12,13 2,6" />
		</svg>
	),
	reddit: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" />
			<path d="M14.5 9A1.5 1.5 0 1 0 16 10.5 1.5 1.5 0 0 0 14.5 9zM9.5 9A1.5 1.5 0 1 0 11 10.5 1.5 1.5 0 0 0 9.5 9zM12 18a6 6 0 0 0 5-2.69A4 4 0 0 1 12 16a4 4 0 0 1-5-0.69A6 6 0 0 0 12 18z" />
			<circle cx="20" cy="9" r="2" />
		</svg>
	),
	copyLink: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
	),
};

// ─── Color resolver ───────────────────────────────────────────────────────────

function resolveColors( variant, platformColor ) {
	switch ( variant ) {
		case 'black':         return { bg: '#000000',     icon: '#ffffff', border: 'none' };
		case 'white':         return { bg: '#ffffff',     icon: '#000000', border: '1.5px solid #e0e0e0' };
		case 'outline-black': return { bg: 'transparent', icon: '#000000', border: '2px solid #000000' };
		case 'outline-white': return { bg: 'transparent', icon: '#ffffff', border: '2px solid #ffffff' };
		case 'outline':       return { bg: 'transparent', icon: platformColor, border: `2px solid ${ platformColor }` };
		default:              return { bg: platformColor, icon: '#ffffff', border: 'none' };
	}
}

// ─── Icon preview ─────────────────────────────────────────────────────────────

function SocialIconPreview( { platform, size, variant } ) {
	const { bg, icon, border } = resolveColors( variant, PLATFORM_COLORS[ platform ] );
	const isCircle  = variant !== 'square';
	const isStroke  = platform === 'email' || platform === 'copyLink';
	const innerSize = Math.round( size * 0.5 ) + 'px';

	return (
		<span style={ {
			display        : 'inline-flex',
			alignItems     : 'center',
			justifyContent : 'center',
			width          : size + 'px',
			height         : size + 'px',
			borderRadius   : isCircle ? '50%' : '6px',
			backgroundColor: bg,
			border,
			flexShrink     : 0,
			boxSizing      : 'border-box',
		} }>
			<span style={ {
				width      : innerSize,
				height     : innerSize,
				fill       : isStroke ? 'none' : icon,
				stroke     : isStroke ? icon   : 'none',
				strokeWidth: isStroke ? '2'    : undefined,
				display    : 'block',
			} }>
				{ ICONS[ platform ] }
			</span>
		</span>
	);
}

// ─── Canvas preview ───────────────────────────────────────────────────────────
//
// Uses getResponsiveValueWithFallback() so the editor canvas always renders a
// visible preview.  When the user switches to Tablet/Mobile and hasn't yet
// saved values for that breakpoint, the canvas falls back to the desktop value
// so the block doesn't appear broken.  Once the user changes a control, the
// saved value for that device takes over.

function PostsSocialSharePreview( { attributes, device } ) {
	const variant  = getResponsiveValueWithFallback( attributes, 'variant',    device ) ?? 'solid';
	const position = getResponsiveValueWithFallback( attributes, 'position',   device ) ?? 'start';
	const iconSize = getResponsiveValueWithFallback( attributes, 'iconSize',   device ) ?? 50;
	const iconGap  = getResponsiveValueWithFallback( attributes, 'iconGap',    device ) ?? 8;
	const padding  = getResponsiveValueWithFallback( attributes, 'boxPadding', device ) ?? 16;
	const margin   = getResponsiveValueWithFallback( attributes, 'boxMargin',  device ) ?? 0;

	const needsDarkBg = variant === 'outline-white' || variant === 'white';

	return (
		<div style={ {
			display        : 'flex',
			flexWrap       : 'wrap',
			gap            : Number( iconGap ) + 'px',
			justifyContent : position,
			padding        : Number( padding ) + 'px',
			margin         : Number( margin  ) + 'px',
			boxSizing      : 'border-box',
			background     : needsDarkBg
				? 'repeating-conic-gradient(#cccccc 0% 25%,#f5f5f5 0% 50%) 0 0/16px 16px'
				: undefined,
			borderRadius   : needsDarkBg ? '4px' : undefined,
		} }>
			{ PLATFORMS
				.filter( ( p ) => !! attributes[ p ] )
				.map( ( platform ) => (
					<SocialIconPreview
						key={ platform }
						platform={ platform }
						size={ Number( iconSize ) }
						variant={ variant }
					/>
				) )
			}
		</div>
	);
}

// ─── Device badge ─────────────────────────────────────────────────────────────

const DEVICE_ICONS = { desktop: '🖥', tablet: '📋', mobile: '📱' };

function DeviceBadge( { device } ) {
	return (
		<span style={ {
			display      : 'inline-flex',
			alignItems   : 'center',
			gap          : '3px',
			fontSize     : '11px',
			fontWeight   : '600',
			color        : '#1e1e1e',
			background   : '#f0f0f0',
			borderRadius : '3px',
			padding      : '1px 6px',
			marginLeft   : '4px',
			verticalAlign: 'middle',
		} }>
			{ DEVICE_ICONS[ device ] }
			{ '\u00a0' + device.charAt( 0 ).toUpperCase() + device.slice( 1 ) }
		</span>
	);
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

function Editor( { attributes, setAttributes } ) {

	// Single hook — reads the active device from BOTH the UPLIFTERS_SITE_BUILDER_BLOCKS floating toolbar
	// AND the Gutenberg editor store.  UPLIFTERS_SITE_BUILDER_BLOCKS localStorage wins when set.
	// Re-renders automatically whenever either source emits a change.
	const device = useGlobalResponsiveDevice();
	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );

	const toggleSettingsPanel = ( panel ) => {
		setOpenSettingsPanel( ( currentPanel ) =>
			currentPanel === panel ? null : panel
		);
	};

	const toggleStylesPanel = ( panel ) => {
		setOpenStylesPanel( ( currentPanel ) =>
			currentPanel === panel ? null : panel
		);
	};

	// ── Sidebar control values ─────────────────────────────────────────────────
	//
	// getResponsiveValue() (no cascade) returns exactly what is stored for the
	// active device — or null if nothing has been saved for this device yet.
	// We fall back to the desktop default only for the DISPLAYED value so the
	// control shows something useful.  onChange always writes to [device] key.

	const variantRaw    = getResponsiveValue( attributes, 'variant',    device );
	const positionRaw   = getResponsiveValue( attributes, 'position',   device );
	const iconSizeRaw   = getResponsiveValue( attributes, 'iconSize',   device );
	const iconGapRaw    = getResponsiveValue( attributes, 'iconGap',    device );
	const boxPaddingRaw = getResponsiveValue( attributes, 'boxPadding', device );
	const boxMarginRaw  = getResponsiveValue( attributes, 'boxMargin',  device );

	const variantVal    = variantRaw    ?? attributes.variant?.desktop    ?? 'solid';
	const positionVal   = positionRaw   ?? attributes.position?.desktop   ?? 'start';
	const iconSizeVal   = Number( iconSizeRaw   ?? attributes.iconSize?.desktop   ?? 50  );
	const iconGapVal    = Number( iconGapRaw    ?? attributes.iconGap?.desktop    ?? 8   );
	const boxPaddingVal = Number( boxPaddingRaw ?? attributes.boxPadding?.desktop ?? 16  );
	const boxMarginVal  = Number( boxMarginRaw  ?? attributes.boxMargin?.desktop  ?? 0   );

	const blockProps = useBlockProps();

	return (
		<Fragment>
			<InspectorControls group="settings">

				{ /* ── Global settings — same across all devices ── */ }
				<PanelBody
					title={ __( 'Behavior', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'behavior' }
					onToggle={ () => toggleSettingsPanel( 'behavior' ) }
				>
					<ToggleControl
						label={ __( 'Open in new tab', 'uplifters-site-builder-blocks' ) }
						checked={ !! attributes.openInNewTab }
						onChange={ ( v ) => setAttributes( { openInNewTab: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Platforms', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'platforms' }
					onToggle={ () => toggleSettingsPanel( 'platforms' ) }
				>
					{ PLATFORMS.map( ( p ) => (
						<ToggleControl
							key={ p }
							label={ PLATFORM_LABELS[ p ] }
							checked={ !! attributes[ p ] }
							onChange={ ( v ) => setAttributes( { [ p ]: v } ) }
						/>
					) ) }
				</PanelBody>

			</InspectorControls>

			<InspectorControls group="styles">
				{ /* ── Per-device settings — saved separately per breakpoint ── */ }
				<PanelBody
					title={ <>{ __( 'Layout', 'uplifters-site-builder-blocks' ) }<DeviceBadge device={ device } /></> }
					initialOpen={ false }
					opened={ openStylesPanel === 'layout' }
					onToggle={ () => toggleStylesPanel( 'layout' ) }
				>
					<p style={ { margin: '0 0 12px', fontSize: '11px', color: '#757575' } }>
						{ __( 'These settings are saved separately for each device.', 'uplifters-site-builder-blocks' ) }
					</p>

					<SelectControl
						label={ __( 'Icon Style', 'uplifters-site-builder-blocks' ) }
						value={ variantVal }
						options={ VARIANT_OPTIONS }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'variant', device, v )
						}
					/>

					<SelectControl
						label={ __( 'Alignment', 'uplifters-site-builder-blocks' ) }
						value={ positionVal }
						options={ [
							{ label: __( 'Left',   'uplifters-site-builder-blocks' ), value: 'start'  },
							{ label: __( 'Center', 'uplifters-site-builder-blocks' ), value: 'center' },
							{ label: __( 'Right',  'uplifters-site-builder-blocks' ), value: 'end'    },
						] }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'position', device, v )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ <>{ __( 'Spacing', 'uplifters-site-builder-blocks' ) }<DeviceBadge device={ device } /></> }
					initialOpen={ false }
					opened={ openStylesPanel === 'spacing' }
					onToggle={ () => toggleStylesPanel( 'spacing' ) }
				>
					<RangeControl
						label={ __( 'Icon Size (px)', 'uplifters-site-builder-blocks' ) }
						value={ iconSizeVal }
						min={ 24 } max={ 96 }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'iconSize', device, v )
						}
					/>

					<RangeControl
						label={ __( 'Icon gap (px)', 'uplifters-site-builder-blocks' ) }
						value={ iconGapVal }
						min={ 0 } max={ 40 }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'iconGap', device, v )
						}
					/>

					<RangeControl
						label={ __( 'Padding (px)', 'uplifters-site-builder-blocks' ) }
						value={ boxPaddingVal }
						min={ 0 } max={ 80 }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'boxPadding', device, v )
						}
					/>

					<RangeControl
						label={ __( 'Margin (px)', 'uplifters-site-builder-blocks' ) }
						value={ boxMarginVal }
						min={ 0 } max={ 80 }
						onChange={ ( v ) =>
							setResponsiveValue( attributes, setAttributes, 'boxMargin', device, v )
						}
					/>
				</PanelBody>

			</InspectorControls>

			{ /* Canvas preview — updates live when device switches (either toolbar) */ }
			<div { ...blockProps }>
				<PostsSocialSharePreview attributes={ attributes } device={ device } />
			</div>
		</Fragment>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-social-share" /> : <Editor {...props} />;
}

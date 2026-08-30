import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	InnerBlocks,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	ColorPalette,
	PanelBody,
	RangeControl,
	Button,
	Modal,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';

const DEVICES = [ 'desktop', 'tablet', 'mobile' ];
const RESPONSIVE_DEVICE_STORAGE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';

const RESPONSIVE_DEFAULTS = {
	padding: 0,
	margin: 0,
	backgroundColor: '',
	borderRadius: 0,
	shadow: 0,
};

const DEVICE_LABELS = {
	desktop: __( 'Desktop', 'uplifters-site-builder-blocks' ),
	tablet: __( 'Tablet', 'uplifters-site-builder-blocks' ),
	mobile: __( 'Mobile', 'uplifters-site-builder-blocks' ),
};

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

const FOOTER_TEMPLATE_OPTIONS = [
	{
		key: 'logo-page-grid-social-copyright',
		label: __( 'Logo Page Grid Social Copyright', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-page-grid-social-copyright',
		template: [
			[
				'uplifters-site-builder-blocks/footer-section',
				{
					className:
						'uplifters-site-builder-blocks-footer-layout__row uplifters-site-builder-blocks-footer-layout__row--logo-page-grid-social-copyright',
					layout: {
						type: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-footer-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/page-grid',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__page-grid',
						},
					],
					[
						'uplifters-site-builder-blocks/social-icon',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__social-icon',
						},
					],
					[
						'uplifters-site-builder-blocks/copyright-component-rearrange',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__copyright',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-social-page-grid-copyright',
		label: __( 'Logo Social Page Grid Copyright', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-social-page-grid-copyright',
		template: [
			[
				'uplifters-site-builder-blocks/footer-section',
				{
					className:
						'uplifters-site-builder-blocks-footer-layout__row uplifters-site-builder-blocks-footer-layout__row--logo-social-page-grid-copyright',
					layout: {
						type: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-footer-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/social-icon',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__social-icon',
						},
					],
					[
						'uplifters-site-builder-blocks/page-grid',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__page-grid',
						},
					],
					[
						'uplifters-site-builder-blocks/copyright-component-rearrange',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__copyright',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-social-copyright',
		label: __( 'Logo Social Copyright', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-social-copyright',
		template: [
			[
				'uplifters-site-builder-blocks/footer-section',
				{
					className:
						'uplifters-site-builder-blocks-footer-layout__row uplifters-site-builder-blocks-footer-layout__row--logo-social-copyright',
					layout: {
						type: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-footer-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/social-icon',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__social-icon',
						},
					],
					[
						'uplifters-site-builder-blocks/copyright-component-rearrange',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__copyright',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-social',
		label: __( 'Logo Social', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-social',
		template: [
			[
				'uplifters-site-builder-blocks/footer-section',
				{
					className:
						'uplifters-site-builder-blocks-footer-layout__row uplifters-site-builder-blocks-footer-layout__row--logo-social',
					layout: {
						type: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-footer-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/social-icon',
						{
							className: 'uplifters-site-builder-blocks-footer-layout__social-icon',
						},
					],
				],
			],
		],
	},
];

const topDotStyle = {
	width: '7px',
	height: '7px',
	display: 'block',
	borderRadius: '50%',
	background: '#b6b6b8',
};

const pageGridBlockStyle = {
	width: '54px',
	height: '34px',
	borderRadius: '8px',
	border: '1px solid #c4c9cf',
	background: '#ffffff',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	gap: '3px',
	padding: '6px',
	boxSizing: 'border-box',
	boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

const pageGridMarkStyle = {
	height: '4px',
	borderRadius: '999px',
	background: '#7d858d',
	display: 'block',
};

const socialIconBaseStyle = {
	width: '24px',
	height: '24px',
	borderRadius: '50%',
	background: '#1d2327',
	color: '#ffffff',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: '10px',
	fontWeight: 700,
	lineHeight: 1,
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
};

function DemoLogo() {
	return (
		<span
			aria-hidden="true"
			style={ {
				width: '34px',
				height: '34px',
				border: '2px solid #1d2327',
				borderRadius: '50%',
				background: '#fff',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxSizing: 'border-box',
				flex: '0 0 auto',
			} }
		>
			<span
				style={ {
					width: '13px',
					height: '13px',
					borderRadius: '4px',
					background: '#1d2327',
					display: 'block',
				} }
			/>
		</span>
	);
}

function DemoPageGridBlock( { firstWidth = '100%', secondWidth = '76%' } ) {
	return (
		<span style={ pageGridBlockStyle }>
			<span
				style={ {
					...pageGridMarkStyle,
					width: firstWidth,
				} }
			/>
			<span
				style={ {
					...pageGridMarkStyle,
					width: secondWidth,
					background: '#a5abb1',
				} }
			/>
			<span
				style={ {
					...pageGridMarkStyle,
					width: '54%',
					background: '#c0c5ca',
				} }
			/>
		</span>
	);
}

function DemoPageGrid() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 54px)',
				gap: '8px',
				flex: '0 0 auto',
				width: '116px',
			} }
		>
			<DemoPageGridBlock firstWidth="94%" secondWidth="70%" />
			<DemoPageGridBlock firstWidth="82%" secondWidth="64%" />
			<DemoPageGridBlock firstWidth="88%" secondWidth="74%" />
			<DemoPageGridBlock firstWidth="76%" secondWidth="58%" />
		</span>
	);
}

function DemoSocialIcon( { children, shape = 'circle' } ) {
	return (
		<span
			style={ {
				...socialIconBaseStyle,
				borderRadius: shape === 'rounded' ? '7px' : '50%',
			} }
		>
			{ children }
		</span>
	);
}

function DemoSocialIconGroup() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '7px',
				flex: '0 0 auto',
				padding: '4px 6px',
				borderRadius: '999px',
				background: '#f0f2f4',
				border: '1px solid #d7dce1',
				boxSizing: 'border-box',
			} }
		>
			<DemoSocialIcon>f</DemoSocialIcon>
			<DemoSocialIcon>𝕏</DemoSocialIcon>
			<DemoSocialIcon shape="rounded">in</DemoSocialIcon>
			<DemoSocialIcon>▶</DemoSocialIcon>
		</span>
	);
}

function DemoCopyright() {
	return (
		<span
			aria-hidden="true"
			style={ {
				width: '128px',
				height: '8px',
				borderRadius: '999px',
				background: '#b6b6b8',
				display: 'inline-flex',
				flex: '0 1 auto',
			} }
		/>
	);
}

function FooterLayoutDemoCard( { option, onChoose } ) {
	const hasLogo = [
		'logo-page-grid-social-copyright',
		'logo-social-page-grid-copyright',
		'logo-social-copyright',
		'logo-social',
	].includes( option.demoType );

	const hasPageGrid = [
		'logo-page-grid-social-copyright',
		'logo-social-page-grid-copyright',
	].includes( option.demoType );

	const hasSocialIcon = [
		'logo-page-grid-social-copyright',
		'logo-social-page-grid-copyright',
		'logo-social-copyright',
		'logo-social',
	].includes( option.demoType );

	const hasCopyright = [
		'logo-page-grid-social-copyright',
		'logo-social-page-grid-copyright',
		'logo-social-copyright',
	].includes( option.demoType );

	const isSocialSecond = [
		'logo-social-page-grid-copyright',
		'logo-social-copyright',
		'logo-social',
	].includes( option.demoType );

	return (
		<button
			type="button"
			onClick={ () => onChoose( option ) }
			aria-label={ option.label }
			style={ {
				display: 'block',
				width: '100%',
				height: '150px',
				padding: 0,
				margin: 0,
				border: '1px solid #d9d9d9',
				borderRadius: '12px',
				background: '#ffffff',
				cursor: 'pointer',
				boxSizing: 'border-box',
				overflow: 'hidden',
				boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
				textAlign: 'left',
			} }
			onMouseEnter={ ( event ) => {
				event.currentTarget.style.borderColor = '#007cba';
				event.currentTarget.style.boxShadow =
					'0 0 0 1px #007cba, 0 8px 20px rgba(0,0,0,0.10)';
			} }
			onMouseLeave={ ( event ) => {
				event.currentTarget.style.borderColor = '#d9d9d9';
				event.currentTarget.style.boxShadow =
					'0 1px 1px rgba(0,0,0,0.04)';
			} }
		>
			<div
				style={ {
					height: '28px',
					display: 'flex',
					alignItems: 'center',
					gap: '4px',
					padding: '0 12px',
					background: '#eeeeef',
					borderBottom: '1px solid #d8d8d8',
					boxSizing: 'border-box',
				} }
			>
				<span style={ topDotStyle } />
				<span style={ topDotStyle } />
				<span style={ topDotStyle } />
			</div>

			<div
				style={ {
					height: '122px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '18px',
					padding: '0 24px',
					background:
						'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)',
					boxSizing: 'border-box',
				} }
			>
				{ hasLogo && <DemoLogo /> }

				{ hasSocialIcon && isSocialSecond && <DemoSocialIconGroup /> }

				{ hasPageGrid && <DemoPageGrid /> }

				{ hasSocialIcon && ! isSocialSecond && <DemoSocialIconGroup /> }

				{ hasCopyright && <DemoCopyright /> }
			</div>
		</button>
	);
}

function Editor( {
	attributes,
	setAttributes,
	clientId,
	isSelected,
} ) {
	const {
		footerTemplate = '',
		padding,
		margin,
		backgroundColor,
		borderRadius,
		shadow,
	} = attributes;

	const device = useGlobalResponsiveDevice();
	const deviceLabel = DEVICE_LABELS[ device ] || DEVICE_LABELS.desktop;

	const activePadding = getResponsiveValue(
		padding,
		device,
		RESPONSIVE_DEFAULTS.padding
	);

	const activeMargin = getResponsiveValue(
		margin,
		device,
		RESPONSIVE_DEFAULTS.margin
	);

	const activeBackgroundColor = getResponsiveValue(
		backgroundColor,
		device,
		RESPONSIVE_DEFAULTS.backgroundColor
	);

	const activeBorderRadius = getResponsiveValue(
		borderRadius,
		device,
		RESPONSIVE_DEFAULTS.borderRadius
	);

	const activeShadow = getResponsiveValue(
		shadow,
		device,
		RESPONSIVE_DEFAULTS.shadow
	);

	const setResponsiveAttribute = ( attributeName, value ) => {
		const fallback = RESPONSIVE_DEFAULTS[ attributeName ];
		const current = getResponsiveObject(
			attributes[ attributeName ],
			fallback
		);

		setAttributes( {
			[ attributeName ]: {
				...current,
				[ device ]:
					value !== undefined && value !== null ? value : fallback,
			},
		} );
	};

	const [ isChooserOpen, setIsChooserOpen ] = useState( false );
	const hasOpenedInitialChooser = useRef( false );

	const [ openSettingsPanel, setOpenSettingsPanel ] = useState( null );
	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleSettingsPanel = ( key ) => setOpenSettingsPanel( ( current ) => ( current === key ? null : key ) );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	const { replaceInnerBlocks, selectBlock } = useDispatch(
		'core/block-editor'
	);

	const innerBlockCount = useSelect(
		( select ) => {
			const block = select( 'core/block-editor' ).getBlock( clientId );
			return block?.innerBlocks?.length || 0;
		},
		[ clientId ]
	);

	useEffect( () => {
		if (
			isSelected &&
			! hasOpenedInitialChooser.current &&
			! footerTemplate &&
			innerBlockCount === 0
		) {
			hasOpenedInitialChooser.current = true;
			setIsChooserOpen( true );
		}
	}, [ isSelected, footerTemplate, innerBlockCount ] );

	const wrapperWidth =
		activeMargin > 0 ? `calc(100% - ${ activeMargin * 2 }px)` : '100%';

	const chooseTemplate = ( option ) => {
		const blocks = createBlocksFromInnerBlocksTemplate( option.template );

		replaceInnerBlocks( clientId, blocks, false );

		setAttributes( {
			footerTemplate: option.key,
		} );

		setIsChooserOpen( false );
		selectBlock( clientId );
	};

	const blockProps = useBlockProps( {
		className: [
			'uplifters-site-builder-blocks-footer-layout',
			'uplifters-site-builder-blocks-footer-layout-editor',
			`is-uplifters-site-builder-blocks-device-${ device }`,
		].join( ' ' ),
		'data-uplifters-site-builder-blocks-device': device,
		style: {
			width: wrapperWidth,
			maxWidth: wrapperWidth,
			minWidth: '0',

			padding: `${ activePadding }px`,
			margin: `${ activeMargin }px`,
			backgroundColor: activeBackgroundColor || undefined,
			borderRadius: `${ activeBorderRadius }px`,
			boxShadow: activeShadow
				? `0 ${ activeShadow }px ${ activeShadow * 3 }px rgba(0,0,0,0.18)`
				: 'none',

			boxSizing: 'border-box',
			overflow: 'visible',
			position: 'relative',

			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-start',

			'--wp--style--block-gap': '0px',
		},
	} );

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={ __( 'Structure', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'structure' }
					onToggle={ () => toggleSettingsPanel( 'structure' ) }
				>
					<Button
						variant="secondary"
						onClick={ () => setIsChooserOpen( true ) }
					>
						{ innerBlockCount > 0
							? __( 'Change Footer Layout', 'uplifters-site-builder-blocks' )
							: __( 'Choose Footer Layout', 'uplifters-site-builder-blocks' ) }
					</Button>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf( __( '%s Spacing', 'uplifters-site-builder-blocks' ), deviceLabel ) }
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
						onChange={ ( value ) =>
							setResponsiveAttribute( 'padding', value || 0 )
						}
						min={ 0 }
						max={ 200 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Margin', 'uplifters-site-builder-blocks' ) }
						value={ activeMargin }
						onChange={ ( value ) =>
							setResponsiveAttribute( 'margin', value || 0 )
						}
						min={ 0 }
						max={ 200 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Border Radius', 'uplifters-site-builder-blocks' ) }
						value={ activeBorderRadius }
						onChange={ ( value ) =>
							setResponsiveAttribute( 'borderRadius', value || 0 )
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={ __( 'Background Shadow', 'uplifters-site-builder-blocks' ) }
						value={ activeShadow }
						onChange={ ( value ) =>
							setResponsiveAttribute( 'shadow', value || 0 )
						}
						min={ 0 }
						max={ 60 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody
					title={ sprintf( __( '%s Colors', 'uplifters-site-builder-blocks' ), deviceLabel ) }
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

			{ isChooserOpen && (
				<Modal
					title={ __( 'Choose a Footer Layout', 'uplifters-site-builder-blocks' ) }
					onRequestClose={ () => setIsChooserOpen( false ) }
					size="fill"
				>
					<div
						style={ {
							width: '90vw',
							maxWidth: '1400px',
							height: '82vh',
							maxHeight: '82vh',
							boxSizing: 'border-box',
							padding: '28px',
							overflow: 'hidden',
						} }
					>
						<div
							style={ {
								display: 'grid',
								gridTemplateColumns:
									'repeat(2, minmax(0, 1fr))',
								gridTemplateRows: 'repeat(2, minmax(180px, 1fr))',
								columnGap: '36px',
								rowGap: '36px',
								width: '100%',
								height: '100%',
								boxSizing: 'border-box',
							} }
						>
							{ FOOTER_TEMPLATE_OPTIONS.map( ( option ) => (
								<div
									key={ option.key }
									style={ {
										width: '100%',
										height: '100%',
										boxSizing: 'border-box',
									} }
								>
									<FooterLayoutDemoCard
										option={ option }
										onChoose={ chooseTemplate }
									/>
								</div>
							) ) }
						</div>
					</div>
				</Modal>
			) }

			<div { ...blockProps }>
				{ innerBlockCount === 0 && (
					<div className="uplifters-site-builder-blocks-footer-layout-empty-state">
						<Button
							variant="primary"
							onClick={ () => setIsChooserOpen( true ) }
						>
							{ __( 'Choose Footer Layout', 'uplifters-site-builder-blocks' ) }
						</Button>
					</div>
				) }

				<InnerBlocks
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="footer-layout" /> : <Editor { ...props } />;
}
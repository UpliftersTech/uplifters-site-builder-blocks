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
	ToggleControl,
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

const HEADER_TEMPLATE_OPTIONS = [
	{
		key: 'logo-nav-search-button',
		label: __( 'Logo Nav Search Button', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-nav-search-button',
		template: [
			[
				'uplifters-site-builder-blocks/header-section',
				{
					className:
						'uplifters-site-builder-blocks-header-layout__row uplifters-site-builder-blocks-header-layout__row--logo-nav-search-button',
					layout: {
						type: 'flex',
						flexWrap: 'nowrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-header-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/page-nav',
						{
							className: 'uplifters-site-builder-blocks-header-layout__page-nav',
						},
					],
					[
						'uplifters-site-builder-blocks/search-live',
						{
							className: 'uplifters-site-builder-blocks-header-layout__search-live',
						},
					],
					[
						'uplifters-site-builder-blocks/button-single',
						{
							text: __( 'Button', 'uplifters-site-builder-blocks' ),
							className: 'uplifters-site-builder-blocks-header-layout__button',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-search-nav-button',
		label: __( 'Logo Search Nav Button', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-search-nav-button',
		template: [
			[
				'uplifters-site-builder-blocks/header-section',
				{
					className:
						'uplifters-site-builder-blocks-header-layout__row uplifters-site-builder-blocks-header-layout__row--logo-search-nav-button',
					layout: {
						type: 'flex',
						flexWrap: 'nowrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-header-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/search-live',
						{
							className: 'uplifters-site-builder-blocks-header-layout__search-live',
						},
					],
					[
						'uplifters-site-builder-blocks/page-nav',
						{
							className: 'uplifters-site-builder-blocks-header-layout__page-nav',
						},
					],
					[
						'uplifters-site-builder-blocks/button-single',
						{
							text: __( 'Button', 'uplifters-site-builder-blocks' ),
							className: 'uplifters-site-builder-blocks-header-layout__button',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-search-nav',
		label: __( 'Logo Search Nav', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-search-nav',
		template: [
			[
				'uplifters-site-builder-blocks/header-section',
				{
					className:
						'uplifters-site-builder-blocks-header-layout__row uplifters-site-builder-blocks-header-layout__row--logo-search-nav',
					layout: {
						type: 'flex',
						flexWrap: 'nowrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-header-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/search-live',
						{
							className: 'uplifters-site-builder-blocks-header-layout__search-live',
						},
					],
					[
						'uplifters-site-builder-blocks/page-nav',
						{
							className: 'uplifters-site-builder-blocks-header-layout__page-nav',
						},
					],
				],
			],
		],
	},
	{
		key: 'logo-nav',
		label: __( 'Logo Nav', 'uplifters-site-builder-blocks' ),
		demoType: 'logo-nav',
		template: [
			[
				'uplifters-site-builder-blocks/header-section',
				{
					className:
						'uplifters-site-builder-blocks-header-layout__row uplifters-site-builder-blocks-header-layout__row--logo-nav',
					layout: {
						type: 'flex',
						flexWrap: 'nowrap',
						justifyContent: 'space-between',
						verticalAlignment: 'center',
					},
				},
				[
					[
						'uplifters-site-builder-blocks/site-logo',
						{
							width: 64,
							className: 'uplifters-site-builder-blocks-header-layout__site-logo',
						},
					],
					[
						'uplifters-site-builder-blocks/page-nav',
						{
							className: 'uplifters-site-builder-blocks-header-layout__page-nav',
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

const navDotStyle = {
	width: '29px',
	height: '7px',
	borderRadius: '999px',
	background: '#929599',
	display: 'block',
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

function DemoNav() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '7px',
				flex: '0 1 auto',
			} }
		>
			<span style={ navDotStyle } />
			<span style={ navDotStyle } />
			<span style={ navDotStyle } />
		</span>
	);
}

function DemoSearch() {
	return (
		<span
			aria-hidden="true"
			style={ {
				width: '32px',
				height: '32px',
				border: '2px solid #8c8f94',
				borderRadius: '50%',
				position: 'relative',
				background: '#fff',
				display: 'inline-flex',
				flex: '0 0 auto',
				boxSizing: 'border-box',
			} }
		>
			<span
				style={ {
					width: '12px',
					height: '2px',
					borderRadius: '999px',
					background: '#8c8f94',
					display: 'block',
					position: 'absolute',
					right: '-8px',
					bottom: '4px',
					transform: 'rotate(45deg)',
				} }
			/>
		</span>
	);
}

function DemoButton() {
	return (
		<span
			aria-hidden="true"
			style={ {
				width: '52px',
				height: '26px',
				borderRadius: '999px',
				background: '#1d2327',
				display: 'inline-flex',
				flex: '0 0 auto',
			} }
		/>
	);
}

function HeaderLayoutDemoCard( { option, onChoose } ) {
	const hasSearch = [
		'logo-nav-search-button',
		'logo-search-nav-button',
		'logo-search-nav',
	].includes( option.demoType );

	const hasButton = [
		'logo-nav-search-button',
		'logo-search-nav-button',
	].includes( option.demoType );

	const isSearchSecond = [
		'logo-search-nav-button',
		'logo-search-nav',
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
					gap: '13px',
					padding: '0 24px',
					background:
						'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)',
					boxSizing: 'border-box',
				} }
			>
				<DemoLogo />

				{ hasSearch && isSearchSecond && <DemoSearch /> }

				<DemoNav />

				{ hasSearch && ! isSearchSecond && <DemoSearch /> }

				{ hasButton && <DemoButton /> }
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
		headerTemplate = '',
		padding,
		margin,
		backgroundColor,
		borderRadius,
		shadow,
		stickyTop = false,
		stickyBottom = false,
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
			! headerTemplate &&
			innerBlockCount === 0
		) {
			hasOpenedInitialChooser.current = true;
			setIsChooserOpen( true );
		}
	}, [ isSelected, headerTemplate, innerBlockCount ] );

	const isSticky = stickyTop || stickyBottom;

	const wrapperWidth =
		activeMargin > 0 ? `calc(100% - ${ activeMargin * 2 }px)` : '100%';

	const stickyClass = isSticky
		? stickyTop
			? 'is-uplifters-site-builder-blocks-sticky-top'
			: 'is-uplifters-site-builder-blocks-sticky-bottom'
		: 'is-uplifters-site-builder-blocks-not-sticky';

	const chooseTemplate = ( option ) => {
		const blocks = createBlocksFromInnerBlocksTemplate( option.template );

		replaceInnerBlocks( clientId, blocks, false );

		setAttributes( {
			headerTemplate: option.key,
		} );

		setIsChooserOpen( false );
		selectBlock( clientId );
	};

	const blockProps = useBlockProps( {
		className: [
			'uplifters-site-builder-blocks-header-layout',
			'uplifters-site-builder-blocks-header-layout-editor',
			`is-uplifters-site-builder-blocks-device-${ device }`,
			stickyClass,
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
			position: isSticky ? 'sticky' : 'relative',
			top: stickyTop ? '0px' : undefined,
			bottom: stickyBottom ? '0px' : undefined,
			zIndex: isSticky ? 9999 : undefined,

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
							? __( 'Change Header Layout', 'uplifters-site-builder-blocks' )
							: __( 'Choose Header Layout', 'uplifters-site-builder-blocks' ) }
					</Button>
				</PanelBody>

				<PanelBody
					title={ __( 'Behavior', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
					opened={ openSettingsPanel === 'behavior' }
					onToggle={ () => toggleSettingsPanel( 'behavior' ) }
				>
					<ToggleControl
						label={ __( 'Top', 'uplifters-site-builder-blocks' ) }
						checked={ !! stickyTop }
						onChange={ ( value ) =>
							setAttributes( {
								stickyTop: value,
								stickyBottom: value ? false : stickyBottom,
							} )
						}
						__nextHasNoMarginBottom
					/>

					<ToggleControl
						label={ __( 'Bottom', 'uplifters-site-builder-blocks' ) }
						checked={ !! stickyBottom }
						onChange={ ( value ) =>
							setAttributes( {
								stickyBottom: value,
								stickyTop: value ? false : stickyTop,
							} )
						}
						__nextHasNoMarginBottom
					/>
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
					title={ __( 'Choose a Header Layout', 'uplifters-site-builder-blocks' ) }
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
							{ HEADER_TEMPLATE_OPTIONS.map( ( option ) => (
								<div
									key={ option.key }
									style={ {
										width: '100%',
										height: '100%',
										boxSizing: 'border-box',
									} }
								>
									<HeaderLayoutDemoCard
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
					<div className="uplifters-site-builder-blocks-header-layout-empty-state">
						<Button
							variant="primary"
							onClick={ () => setIsChooserOpen( true ) }
						>
							{ __( 'Choose Header Layout', 'uplifters-site-builder-blocks' ) }
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
	return props.attributes.preview ? <InserterPreview type="header-layout" /> : <Editor { ...props } />;
}
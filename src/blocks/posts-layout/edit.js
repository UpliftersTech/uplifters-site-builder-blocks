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

const POSTS_TEMPLATE_OPTIONS = [
	{
		key: 'full-post-layout',
		label: __( 'Full Post Layout', 'uplifters-site-builder-blocks' ),
		demoType: 'full-post-layout',
		template: [
			[
				'uplifters-site-builder-blocks/posts-section',
				{
					className:
						'uplifters-site-builder-blocks-posts-layout__section uplifters-site-builder-blocks-posts-layout__section--full-post-layout',
				},
				[
					[ 'uplifters-site-builder-blocks/posts-title', {} ],
					[ 'uplifters-site-builder-blocks/posts-metadata', {} ],
					[ 'uplifters-site-builder-blocks/posts-social-share', {} ],
					[ 'uplifters-site-builder-blocks/posts-featured-image', {} ],
					[ 'uplifters-site-builder-blocks/heading-advance', {} ],
					[ 'uplifters-site-builder-blocks/posts-previous-next', {} ],
					[ 'uplifters-site-builder-blocks/posts-related', {} ],
					[ 'uplifters-site-builder-blocks/posts-comment-form', {} ],
					[ 'uplifters-site-builder-blocks/posts-comment-list', {} ],
				],
			],
		],
	},
	{
		key: 'blank',
		label: __( 'Blank', 'uplifters-site-builder-blocks' ),
		demoType: 'blank',
		template: [
			[
				'uplifters-site-builder-blocks/posts-section',
				{
					className:
						'uplifters-site-builder-blocks-posts-layout__section uplifters-site-builder-blocks-posts-layout__section--blank',
				},
				[],
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

function DemoImage( { height = 56 } ) {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'block',
				width: '100%',
				height: `${ height }px`,
				borderRadius: '8px',
				background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
				boxSizing: 'border-box',
			} }
		/>
	);
}

function DemoTitleBar( { width = '78%' } ) {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'block',
				width,
				height: '11px',
				borderRadius: '999px',
				background: '#1d2327',
			} }
		/>
	);
}

function DemoMetaLine() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'block',
				width: '48%',
				height: '6px',
				borderRadius: '999px',
				background: '#a5abb1',
			} }
		/>
	);
}

function DemoParagraphLines( { count = 2 } ) {
	const widths = [ '100%', '92%', '64%' ].slice( 0, count );

	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: '5px',
				width: '100%',
			} }
		>
			{ widths.map( ( width, index ) => (
				<span
					key={ index }
					style={ {
						display: 'block',
						width,
						height: '5px',
						borderRadius: '999px',
						background: '#c0c5ca',
					} }
				/>
			) ) }
		</span>
	);
}

function DemoSocialRow() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'flex',
				alignItems: 'center',
				gap: '6px',
			} }
		>
			{ [ 'f', '𝕏', 'in' ].map( ( label ) => (
				<span
					key={ label }
					style={ {
						width: '18px',
						height: '18px',
						borderRadius: '50%',
						background: '#1d2327',
						color: '#fff',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '8px',
						fontWeight: 700,
					} }
				>
					{ label }
				</span>
			) ) }
		</span>
	);
}

function DemoCommentBubbles() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: '4px',
				width: '100%',
			} }
		>
			<span
				style={ {
					display: 'block',
					width: '100%',
					height: '16px',
					borderRadius: '8px',
					border: '1px solid #d7dce1',
					background: '#f8fafc',
				} }
			/>
			<span
				style={ {
					display: 'block',
					width: '70%',
					height: '10px',
					borderRadius: '6px',
					background: '#eef2f6',
				} }
			/>
		</span>
	);
}

function DemoNavRow() {
	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				width: '100%',
			} }
		>
			<span
				style={ {
					padding: '4px 10px',
					borderRadius: '999px',
					border: '1px solid #d1d5db',
					fontSize: '9px',
					color: '#475569',
				} }
			>
				&#8592; Prev
			</span>
			<span
				style={ {
					padding: '4px 10px',
					borderRadius: '999px',
					border: '1px solid #d1d5db',
					fontSize: '9px',
					color: '#475569',
				} }
			>
				Next &#8594;
			</span>
		</span>
	);
}

function PostsLayoutDemoCard( { option, onChoose } ) {
	const { demoType } = option;

	return (
		<button
			type="button"
			onClick={ () => onChoose( option ) }
			aria-label={ option.label }
			style={ {
				display: 'block',
				width: '100%',
				height: '100%',
				minHeight: '190px',
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
					display: 'flex',
					flexDirection: 'column',
					gap: '10px',
					padding: '16px',
					background:
						'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)',
					boxSizing: 'border-box',
				} }
			>
				{ demoType === 'full-post-layout' && (
					<>
						<DemoTitleBar width="82%" />
						<DemoMetaLine />
						<DemoSocialRow />
						<DemoImage height={ 54 } />
						<DemoParagraphLines count={ 2 } />
						<DemoNavRow />
						<DemoCommentBubbles />
					</>
				) }

				{ demoType === 'blank' && (
					<span
						aria-hidden="true"
						style={ {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							minHeight: '110px',
							border: '1px dashed #c4c9cf',
							borderRadius: '8px',
							color: '#8c8f94',
							fontSize: '12px',
						} }
					>
						{ __( 'Empty Posts Section', 'uplifters-site-builder-blocks' ) }
					</span>
				) }
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
		postsTemplate = '',
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
			! postsTemplate &&
			innerBlockCount === 0
		) {
			hasOpenedInitialChooser.current = true;
			setIsChooserOpen( true );
		}
	}, [ isSelected, postsTemplate, innerBlockCount ] );

	const wrapperWidth =
		activeMargin > 0 ? `calc(100% - ${ activeMargin * 2 }px)` : '100%';

	const chooseTemplate = ( option ) => {
		const blocks = createBlocksFromInnerBlocksTemplate( option.template );

		replaceInnerBlocks( clientId, blocks, false );

		setAttributes( {
			postsTemplate: option.key,
		} );

		setIsChooserOpen( false );
		selectBlock( clientId );
	};

	const blockProps = useBlockProps( {
		className: [
			'uplifters-site-builder-blocks-posts-layout',
			'uplifters-site-builder-blocks-posts-layout-editor',
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
							? __( 'Change Post Layout', 'uplifters-site-builder-blocks' )
							: __( 'Choose a Post Layout', 'uplifters-site-builder-blocks' ) }
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
					title={ __( 'Choose a Post Layout', 'uplifters-site-builder-blocks' ) }
					onRequestClose={ () => setIsChooserOpen( false ) }
					size="fill"
				>
					<div
						style={ {
							width: '90vw',
							maxWidth: '900px',
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
								gridTemplateRows: 'minmax(220px, 1fr)',
								columnGap: '36px',
								width: '100%',
								boxSizing: 'border-box',
							} }
						>
							{ POSTS_TEMPLATE_OPTIONS.map( ( option ) => (
								<div
									key={ option.key }
									style={ {
										width: '100%',
										height: '100%',
										boxSizing: 'border-box',
									} }
								>
									<PostsLayoutDemoCard
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
					<div className="uplifters-site-builder-blocks-posts-layout-empty-state">
						<Button
							variant="primary"
							onClick={ () => setIsChooserOpen( true ) }
						>
							{ __( 'Choose a Post Layout', 'uplifters-site-builder-blocks' ) }
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
	return props.attributes.preview ? <InserterPreview type="posts-layout" /> : <Editor { ...props } />;
}

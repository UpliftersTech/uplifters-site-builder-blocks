import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview-register';
import ResponsiveOrderControl, {
	EDITOR_CHROME_ORDER,
	getDocumentMove,
	getNaturalOrder,
	getSlotOrder,
	remapSequence,
	resolveOrder,
	useChildOrder,
	withSlotMoved,
} from '../../blocks-section-responsive-order/responsive-order';
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	Inserter,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	ColorPalette,
	PanelBody,
	RangeControl,
	Button,
	Tooltip,
} from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';
import {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

const DEVICES = [ 'desktop', 'tablet', 'mobile' ];
const RESPONSIVE_DEVICE_STORAGE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';

const RESPONSIVE_DEFAULTS = {
	padding: 0,
	margin: 0,
	gap: 18,
	backgroundColor: '',
	borderRadius: 0,
	shadow: 0,
};

const DEVICE_LABELS = {
	desktop: __( 'Desktop', 'uplifters-site-builder-blocks' ),
	tablet: __( 'Tablet', 'uplifters-site-builder-blocks' ),
	mobile: __( 'Mobile', 'uplifters-site-builder-blocks' ),
};

/**
 * The rows a Posts Layout starts with. They are a starting point, not a
 * restriction: any of them can be deleted and any other block can be added as
 * a row. The template is re-applied only when the layout is completely empty.
 */
const POSTS_LAYOUT_TEMPLATE = [
	[ 'uplifters-site-builder-blocks/posts-title', {} ],
	[ 'uplifters-site-builder-blocks/posts-metadata', {} ],
	[ 'uplifters-site-builder-blocks/posts-social-share', {} ],
	[ 'uplifters-site-builder-blocks/posts-featured-image', {} ],
	[ 'uplifters-site-builder-blocks/paragraph-advance', {} ],
	[ 'uplifters-site-builder-blocks/social-icon', {} ],
	[ 'uplifters-site-builder-blocks/posts-previous-next', {} ],
	[ 'uplifters-site-builder-blocks/posts-related', {} ],
	[ 'uplifters-site-builder-blocks/posts-comment-form', {} ],
	[ 'uplifters-site-builder-blocks/posts-comment-list', {} ],
];

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

/*
 * Measures the vertical centre of every row so the delete controls layer can
 * park one button beside each row. The layer is a child of the rows' container,
 * so its parent is the offset parent every row is measured against.
 *
 * `orderKey` changes whenever the active device's row order changes. Reordering
 * moves the rows without resizing anything, so the ResizeObserver below never
 * fires for it and the measurement has to be re-run from the dependency list.
 */
const useRowCentres = ( overlayRef, rowClientIds, orderKey ) => {
	const [ centres, setCentres ] = useState( [] );

	useLayoutEffect( () => {
		const overlay = overlayRef.current;
		const container = overlay?.parentElement;

		if ( ! container ) {
			setCentres( [] );
			return undefined;
		}

		const measure = () => {
			setCentres(
				rowClientIds
					.map( ( rowClientId ) => {
						const row = container.querySelector(
							`[data-block="${ rowClientId }"]`
						);

						if ( ! row ) {
							return null;
						}

						return {
							clientId: rowClientId,
							centre: row.offsetTop + row.offsetHeight / 2,
						};
					} )
					.filter( Boolean )
			);
		};

		measure();

		const view = container.ownerDocument.defaultView;

		if ( ! view || ! view.ResizeObserver ) {
			return undefined;
		}

		// A row grows as it is edited, so the buttons follow the rendered
		// heights rather than a single measurement taken on mount.
		const observer = new view.ResizeObserver( measure );

		observer.observe( container );

		Array.from( container.children ).forEach( ( child ) => {
			if ( child !== overlay ) {
				observer.observe( child );
			}
		} );

		return () => observer.disconnect();
	}, [ overlayRef, rowClientIds, orderKey ] );

	return centres;
};

function Editor( { attributes, setAttributes, clientId } ) {
	const {
		padding,
		margin,
		gap,
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

	const activeGap = getResponsiveValue(
		gap,
		device,
		RESPONSIVE_DEFAULTS.gap
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

	const [ openStylesPanel, setOpenStylesPanel ] = useState( null );
	const toggleStylesPanel = ( key ) => setOpenStylesPanel( ( current ) => ( current === key ? null : key ) );

	const {
		removeBlock,
		moveBlocksToPosition,
		__unstableMarkNextChangeAsNotPersistent,
	} = useDispatch( 'core/block-editor' );

	// Every inner block is one row of the post template.
	const rowClientIds = useSelect(
		( select ) => select( 'core/block-editor' ).getBlockOrder( clientId ),
		[ clientId ]
	);

	const innerBlockCount = rowClientIds.length;

	/*
	 * Row labels for the reorder control. Joined into one string so the mapped
	 * value compares by value: an array would be a new reference on every store
	 * change and re-render the block each time.
	 */
	const rowLabelKey = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( 'core/block-editor' );
			const { getBlockType } = select( 'core/blocks' );

			return getBlockOrder( clientId )
				.map(
					( rowClientId ) =>
						getBlockType( getBlockName( rowClientId ) )?.title || ''
				)
				.join( '\n' );
		},
		[ clientId ]
	);

	const rowLabels = useMemo(
		() => ( rowLabelKey === '' ? [] : rowLabelKey.split( '\n' ) ),
		[ rowLabelKey ]
	);

	const rowControlsRef = useRef( null );

	/**
	 * Empty rows waiting to be filled. They are editor-only placeholders, not
	 * blocks, so an unused one never reaches the saved content.
	 */
	const [ emptyRows, setEmptyRows ] = useState( 0 );
	const filledRowCount = useRef( innerBlockCount );

	useEffect( () => {
		const added = innerBlockCount - filledRowCount.current;

		filledRowCount.current = innerBlockCount;

		if ( innerBlockCount === 0 ) {
			// A layout with nothing in it always offers one empty row.
			setEmptyRows( ( count ) => ( count === 0 ? 1 : count ) );
			return;
		}

		if ( added > 0 ) {
			// Each block that lands in the layout consumes one empty row.
			setEmptyRows( ( count ) => Math.max( 0, count - added ) );
		}
	}, [ innerBlockCount ] );

	/*
	 * Row order for the active device. Every row is one slot, filled rows first
	 * and the empty placeholders after them, so a slot the visitor will never
	 * see keeps a position in the editor all the same.
	 */
	const slotCount = innerBlockCount + emptyRows;

	const orderObject = useMemo(
		() => resolveOrder( attributes.childOrder, slotCount ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( attributes.childOrder ), slotCount ]
	);

	const orderSequence = orderObject[ device ];

	/*
	 * Desktop is the document order itself, so a desktop reorder moves the real
	 * blocks and leaves childOrder.desktop natural. Only the narrower devices
	 * keep a saved order of their own.
	 */
	const setOrderForDevice = ( nextSequence ) => {
		if ( 'desktop' !== device ) {
			setAttributes( {
				childOrder: { ...orderObject, [ device ]: nextSequence },
			} );

			return;
		}

		const move = getDocumentMove(
			getNaturalOrder( nextSequence.length ),
			nextSequence
		);

		// An empty row is a placeholder, not a block, so it cannot be moved in
		// the document; only the filled rows have something to reorder.
		if (
			! move ||
			! rowClientIds[ move.from ] ||
			move.to >= rowClientIds.length
		) {
			return;
		}

		moveBlocksToPosition(
			[ rowClientIds[ move.from ] ],
			clientId,
			clientId,
			move.to
		);
	};

	/*
	 * A move in the canvas — Gutenberg's own arrows or drag-and-drop — arrives
	 * here as a changed block list, with nothing to say which device the person
	 * was looking at. On desktop the move is the point, so it stands and the
	 * other devices are renumbered to keep showing what they showed. On tablet
	 * and mobile the document order has to stay put, so the move is undone and
	 * recorded as that device's own order instead.
	 */
	const documentOrderRef = useRef( null );

	useEffect( () => {
		const currentIds = rowClientIds;
		const previousIds = documentOrderRef.current;

		documentOrderRef.current = currentIds;

		// First run, or a row was added or removed rather than moved.
		if ( ! previousIds || previousIds.length !== currentIds.length ) {
			return;
		}

		const move = getDocumentMove( previousIds, currentIds );

		if ( ! move ) {
			return;
		}

		if ( 'desktop' === device ) {
			setAttributes( {
				childOrder: {
					desktop: getNaturalOrder( slotCount ),
					tablet: remapSequence(
						orderObject.tablet,
						previousIds,
						currentIds
					),
					mobile: remapSequence(
						orderObject.mobile,
						previousIds,
						currentIds
					),
				},
			} );

			return;
		}

		const sequence = orderObject[ device ];
		const position = sequence.indexOf( move.from + 1 );

		if ( -1 === position ) {
			return;
		}

		// The arrows step through the document, so the same step is applied to
		// what this device shows rather than to the document position.
		const target = Math.max(
			0,
			Math.min(
				sequence.length - 1,
				position + ( move.to - move.from )
			)
		);

		documentOrderRef.current = previousIds;

		if ( typeof __unstableMarkNextChangeAsNotPersistent === 'function' ) {
			__unstableMarkNextChangeAsNotPersistent();
		}

		moveBlocksToPosition(
			[ move.clientId ],
			clientId,
			clientId,
			move.from
		);

		setAttributes( {
			childOrder: {
				...orderObject,
				[ device ]: withSlotMoved( sequence, position, target ),
			},
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ rowClientIds, device ] );

	const rowCentres = useRowCentres(
		rowControlsRef,
		rowClientIds,
		orderSequence.join( ',' )
	);

	// Previews the active device's row order in the canvas.
	const orderRef = useChildOrder( orderSequence );

	const wrapperWidth =
		activeMargin > 0 ? `calc(100% - ${ activeMargin * 2 }px)` : '100%';

	const blockProps = useBlockProps( {
		ref: orderRef,
		className: [
			'uplifters-site-builder-blocks-posts-layout',
			'uplifters-site-builder-blocks-posts-layout-editor',
			`is-uplifters-site-builder-blocks-device-${ device }`,
		].join( ' ' ),
		'data-uplifters-site-builder-blocks-device': device,
		style: {
			width: wrapperWidth,
			maxWidth: wrapperWidth,

			padding: `${ activePadding }px`,
			margin: `${ activeMargin }px`,
			gap: `${ activeGap }px`,
			backgroundColor: activeBackgroundColor || undefined,
			borderRadius: `${ activeBorderRadius }px`,
			boxShadow: activeShadow
				? `0 ${ activeShadow }px ${ activeShadow * 3 }px rgba(0,0,0,0.18)`
				: 'none',

			'--wp--style--block-gap': `${ activeGap }px`,
		},
	} );

	// The empty rows below replace the default appender.
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: POSTS_LAYOUT_TEMPLATE,
		templateLock: false,
		renderAppender: false,
		orientation: 'vertical',
	} );

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={ __( 'Structure', 'uplifters-site-builder-blocks' ) }
					initialOpen={ false }
				>
					<ResponsiveOrderControl
						sequence={ orderSequence }
						labels={ rowLabels }
						deviceLabel={ deviceLabel }
						onChange={ setOrderForDevice }
						help={ __(
							'Moving a row in the canvas does the same thing. With Tablet or Mobile active the move applies to that device only; on Desktop it moves the row for every device.',
							'uplifters-site-builder-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Spacing', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
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
				</PanelBody>

				<PanelBody
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Layout Spacing', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
					initialOpen={ false }
					opened={ openStylesPanel === 'layoutSpacing' }
					onToggle={ () => toggleStylesPanel( 'layoutSpacing' ) }
				>
					<div className="uplifters-site-builder-blocks-responsive-device-badge">
						{ deviceLabel }
					</div>

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
						label={ __( 'Row Gap', 'uplifters-site-builder-blocks' ) }
						value={ activeGap }
						onChange={ ( value ) =>
							setResponsiveAttribute( 'gap', value || 0 )
						}
						min={ 0 }
						max={ 120 }
						step={ 1 }
						help={ __(
							'Space between each row in this layout.',
							'uplifters-site-builder-blocks'
						) }
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
					title={ sprintf(
						/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
						__( '%s Colors', 'uplifters-site-builder-blocks' ),
						deviceLabel
					) }
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

			<div { ...innerBlocksProps }>
				{ innerBlocksProps.children }

				{ innerBlockCount > 0 && (
					<div
						className="uplifters-site-builder-blocks-posts-layout-row-controls"
						ref={ rowControlsRef }
					>
						{ rowCentres.map( ( { clientId: rowClientId, centre } ) => (
							<div
								key={ rowClientId }
								className="uplifters-site-builder-blocks-posts-layout-row-control"
								style={ { top: `${ centre }px` } }
							>
								<Tooltip
									text={ __(
										'Delete row',
										'uplifters-site-builder-blocks'
									) }
								>
									<Button
										className="uplifters-site-builder-blocks-posts-layout-row-delete"
										icon={ trash }
										label={ __(
											'Delete row',
											'uplifters-site-builder-blocks'
										) }
										onClick={ () =>
											removeBlock( rowClientId )
										}
									/>
								</Tooltip>
							</div>
						) ) }
					</div>
				) }

				{ Array.from( { length: emptyRows } ).map(
					( ignored, index ) => (
						<div
							key={ index }
							className="uplifters-site-builder-blocks-posts-layout-empty-row"
							style={ {
								order: getSlotOrder(
									orderSequence,
									innerBlockCount + index + 1
								),
							} }
						>
							<div className="uplifters-site-builder-blocks-posts-layout-empty-row-inserter">
								<Inserter
									rootClientId={ clientId }
									isAppender
									renderToggle={ ( {
										onToggle,
										disabled,
									} ) => (
										<Button
											className="uplifters-site-builder-blocks-posts-layout-empty-row-add"
											icon={ plus }
											label={ __(
												'Add block',
												'uplifters-site-builder-blocks'
											) }
											onClick={ onToggle }
											disabled={ disabled }
										/>
									) }
								/>
							</div>

							<div className="uplifters-site-builder-blocks-posts-layout-row-control">
								<Tooltip
									text={ __(
										'Delete row',
										'uplifters-site-builder-blocks'
									) }
								>
									<Button
										className="uplifters-site-builder-blocks-posts-layout-row-delete"
										icon={ trash }
										label={ __(
											'Delete row',
											'uplifters-site-builder-blocks'
										) }
										onClick={ () =>
											setEmptyRows( ( count ) =>
												Math.max( 0, count - 1 )
											)
										}
									/>
								</Tooltip>
							</div>
						</div>
					)
				) }

				<div
					className="uplifters-site-builder-blocks-posts-layout-add-more"
					style={ { order: EDITOR_CHROME_ORDER } }
				>
					<Button
						variant="secondary"
						onClick={ () =>
							setEmptyRows( ( count ) => count + 1 )
						}
					>
						{ __( 'Add More', 'uplifters-site-builder-blocks' ) }
					</Button>
				</div>
			</div>
		</>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? <InserterPreview type="posts-layout" /> : <Editor { ...props } />;
}

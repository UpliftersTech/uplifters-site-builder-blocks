import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';

import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';

import {
	SAFE_ENDPOINTS,
	SAFE_POST_TYPES,
	buildContainerStyleObject,
	buildSeparatorStyleObject,
	buildTextStyleObject,
	clamp,
	formatDate,
	getEmptyPreviewState,
	getPreviewStateFromPost,
	loadPostsMetadataWithApiFetch,
	mapPostTypeToEndpoint,
} from '../../api-requests';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

function getCurrentGlobalResponsiveDevice() {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice ===
			'function'
	) {
		const device =
			window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		return RESPONSIVE_DEVICES.includes(device)
			? device
			: 'desktop';
	}

	return 'desktop';
}

/**
 * Reads the current device from the global floating responsive toolbar.
 * This block does not provide its own device switcher.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice()
	);

	useEffect(() => {
		function handleDeviceChange(event) {
			const nextDevice =
				event?.detail?.device ||
				getCurrentGlobalResponsiveDevice();

			setDevice(
				RESPONSIVE_DEVICES.includes(nextDevice)
					? nextDevice
					: 'desktop'
			);
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice =
				getCurrentGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice
					? nextDevice
					: currentDevice
			);
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(
	value,
	device,
	fallback = ''
) {
	if (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	) {
		if (
			Object.prototype.hasOwnProperty.call(
				value,
				device
			)
		) {
			return value[device];
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'desktop'
			)
		) {
			return value.desktop;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'tablet'
			)
		) {
			return value.tablet;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'mobile'
			)
		) {
			return value.mobile;
		}
	}

	/*
	 * Compatibility with older blocks that stored scalar values.
	 */
	if (
		value !== undefined &&
		value !== null &&
		typeof value !== 'object'
	) {
		return value;
	}

	return fallback;
}

function setResponsiveValue(
	value,
	device,
	nextValue
) {
	const currentValue =
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
			? value
			: {};

	return {
		...currentValue,
		[device]: nextValue,
	};
}

const iconBaseStyle = {
	width: '1em',
	height: '1em',
	display: 'inline-block',
	flexShrink: 0,
};

const metadataContentBaseStyle = {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: 0,
};

const metadataInlineItemStyle = {
	display: 'inline-flex',
	alignItems: 'center',
};

const metadataTextItemStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.5rem',
	textDecoration: 'none',
};

const mutedTextStyle = {
	color: '#9ca3af',
};

const panelLabelStyle = {
	margin: '0 0 8px',
	fontSize: '12px',
	fontWeight: 700,
	textTransform: 'uppercase',
};

const panelFieldStyle = {
	marginBottom: '16px',
};

const MetadataIcon = ({ type, style }) => {
	const sharedProps = {
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: '1.8',
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		style: {
			...iconBaseStyle,
			...style,
		},
		'aria-hidden': true,
		focusable: 'false',
	};

	if (type === 'author') {
		return (
			<svg {...sharedProps}>
				<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
				<path d="M5 20a7 7 0 0 1 14 0" />
			</svg>
		);
	}

	if (type === 'category') {
		return (
			<svg {...sharedProps}>
				<path d="M20 10 12 2H4v8l8 8 8-8Z" />
				<path d="M7.5 7.5h.01" />
			</svg>
		);
	}

	return (
		<svg {...sharedProps}>
			<rect
				x="3"
				y="5"
				width="18"
				height="16"
				rx="2"
			/>

			<path d="M16 3v4M8 3v4M3 11h18" />
		</svg>
	);
};

function Editor({
	attributes,
	setAttributes,
	context,
}) {
	const {
		linkAuthor = false,
		linkCategory = false,
		dateFormat = 'd-m-Y',
		postId: savedId,
		postTypeEndpoint: savedEndpoint,
	} = attributes;

	const blockElementRef = useRef(null);
	const device = useGlobalResponsiveDevice();

	const showAuthor = Boolean(
		getResponsiveValue(
			attributes.showAuthor,
			device,
			true
		)
	);

	const showCategory = Boolean(
		getResponsiveValue(
			attributes.showCategory,
			device,
			true
		)
	);

	const showDate = Boolean(
		getResponsiveValue(
			attributes.showDate,
			device,
			true
		)
	);

	const uppercase = Boolean(
		getResponsiveValue(
			attributes.uppercase,
			device,
			false
		)
	);

	const textColor = getResponsiveValue(
		attributes.textColor,
		device,
		'#111827'
	);

	const textOpacity = Number(
		getResponsiveValue(
			attributes.textOpacity,
			device,
			1
		)
	);

	const fontFamily = String(
		getResponsiveValue(
			attributes.fontFamily,
			device,
			'default'
		)
	);

	const fontSize = Number(
		getResponsiveValue(
			attributes.fontSize,
			device,
			16
		)
	);

	const fontWeight = String(
		getResponsiveValue(
			attributes.fontWeight,
			device,
			'500'
		)
	);

	const textAlign = String(
		getResponsiveValue(
			attributes.textAlign,
			device,
			'left'
		)
	);

	const metaGap = Number(
		getResponsiveValue(
			attributes.metaGap,
			device,
			8
		)
	);

	const [openSettingsPanel, setOpenSettingsPanel] =
		useState(null);

	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);

	const [previewState, setPreviewState] = useState(
		getEmptyPreviewState({
			loading: true,
		})
	);

	const {
		editorPostId,
		editorPostType,
		sitePostId,
		sitePostType,
	} = useSelect((select) => {
		const editor = select('core/editor');
		const editSite = select('core/edit-site');

		return {
			editorPostId:
				editor?.getCurrentPostId
					? editor.getCurrentPostId()
					: null,

			editorPostType:
				editor?.getCurrentPostType
					? editor.getCurrentPostType()
					: null,

			sitePostId:
				editSite?.getEditedPostId
					? editSite.getEditedPostId()
					: null,

			sitePostType:
				editSite?.getEditedPostType
					? editSite.getEditedPostType()
					: null,
		};
	}, []);

	const contextPostId =
		Number(context?.postId) || 0;

	const contextPostType =
		context?.postType || '';

	const canUseContext =
		Boolean(contextPostId) &&
		SAFE_POST_TYPES.has(contextPostType);

	const candidateType =
		(canUseContext && contextPostType) ||
		(SAFE_POST_TYPES.has(editorPostType)
			? editorPostType
			: null) ||
		(SAFE_POST_TYPES.has(sitePostType)
			? sitePostType
			: null) ||
		'post';

	const candidateEndpoint =
		mapPostTypeToEndpoint(candidateType);

	const safeEndpoint = SAFE_ENDPOINTS.has(
		candidateEndpoint
	)
		? candidateEndpoint
		: SAFE_ENDPOINTS.has(savedEndpoint)
			? savedEndpoint
			: 'posts';

	const effectivePostId =
		(canUseContext && contextPostId) ||
		(SAFE_POST_TYPES.has(editorPostType)
			? Number(editorPostId) || 0
			: 0) ||
		(SAFE_POST_TYPES.has(sitePostType)
			? Number(sitePostId) || 0
			: 0) ||
		0;

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]: setResponsiveValue(
				attributes[attributeName],
				device,
				value
			),
		});
	};

	useEffect(() => {
		const nextAttributes = {};

		if (
			effectivePostId &&
			effectivePostId !== savedId
		) {
			nextAttributes.postId =
				effectivePostId;
		}

		if (
			SAFE_ENDPOINTS.has(safeEndpoint) &&
			safeEndpoint !== savedEndpoint
		) {
			nextAttributes.postTypeEndpoint =
				safeEndpoint;
		}

		if (Object.keys(nextAttributes).length) {
			setAttributes(nextAttributes);
		}
	}, [
		effectivePostId,
		safeEndpoint,
		savedEndpoint,
		savedId,
		setAttributes,
	]);

	useEffect(() => {
		let isMounted = true;

		const loadPreview = async () => {
			setPreviewState(
				getEmptyPreviewState({
					loading: true,
				})
			);

			try {
				const postData =
					await loadPostsMetadataWithApiFetch({
						apiFetch,
						endpoint: safeEndpoint,
						postId: effectivePostId,
					});

				if (!isMounted) {
					return;
				}

				setPreviewState(
					getPreviewStateFromPost(postData)
				);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				setPreviewState(
					getEmptyPreviewState({
						loading: false,
						error:
							'Preview unavailable in editor.',
					})
				);
			}
		};

		loadPreview();

		return () => {
			isMounted = false;
		};
	}, [effectivePostId, safeEndpoint]);

	const palette = useMemo(
		() => [
			{
				name: 'Gray 900',
				color: '#111827',
			},
			{
				name: 'Blue 600',
				color: '#2563eb',
			},
			{
				name: 'Red 600',
				color: '#dc2626',
			},
			{
				name: 'Gray 500',
				color: '#6b7280',
			},
		],
		[]
	);

	const safeMetaGap = clamp(
		metaGap ?? 8,
		0,
		60
	);

	const textStyle = useMemo(
		() => ({
			...buildTextStyleObject({
				textColor,
				textOpacity,
				fontSize,
				fontWeight,
				uppercase,
			}),
			fontFamily:
				getFontFamilyCss(fontFamily),
		}),
		[
			fontFamily,
			fontSize,
			fontWeight,
			textColor,
			textOpacity,
			uppercase,
		]
	);

	const containerStyle = useMemo(
		() =>
			buildContainerStyleObject(
				textAlign
			),
		[textAlign]
	);

	const contentStyle = useMemo(
		() => ({
			...metadataContentBaseStyle,
			...containerStyle,
			...textStyle,
		}),
		[containerStyle, textStyle]
	);

	const separatorStyle = useMemo(
		() =>
			buildSeparatorStyleObject(
				textStyle,
				safeMetaGap
			),
		[textStyle, safeMetaGap]
	);

	const formattedDate = useMemo(
		() =>
			formatDate(
				previewState.date,
				dateFormat
			),
		[previewState.date, dateFormat]
	);

	const items = useMemo(() => {
		const nextItems = [];

		if (
			showAuthor &&
			previewState.author.name
		) {
			nextItems.push({
				key: 'author',
				type: 'author',
				text: previewState.author.name,
				href: linkAuthor
					? previewState.author.link
					: '',
			});
		}

		if (
			showCategory &&
			previewState.categories.length
		) {
			nextItems.push({
				key: 'category',
				type: 'category',
				categories:
					previewState.categories,
			});
		}

		if (showDate && formattedDate) {
			nextItems.push({
				key: 'date',
				type: 'date',
				text: formattedDate,
			});
		}

		return nextItems;
	}, [
		formattedDate,
		linkAuthor,
		previewState.author,
		previewState.categories,
		showAuthor,
		showCategory,
		showDate,
	]);

	const blockProps = useBlockProps({
		ref: blockElementRef,
		className: [
			'up2-metadata-block',
			`up2-metadata-block--device-${device}`,
		].join(' '),
	});

	const renderItem = (item) => {
		const itemTextStyle = {
			...metadataTextItemStyle,
			...textStyle,
		};

		const linkedItemTextStyle = {
			...itemTextStyle,
			cursor: 'pointer',
		};

		if (item.type === 'author') {
			if (item.href) {
				return (
					<a
						href={item.href}
						style={linkedItemTextStyle}
						onClick={(event) =>
							event.preventDefault()
						}
					>
						<MetadataIcon
							type="author"
							style={textStyle}
						/>

						<span>{item.text}</span>
					</a>
				);
			}

			return (
				<span style={itemTextStyle}>
					<MetadataIcon
						type="author"
						style={textStyle}
					/>

					<span>{item.text}</span>
				</span>
			);
		}

		if (item.type === 'category') {
			if (linkCategory) {
				return (
					<span style={itemTextStyle}>
						<MetadataIcon
							type="category"
							style={textStyle}
						/>

						<span>
							{item.categories.map(
								(category, index) => (
									<span
										key={`${category.name}-${index}`}
									>
										<a
											href={
												category.link ||
												'#'
											}
											style={{
												...textStyle,
												textDecoration:
													'none',
											}}
											onClick={(
												event
											) =>
												event.preventDefault()
											}
										>
											{
												category.name
											}
										</a>

										{index <
										item.categories
											.length -
											1
											? ', '
											: ''}
									</span>
								)
							)}
						</span>
					</span>
				);
			}

			return (
				<span style={itemTextStyle}>
					<MetadataIcon
						type="category"
						style={textStyle}
					/>

					<span>
						{item.categories
							.map(
								(category) =>
									category.name
							)
							.join(', ')}
					</span>
				</span>
			);
		}

		return (
			<span style={itemTextStyle}>
				<MetadataIcon
					type="date"
					style={textStyle}
				/>

				<span>{item.text}</span>
			</span>
		);
	};

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title="Content"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'metadata-settings'
					}
					onToggle={() =>
						setOpenSettingsPanel(
							(current) =>
								current ===
								'metadata-settings'
									? null
									: 'metadata-settings'
						)
					}
				>
					<ToggleControl
						label="Show Author"
						checked={showAuthor}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showAuthor',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Show Category"
						checked={showCategory}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showCategory',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Show Date"
						checked={showDate}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showDate',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Link Author"
						checked={Boolean(linkAuthor)}
						onChange={(value) =>
							setAttributes({
								linkAuthor:
									Boolean(value),
							})
						}
						help="Only applies when author is enabled."
					/>

					<ToggleControl
						label="Link Categories"
						checked={Boolean(
							linkCategory
						)}
						onChange={(value) =>
							setAttributes({
								linkCategory:
									Boolean(value),
							})
						}
						help="Only applies when category is enabled."
					/>

					<SelectControl
						label="Date Format"
						value={dateFormat}
						options={[
							{
								label:
									'day-month-year',
								value: 'd-m-Y',
							},
							{
								label:
									'day/month/year',
								value: 'd/m/Y',
							},
							{
								label:
									'Jan-31-YYYY',
								value:
									'Mon-dd-YYYY',
							},
							{
								label:
									'Jan-31-YYYY 06:35 pm',
								value:
									'Mon-dd-YYYY-time',
							},
						]}
						onChange={(value) =>
							setAttributes({
								dateFormat: value,
							})
						}
					/>

				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title="Layout"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'layout'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								'layout'
									? null
									: 'layout'
						)
					}
				>
					<RangeControl
						label="Gap"
						value={safeMetaGap}
						onChange={(value) =>
							updateResponsiveAttribute(
								'metaGap',
								Number(value)
							)
						}
						min={0}
						max={60}
					/>

					<ToggleControl
						label="Uppercase"
						checked={uppercase}
						onChange={(value) =>
							updateResponsiveAttribute(
								'uppercase',
								Boolean(value)
							)
						}
					/>

					<SelectControl
						label="Text Align"
						value={textAlign}
						options={[
							{
								label: 'Left',
								value: 'left',
							},
							{
								label: 'Center',
								value: 'center',
							},
							{
								label: 'Right',
								value: 'right',
							},
						]}
						onChange={(value) =>
							updateResponsiveAttribute(
								'textAlign',
								value
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title="Typography"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'typography'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								'typography'
									? null
									: 'typography'
						)
					}
				>
					<FontFamilyControl
						label="Font Family"
						value={fontFamily}
						onChange={(value) =>
							updateResponsiveAttribute(
								'fontFamily',
								value
							)
						}
						help={
							fontFamily === 'default'
								? 'Uses the active theme font.'
								: 'Applied to the current responsive device.'
						}
					/>

					<RangeControl
						label="Font Size (px)"
						value={fontSize}
						onChange={(value) =>
							updateResponsiveAttribute(
								'fontSize',
								Number(value)
							)
						}
						min={10}
						max={60}
					/>

					<SelectControl
						label="Font Weight"
						value={fontWeight}
						options={[
							{
								label:
									'Normal (400)',
								value: '400',
							},
							{
								label:
									'Medium (500)',
								value: '500',
							},
							{
								label:
									'Bold (700)',
								value: '700',
							},
						]}
						onChange={(value) =>
							updateResponsiveAttribute(
								'fontWeight',
								String(value)
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title="Colors"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'colors'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								'colors'
									? null
									: 'colors'
						)
					}
				>
					<div style={panelFieldStyle}>
						<p style={panelLabelStyle}>
							Text Color
						</p>

						<ColorPalette
							colors={palette}
							value={textColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'textColor',
									value ||
										'#111827'
								)
							}
						 enableAlpha/>
					</div>

					<RangeControl
						label="Opacity"
						value={Math.round(
							(textOpacity ?? 1) *
								100
						)}
						onChange={(value) =>
							updateResponsiveAttribute(
								'textOpacity',
								Number(value) /
									100
							)
						}
						min={0}
						max={100}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="up2-metadata-container">
					<div
						className="up2-metadata-content"
						style={contentStyle}
					>
						{previewState.loading ? (
							<span
								style={{
									...mutedTextStyle,
									fontFamily:
										getFontFamilyCss(fontFamily),
								}}
							>
								Loading...
							</span>
						) : previewState.error ? (
							<span
								style={{
									...mutedTextStyle,
									fontFamily:
										getFontFamilyCss(fontFamily),
								}}
							>
								{previewState.error}
							</span>
						) : !showAuthor &&
						  !showCategory &&
						  !showDate ? (
							<span
								style={{
									...mutedTextStyle,
									fontFamily:
										getFontFamilyCss(fontFamily),
								}}
							>
								Enable author, category,
								or date from settings.
							</span>
						) : !items.length ? (
							<span
								style={{
									...mutedTextStyle,
									fontFamily:
										getFontFamilyCss(fontFamily),
								}}
							>
								No metadata found.
							</span>
						) : (
							items.map(
								(item, index) => (
									<span
										key={item.key}
										style={
											metadataInlineItemStyle
										}
									>
										{index > 0 ? (
											<span
												style={
													separatorStyle
												}
												aria-hidden="true"
											>
												&bull;
											</span>
										) : null}

										{renderItem(item)}
									</span>
								)
							)
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-metadata" /> : <Editor {...props} />;
}

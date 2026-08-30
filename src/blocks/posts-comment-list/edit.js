import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl,
	RangeControl,
	BaseControl,
	SelectControl,
	TextControl,
	Notice,
	ColorPalette,
} from '@wordpress/components';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

import {
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

const normalizeResponsiveDevice = (device) => {
	const normalizedDevice = String(device || '')
		.toLowerCase()
		.trim();

	return RESPONSIVE_DEVICES.includes(normalizedDevice)
		? normalizedDevice
		: 'desktop';
};

const getCurrentGlobalResponsiveDevice = () => {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeResponsiveDevice(
			window.UpliftersSiteBuilderBlocksResponsive.getDevice()
		);
	}

	return 'desktop';
};

/**
 * Reads the active device from the global floating responsive toolbar.
 *
 * This block does not render its own device selector.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		const handleDeviceChange = (event) => {
			const eventDevice =
				event?.detail?.device;

			setDevice(
				eventDevice
					? normalizeResponsiveDevice(
							eventDevice
						)
					: getCurrentGlobalResponsiveDevice()
			);
		};

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const intervalId = window.setInterval(() => {
			const nextDevice =
				getCurrentGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice === nextDevice
					? currentDevice
					: nextDevice
			);
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(intervalId);
		};
	}, []);

	return device;
}

const getResponsiveValue = (
	value,
	device,
	fallback = ''
) => {
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
	 * Compatibility with blocks saved before responsive
	 * attribute objects were introduced.
	 */
	if (
		value !== undefined &&
		value !== null &&
		typeof value !== 'object'
	) {
		return value;
	}

	return fallback;
};

const createResponsiveUpdate = (
	currentValue,
	device,
	nextValue
) => {
	const responsiveValue =
		currentValue &&
		typeof currentValue === 'object' &&
		!Array.isArray(currentValue)
			? currentValue
			: {};

	return {
		...responsiveValue,
		[device]: nextValue,
	};
};

const clampInt = (
	value,
	minimum,
	maximum,
	fallback
) => {
	const number = Number(value);

	const safeValue = Number.isFinite(number)
		? Math.trunc(number)
		: fallback;

	return Math.min(
		maximum,
		Math.max(minimum, safeValue)
	);
};

function Editor({
	attributes,
	setAttributes,
}) {
	const device = useGlobalResponsiveDevice();

	const {
		perPage = 10,
		order = 'asc',
		replyText = 'Reply',
		emptyText = 'No comments yet.',
	} = attributes;

	const showAvatars = Boolean(
		getResponsiveValue(
			attributes.showAvatars,
			device,
			true
		)
	);

	const avatarSize = clampInt(
		getResponsiveValue(
			attributes.avatarSize,
			device,
			44
		),
		24,
		96,
		44
	);

	const showDate = Boolean(
		getResponsiveValue(
			attributes.showDate,
			device,
			true
		)
	);

	const dateFontSize = clampInt(
		getResponsiveValue(
			attributes.dateFontSize,
			device,
			12
		),
		10,
		18,
		12
	);

	const authorColor = getResponsiveValue(
		attributes.authorColor,
		device,
		'#111827'
	);

	const metaColor = getResponsiveValue(
		attributes.metaColor,
		device,
		'#6b7280'
	);

	const contentColor = getResponsiveValue(
		attributes.contentColor,
		device,
		'#374151'
	);

	const bubbleBg = getResponsiveValue(
		attributes.bubbleBg,
		device,
		'#ffffff'
	);

	const bubbleBorder = getResponsiveValue(
		attributes.bubbleBorder,
		device,
		'#e5e7eb'
	);

	const threaded = Boolean(
		getResponsiveValue(
			attributes.threaded,
			device,
			true
		)
	);

	const maxDepth = clampInt(
		getResponsiveValue(
			attributes.maxDepth,
			device,
			3
		),
		1,
		10,
		3
	);

	const showReplyLink = Boolean(
		getResponsiveValue(
			attributes.showReplyLink,
			device,
			true
		)
	);

	const fontFamily = getResponsiveValue(
		attributes.fontFamily,
		device,
		'inherit'
	);

	const [openSettingsPanel, setOpenSettingsPanel] =
		useState(null);

	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);

	const toggleSettingsPanel = (panelName) => {
		setOpenSettingsPanel((currentPanel) =>
			currentPanel === panelName
				? null
				: panelName
		);
	};

	const toggleStylesPanel = (panelName) => {
		setOpenStylesPanel((currentPanel) =>
			currentPanel === panelName
				? null
				: panelName
		);
	};

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]:
				createResponsiveUpdate(
					attributes[attributeName],
					device,
					value
				),
		});
	};

	const palette = useMemo(
		() => [
			{
				name: 'Gray 900',
				color: '#111827',
			},
			{
				name: 'Gray 700',
				color: '#374151',
			},
			{
				name: 'Gray 500',
				color: '#6b7280',
			},
			{
				name: 'Border',
				color: '#e5e7eb',
			},
			{
				name: 'Blue 600',
				color: '#2563eb',
			},
			{
				name: 'White',
				color: '#ffffff',
			},
		],
		[]
	);

	const previewComments = [
		{
			id: 1,
			author: 'John Doe',
			date: 'Mar 07, 2026',
			content:
				'This is a sample comment preview inside the editor. Frontend will render real WordPress comments.',
			depth: 0,
		},
		{
			id: 2,
			author: 'Jane Smith',
			date: 'Mar 07, 2026',
			content:
				'This is a sample reply comment preview.',
			depth: 1,
		},
		{
			id: 3,
			author: 'Alex Brown',
			date: 'Mar 08, 2026',
			content:
				'This is a second-level sample reply.',
			depth: 2,
		},
	];

	const visiblePreviewComments = threaded
		? previewComments.filter(
				(comment) =>
					comment.depth <= maxDepth
			)
		: previewComments.map((comment) => ({
				...comment,
				depth: 0,
			}));

	const styles = {
		wrap: {
			width: '100%',
			boxSizing: 'border-box',
		},

		header: {
			display: 'flex',
			justifyContent: 'space-between',
			gap: '12px',
			alignItems: 'center',
			marginBottom: '12px',
			padding: '8px 0',
			borderBottom: `1px solid ${bubbleBorder}`,
			boxSizing: 'border-box',
		},

		title: {
			margin: 0,
			fontSize: '14px',
			fontWeight: 700,
			color: authorColor,
			lineHeight: 1.3,
		},

		hint: {
			margin: 0,
			fontSize: '12px',
			color: metaColor,
			lineHeight: 1.3,
		},

		list: {
			display: 'flex',
			flexDirection: 'column',
			gap: '14px',
			width: '100%',
			boxSizing: 'border-box',
		},

		row: {
			display: 'flex',
			gap:
				device === 'mobile'
					? '9px'
					: '12px',
			alignItems: 'flex-start',
			width: '100%',
			boxSizing: 'border-box',
		},

		avatar: {
			width: `${avatarSize}px`,
			height: `${avatarSize}px`,
			borderRadius: '999px',
			overflow: 'hidden',
			flexShrink: 0,
			background: '#f3f4f6',
			border: `1px solid ${bubbleBorder}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '12px',
			fontWeight: 700,
			color: metaColor,
			boxSizing: 'border-box',
		},

		bubble: {
			flex: 1,
			minWidth: 0,
			background: bubbleBg,
			border: `1px solid ${bubbleBorder}`,
			borderRadius: '14px',
			padding:
				device === 'mobile'
					? '10px'
					: '12px',
			boxShadow:
				'0 1px 2px rgba(0, 0, 0, 0.04)',
			boxSizing: 'border-box',
		},

		topLine: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: '8px',
			alignItems: 'baseline',
		},

		author: {
			fontWeight: 700,
			color: authorColor,
			fontSize: '14px',
			lineHeight: 1.2,
		},

		meta: {
			color: metaColor,
			fontSize: `${dateFontSize}px`,
			lineHeight: 1.2,
		},

		content: {
			marginTop: '8px',
			color: contentColor,
			fontSize: '14px',
			lineHeight: 1.65,
		},

		actions: {
			marginTop: '10px',
			display: 'flex',
			gap: '10px',
		},

		reply: {
			color: '#2563eb',
			fontSize: '13px',
			fontWeight: 600,
			textDecoration: 'none',
			lineHeight: 1.3,
		},

		indent: (depth) => {
			const indentUnit =
				device === 'mobile'
					? 12
					: device === 'tablet'
						? 16
						: 20;

			return {
				marginLeft: `${
					Math.min(depth, maxDepth) *
					indentUnit
				}px`,
				boxSizing: 'border-box',
			};
		},

		note: {
			marginTop: '14px',
			padding: '10px 12px',
			fontSize: '12px',
			lineHeight: 1.5,
			color: metaColor,
			background: '#f9fafb',
			border: `1px dashed ${bubbleBorder}`,
			borderRadius: '10px',
			boxSizing: 'border-box',
		},
	};

	const blockProps = useBlockProps({
		className: [
			'uplifters-site-builder-blocks-post-comments-block-editor',
			`uplifters-site-builder-blocks-post-comments-block-editor--device-${device}`,
		].join(' '),
		style: styles.wrap,
	});

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title="Query"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'comments-settings'
					}
					onToggle={() =>
						toggleSettingsPanel(
							'comments-settings'
						)
					}
				>
					<RangeControl
						label="Comments Per Page"
						value={perPage}
						onChange={(value) =>
							setAttributes({
								perPage:
									clampInt(
										value,
										1,
										100,
										10
									),
							})
						}
						min={1}
						max={50}
						step={1}
					/>

					<SelectControl
						label="Order"
						value={order}
						options={[
							{
								label:
									'Oldest first (ASC)',
								value: 'asc',
							},
							{
								label:
									'Newest first (DESC)',
								value: 'desc',
							},
						]}
						onChange={(value) =>
							setAttributes({
								order:
									value ===
									'desc'
										? 'desc'
										: 'asc',
							})
						}
					/>
				</PanelBody>

				<PanelBody
					title="Content"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'avatar-settings'
					}
					onToggle={() =>
						toggleSettingsPanel(
							'avatar-settings'
						)
					}
				>
					<ToggleControl
						label="Show Avatars"
						checked={showAvatars}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showAvatars',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Threaded (nested replies)"
						checked={threaded}
						onChange={(value) =>
							updateResponsiveAttribute(
								'threaded',
								Boolean(value)
							)
						}
					/>

					<RangeControl
						label="Max Depth"
						value={maxDepth}
						onChange={(value) =>
							updateResponsiveAttribute(
								'maxDepth',
								clampInt(
									value,
									1,
									10,
									3
								)
							)
						}
						min={1}
						max={6}
						step={1}
						disabled={!threaded}
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
						label="Show Reply Link"
						checked={showReplyLink}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showReplyLink',
								Boolean(value)
							)
						}
					/>

					<TextControl
						label="Reply Text"
						value={replyText}
						onChange={(value) =>
							setAttributes({
								replyText: String(
									value ?? ''
								),
							})
						}
					/>

					<TextControl
						label="Empty Text"
						value={emptyText}
						onChange={(value) =>
							setAttributes({
								emptyText: String(
									value ?? ''
								),
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title="Layout"
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() =>
						toggleStylesPanel('layout')
					}
				>
					<RangeControl
						label="Avatar Size (px)"
						value={avatarSize}
						onChange={(value) =>
							updateResponsiveAttribute(
								'avatarSize',
								clampInt(
									value,
									24,
									96,
									44
								)
							)
						}
						min={24}
						max={96}
						step={2}
						disabled={!showAvatars}
					/>

					<RangeControl
						label="Date Font Size (px)"
						value={dateFontSize}
						onChange={(value) =>
							updateResponsiveAttribute(
								'dateFontSize',
								clampInt(
									value,
									10,
									18,
									12
								)
							)
						}
						min={10}
						max={18}
						step={1}
						disabled={!showDate}
					/>
				</PanelBody>

				<PanelBody
					title="Colors"
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() =>
						toggleStylesPanel('colors')
					}
				>
					<BaseControl label="Author Color">
						<ColorPalette
							colors={palette}
							value={authorColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'authorColor',
									value ||
										'#111827'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Meta Color (date)">
						<ColorPalette
							colors={palette}
							value={metaColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'metaColor',
									value ||
										'#6b7280'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Content Color">
						<ColorPalette
							colors={palette}
							value={contentColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'contentColor',
									value ||
										'#374151'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Bubble Background">
						<ColorPalette
							colors={palette}
							value={bubbleBg}
							onChange={(value) =>
								updateResponsiveAttribute(
									'bubbleBg',
									value ||
										'#ffffff'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Bubble Border">
						<ColorPalette
							colors={palette}
							value={bubbleBorder}
							onChange={(value) =>
								updateResponsiveAttribute(
									'bubbleBorder',
									value ||
										'#e5e7eb'
								)
							}
						 enableAlpha/>
					</BaseControl>
				</PanelBody>

				<PanelBody
					title="Typography"
					initialOpen={false}
					opened={openStylesPanel === 'typography'}
					onToggle={() =>
						toggleStylesPanel('typography')
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
					/>
				</PanelBody>
			</InspectorControls>

			<div
				{...blockProps}
				style={{
					...blockProps.style,
					fontFamily: getFontFamilyCss(fontFamily),
				}}
			>
				<div style={styles.header}>
					<p style={styles.title}>
						Comments Preview
					</p>

					<p style={styles.hint}>
						Auto single post view
					</p>
				</div>

				<Notice
					status="info"
					isDismissible={false}
				>
					Add this block once. It will
					automatically render after post
					content on every single post view.
				</Notice>

				<div style={styles.list}>
					{visiblePreviewComments.map(
						(comment) => (
							<div
								key={comment.id}
								style={
									comment.depth
										? styles.indent(
												comment.depth
											)
										: undefined
								}
							>
								<div style={styles.row}>
									{showAvatars ? (
										<div
											style={
												styles.avatar
											}
										>
											{comment.author
												? comment.author.charAt(
														0
													)
												: 'A'}
										</div>
									) : null}

									<div
										style={
											styles.bubble
										}
									>
										<div
											style={
												styles.topLine
											}
										>
											<div
												style={
													styles.author
												}
											>
												{
													comment.author
												}
											</div>

											{showDate ? (
												<div
													style={
														styles.meta
													}
												>
													{
														comment.date
													}
												</div>
											) : null}
										</div>

										<div
											style={
												styles.content
											}
										>
											{
												comment.content
											}
										</div>

										{showReplyLink ? (
											<div
												style={
													styles.actions
												}
											>
												<span
													style={
														styles.reply
													}
												>
													{replyText ||
														'Reply'}
												</span>
											</div>
										) : null}
									</div>
								</div>
							</div>
						)
					)}
				</div>

				<div style={styles.note}>
					A static preview is shown in the
					editor. Real comments on the
					frontend are rendered dynamically by{' '}
					<code>render.php</code>.
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-comment-list" /> : <Editor {...props} />;
}
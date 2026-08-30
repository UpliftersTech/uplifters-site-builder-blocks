import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	RangeControl,
	TextControl,
	Placeholder,
	Flex,
	FlexItem,
	Icon,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';

import './editor.scss';

function getCurrentDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

/**
 * Read a responsive value.
 *
 * Accepts either a { desktop, tablet, mobile } object or a legacy plain
 * value saved before this block became responsive.
 *
 * @param {*}      value    Attribute value.
 * @param {string} device   Current device.
 * @param {*}      fallback Fallback value.
 * @return {*} Resolved value.
 */
function getResponsiveValue(value, device, fallback) {
	if (value === undefined || value === null || value === '') {
		return fallback;
	}

	if (typeof value !== 'object') {
		return value;
	}

	const resolved =
		value[device] ?? value.desktop ?? value.tablet ?? value.mobile;

	if (resolved === undefined || resolved === null || resolved === '') {
		return fallback;
	}

	return resolved;
}

/**
 * Write a responsive value for the current device only.
 *
 * Legacy plain values are migrated to all three devices first, so switching
 * a block to responsive never loses the previously saved value.
 *
 * @param {*}      value  Current attribute value.
 * @param {string} device Current device.
 * @param {*}      next   New value for that device.
 * @return {Object} Updated responsive object.
 */
function setResponsiveValue(value, device, next) {
	let base = {};

	if (value && typeof value === 'object') {
		base = { ...value };
	} else if (value !== undefined && value !== null && value !== '') {
		base = {
			desktop: value,
			tablet: value,
			mobile: value,
		};
	}

	return {
		...base,
		[device]: next,
	};
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return (
		<div className="uplifters-video-upload__device-badge">{label}</div>
	);
}

function Editor({ attributes, setAttributes }) {
	const { videos = [], rows } = attributes;

	const [device, setDevice] = useState(getCurrentDevice());
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	useEffect(() => {
		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(event.detail.device);
				return;
			}

			setDevice(getCurrentDevice());
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice = getCurrentDevice();

			setDevice((currentDevice) => {
				return currentDevice !== nextDevice
					? nextDevice
					: currentDevice;
			});
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	const blockProps = useBlockProps({
		className: `uplifters-video-upload uplifters-video-upload--device-${device}`,
	});

	const unitToRem = (unit) => {
		const n = Number(unit);
		if (!Number.isFinite(n) || n < 0) {
			return 0;
		}
		return n * 0.25;
	};

	const currentRows = getResponsiveValue(rows, device, 1);

	const cols = useMemo(
		() => Math.max(1, Math.min(6, Number(currentRows) || 1)),
		[currentRows]
	);

	/**
	 * Update a responsive key on a single video item.
	 *
	 * @param {number} index Video index.
	 * @param {string} key   Attribute key.
	 * @param {*}      value New value for the current device.
	 */
	const updateVideoResponsive = (index, key, value) => {
		const newVideos = [...videos];

		newVideos[index] = {
			...newVideos[index],
			[key]: setResponsiveValue(
				newVideos[index]?.[key],
				device,
				value
			),
		};

		setAttributes({ videos: newVideos });
	};

	const removeVideo = (index) => {
		const newVideos = videos.filter((_, i) => i !== index);
		setAttributes({ videos: newVideos });
	};

	const addVideo = (media) => {
		if (!media || !media.url) {
			return;
		}

		setAttributes({
			videos: [
				...videos,
				{
					url: media.url,
					width: { desktop: 320, tablet: 320, mobile: 320 },
					height: { desktop: 180, tablet: 180, mobile: 180 },
					padding: { desktop: 2, tablet: 2, mobile: 2 },
					margin: { desktop: 2, tablet: 2, mobile: 2 },
				},
			],
		});
	};

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__('Settings', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'settings'}
					onToggle={() =>
						setOpenSettingsPanel(
							openSettingsPanel === 'settings'
								? null
								: 'settings'
						)
					}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__(
							'Videos per row',
							'uplifters-site-builder-blocks'
						)}
						value={Number(currentRows) || 1}
						onChange={(value) =>
							setAttributes({
								rows: setResponsiveValue(
									rows,
									device,
									Math.max(
										1,
										Math.min(6, Number(value) || 1)
									)
								),
							})
						}
						min={1}
						max={6}
						help={__(
							'This value is saved for the selected responsive variant.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>

				{videos.length > 0 &&
					videos.map((video, index) => (
						<PanelBody
							key={index}
							title={sprintf(
								/* translators: %d: video number. */
								__(
									'Video %d Settings',
									'uplifters-site-builder-blocks'
								),
								index + 1
							)}
							initialOpen={false}
							opened={openSettingsPanel === index}
							onToggle={() =>
								setOpenSettingsPanel(
									openSettingsPanel === index ? null : index
								)
							}
						>
							<DeviceBadge device={device} />

							<TextControl
								label={__(
									'Aspect Ratio Width',
									'uplifters-site-builder-blocks'
								)}
								help={__(
									'Used to calculate aspect ratio',
									'uplifters-site-builder-blocks'
								)}
								type="number"
								value={getResponsiveValue(
									video?.width,
									device,
									320
								)}
								onChange={(val) =>
									updateVideoResponsive(
										index,
										'width',
										Math.max(1, parseInt(val, 10) || 1)
									)
								}
							/>
							<TextControl
								label={__(
									'Aspect Ratio Height',
									'uplifters-site-builder-blocks'
								)}
								help={__(
									'Used to calculate aspect ratio',
									'uplifters-site-builder-blocks'
								)}
								type="number"
								value={getResponsiveValue(
									video?.height,
									device,
									180
								)}
								onChange={(val) =>
									updateVideoResponsive(
										index,
										'height',
										Math.max(1, parseInt(val, 10) || 1)
									)
								}
							/>

							<div className="uplifters-video-upload__control-actions">
								<Button
									variant="secondary"
									isDestructive
									onClick={() => removeVideo(index)}
								>
									{__(
										'Remove this video',
										'uplifters-site-builder-blocks'
									)}
								</Button>
							</div>
						</PanelBody>
					))}

				<PanelBody
					title={__('Add Video', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'add'}
					onToggle={() =>
						setOpenSettingsPanel(
							openSettingsPanel === 'add' ? null : 'add'
						)
					}
				>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={addVideo}
							allowedTypes={['video']}
							render={({ open }) => (
								<Button onClick={open} variant="primary">
									{__(
										'Add Video',
										'uplifters-site-builder-blocks'
									)}
								</Button>
							)}
						/>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Dimentions', 'uplifters-site-builder-blocks')}
					initialOpen={false}
				>
					<DeviceBadge device={device} />

					{videos.length > 0 ? (
						videos.map((video, index) => (
							<PanelBody
								key={index}
								title={sprintf(
									/* translators: %d: video number. */
									__(
										'Video %d Styles',
										'uplifters-site-builder-blocks'
									),
									index + 1
								)}
								initialOpen={false}
								opened={openStylesPanel === index}
								onToggle={() =>
									setOpenStylesPanel(
										openStylesPanel === index ? null : index
									)
								}
							>
								<TextControl
									label={__(
										'Padding (spacing unit)',
										'uplifters-site-builder-blocks'
									)}
									help={__(
										'1 = 0.25rem',
										'uplifters-site-builder-blocks'
									)}
									type="number"
									value={getResponsiveValue(
										video?.padding,
										device,
										2
									)}
									onChange={(val) =>
										updateVideoResponsive(
											index,
											'padding',
											Math.max(0, parseInt(val, 10) || 0)
										)
									}
								/>
								<TextControl
									label={__(
										'Margin (spacing unit)',
										'uplifters-site-builder-blocks'
									)}
									help={__(
										'1 = 0.25rem',
										'uplifters-site-builder-blocks'
									)}
									type="number"
									value={getResponsiveValue(
										video?.margin,
										device,
										2
									)}
									onChange={(val) =>
										updateVideoResponsive(
											index,
											'margin',
											Math.max(0, parseInt(val, 10) || 0)
										)
									}
								/>
							</PanelBody>
						))
					) : (
						<p className="components-base-control__help">
							{__(
								'Add videos first from the Settings tab.',
								'uplifters-site-builder-blocks'
							)}
						</p>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{videos.length === 0 ? (
					<Placeholder
						icon={<Icon icon="video-alt3" />}
						label={__('Video', 'uplifters-site-builder-blocks')}
						instructions={__(
							'Add one or more videos from the Settings panel.',
							'uplifters-site-builder-blocks'
						)}
					>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={addVideo}
								allowedTypes={['video']}
								render={({ open }) => (
									<Button onClick={open} variant="primary">
										{__(
											'Add your first video',
											'uplifters-site-builder-blocks'
										)}
									</Button>
								)}
							/>
						</MediaUploadCheck>
					</Placeholder>
				) : (
					<div
						className="uplifters-video-upload__grid"
						style={{ '--uplifters-video-upload-cols': cols }}
					>
						{videos.map((video, index) => {
							const w = Math.max(
								1,
								Number(
									getResponsiveValue(
										video?.width,
										device,
										320
									)
								) || 320
							);
							const h = Math.max(
								1,
								Number(
									getResponsiveValue(
										video?.height,
										device,
										180
									)
								) || 180
							);

							const padRem = unitToRem(
								getResponsiveValue(video?.padding, device, 0)
							);
							const marRem = unitToRem(
								getResponsiveValue(video?.margin, device, 0)
							);

							return (
								<div
									key={index}
									className="uplifters-video-upload__item"
									style={{
										'--uplifters-video-upload-item-padding': `${padRem}rem`,
										'--uplifters-video-upload-item-margin': `${marRem}rem`,
										'--uplifters-video-upload-item-ratio': `${w} / ${h}`,
									}}
								>
									<video
										className="uplifters-video-upload__video"
										src={video?.url}
										controls
										preload="metadata"
									/>

									<Flex className="uplifters-video-upload__item-actions">
										<FlexItem>
											<Button
												variant="secondary"
												size="small"
												onClick={() =>
													removeVideo(index)
												}
												isDestructive
											>
												{__(
													'Remove',
													'uplifters-site-builder-blocks'
												)}
											</Button>
										</FlexItem>
									</Flex>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="video-upload" /> : <Editor {...props} />;
}
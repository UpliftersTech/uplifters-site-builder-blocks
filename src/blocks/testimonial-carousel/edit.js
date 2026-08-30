import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Button,
	Panel,
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	RangeControl,
	BoxControl,
	ColorPalette,
} from '@wordpress/components';

import { ResponsiveFontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

function getGlobalResponsiveDevice() {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getGlobalResponsiveDevice());

	useEffect(() => {
		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(event.detail.device);
				return;
			}

			setDevice(getGlobalResponsiveDevice());
		}

		window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);

		const interval = window.setInterval(() => {
			const nextDevice = getGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice ? nextDevice : currentDevice
			);
		}, 500);

		return () => {
			window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);
			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(attributes, key, device, fallback = '') {
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if (value[device] !== undefined && value[device] !== null && value[device] !== '') {
			return value[device];
		}

		if (value.desktop !== undefined && value.desktop !== null && value.desktop !== '') {
			return value.desktop;
		}

		if (value.tablet !== undefined && value.tablet !== null && value.tablet !== '') {
			return value.tablet;
		}

		if (value.mobile !== undefined && value.mobile !== null && value.mobile !== '') {
			return value.mobile;
		}
	}

	if (value !== undefined && value !== null && typeof value !== 'object') {
		return value;
	}

	return fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
	setAttributes({
		[key]: {
			...(attributes[key] && typeof attributes[key] === 'object' && !Array.isArray(attributes[key])
				? attributes[key]
				: {}),
			[device]: value
		}
	});
}

function getResponsiveBoxValue(attributes, key, device) {
	const empty = { top: '', right: '', bottom: '', left: '' };
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const branch = value[device] || value.desktop || value.tablet || value.mobile;

		if (branch && typeof branch === 'object' && !Array.isArray(branch)) {
			return { ...empty, ...branch };
		}
	}

	return empty;
}

function boxToStyle(prefix, box) {
	if (!box || typeof box !== 'object') return {};

	const style = {};
	const map = {
		top: 'Top',
		right: 'Right',
		bottom: 'Bottom',
		left: 'Left'
	};

	Object.keys(map).forEach((key) => {
		const value = box[key];

		if (value !== undefined && value !== null && String(value).trim() !== '') {
			style[`${prefix}${map[key]}`] = value;
		}
	});

	return style;
}

function DeviceBadge({ device }) {
	const labels = {
		desktop: 'Desktop variant',
		tablet: 'Tablet variant',
		mobile: 'Mobile variant'
	};

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				marginBottom: '12px',
				padding: '5px 10px',
				borderRadius: '999px',
				background: '#f0f0f1',
				color: '#1e1e1e',
				fontSize: '12px',
				fontWeight: 600
			}}
		>
			{labels[device] || labels.desktop}
		</div>
	);
}

const emptyItem = () => ({
	imageId: 0,
	imageUrl: '',
	imageAlt: '',
	name: '',
	designation: '',
	text: ''
});

const clamp = (number, min, max) => Math.max(min, Math.min(max, Number(number)));

const RESPONSIVE_DEVICES = ['desktop', 'tablet', 'mobile'];

/**
 * Mirrors render.php: a "default" font key produces no rule, so the element
 * falls back to the block level font stack.
 *
 * @param {string} key Font family key.
 * @return {string} Usable CSS font-family stack, or empty string.
 */
function resolveFontStack(key) {
	const css = getFontFamilyCss(key);

	if (!css || css === 'inherit' || css === 'default') {
		return '';
	}

	return css;
}

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();

	const {
		items = [emptyItem()],
		autoplay = true,
		pauseOnHover = true,
		interval = 3500,
		speed = 650,
		showArrows = true,
		showDots = true
	} = attributes;

	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const safeItems = Array.isArray(items) && items.length ? items : [emptyItem()];

	const displayCount = getResponsiveValue(attributes, 'displayCount', device, 1);
	const imageWidth = getResponsiveValue(attributes, 'imageWidth', device, 64);
	const imageHeight = getResponsiveValue(attributes, 'imageHeight', device, 64);
	const gap = getResponsiveValue(attributes, 'gap', device, 16);
	const perView = getResponsiveValue(attributes, 'perView', device, device === 'desktop' ? 3 : device === 'tablet' ? 2 : 1);
	const minCardWidth = getResponsiveValue(attributes, 'minCardWidth', device, 280);
	const fontFamily = getResponsiveValue(attributes, 'fontFamily', device, 'default');
	const nameFontFamily = getResponsiveValue(attributes, 'nameFontFamily', device, 'default');
	const designationFontFamily = getResponsiveValue(attributes, 'designationFontFamily', device, 'default');
	const textColor = getResponsiveValue(attributes, 'textColor', device, '');
	const backgroundColor = getResponsiveValue(attributes, 'backgroundColor', device, '');
	const fontSize = getResponsiveValue(attributes, 'fontSize', device, '');
	const lineHeight = getResponsiveValue(attributes, 'lineHeight', device, '');
	const isItalic = !!getResponsiveValue(attributes, 'isItalic', device, false);
	const fontWeight = getResponsiveValue(attributes, 'fontWeight', device, '400');
	const padding = getResponsiveBoxValue(attributes, 'padding', device);
	const margin = getResponsiveBoxValue(attributes, 'margin', device);

	const safeDisplayCount = clamp(displayCount || 1, 1, safeItems.length);
	const safeImgW = clamp(imageWidth || 64, 24, 240);
	const safeImgH = clamp(imageHeight || 64, 24, 240);
	const safeGap = clamp(gap || 16, 0, 64);
	const safeInterval = clamp(interval || 3500, 1000, 15000);
	const safeSpeed = clamp(speed || 650, 150, 2000);
	const safePerView = clamp(perView || 1, 1, device === 'desktop' ? 6 : device === 'tablet' ? 4 : 2);
	const safeMinCard = clamp(minCardWidth || 280, 180, 520);

	const blockFontStack = resolveFontStack(fontFamily) || 'inherit';
	const nameFontStack = resolveFontStack(nameFontFamily) || blockFontStack;
	const designationFontStack = resolveFontStack(designationFontFamily) || blockFontStack;

	const updateItem = (index, patch) => {
		const next = [...safeItems];
		next[index] = {
			...next[index],
			...patch
		};

		setAttributes({
			items: next
		});
	};

	/**
	 * Builds a displayCount object for every device, not just the active one.
	 * Without this, a card added while the toolbar is on Desktop stays hidden
	 * on Tablet/Mobile because their own displayCount value never moves.
	 *
	 * @param {number} totalItems Item count after the change.
	 * @param {number} delta      Amount to shift each device count by.
	 * @return {Object} Full responsive displayCount object.
	 */
	const buildDisplayCount = (totalItems, delta) => {
		const current =
			attributes.displayCount &&
			typeof attributes.displayCount === 'object' &&
			!Array.isArray(attributes.displayCount)
				? attributes.displayCount
				: {};

		const nextCount = { ...current };

		RESPONSIVE_DEVICES.forEach((deviceName) => {
			const raw = Number(getResponsiveValue(attributes, 'displayCount', deviceName, 1)) || 1;

			nextCount[deviceName] = clamp(raw + delta, 1, Math.max(totalItems, 1));
		});

		return nextCount;
	};

	const addMore = () => {
		const next = [...safeItems, emptyItem()];

		setAttributes({
			items: next,
			displayCount: buildDisplayCount(next.length, 1)
		});
	};

	const removeItem = (index) => {
		const next = safeItems.filter((_, currentIndex) => currentIndex !== index);
		const ensured = next.length ? next : [emptyItem()];

		setAttributes({
			items: ensured,
			displayCount: buildDisplayCount(ensured.length, 0)
		});
	};

	const toggleSettingsPanel = (panelName) => {
		setOpenSettingsPanel((current) => (current === panelName ? null : panelName));
	};

	const toggleStylesPanel = (panelName) => {
		setOpenStylesPanel((current) => (current === panelName ? null : panelName));
	};

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-testimonial-carousel uplifters-site-builder-blocks-testimonial-carousel-device-${device}`,
		style: {
			border: '1px solid #e5e7eb',
			borderRadius: '16px',
			boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
			boxSizing: 'border-box',
			fontFamily: blockFontStack,
			color: textColor || undefined,
			backgroundColor: backgroundColor || undefined,
			fontSize: fontSize !== '' && fontSize !== undefined ? `${fontSize}px` : undefined,
			lineHeight: lineHeight !== '' && lineHeight !== undefined ? lineHeight : undefined,
			fontStyle: isItalic ? 'italic' : 'normal',
			fontWeight: fontWeight || undefined,
			...boxToStyle('padding', padding),
			...boxToStyle('margin', margin)
		}
	});

	return (
		<>
			<InspectorControls group="settings">
				<Panel>
					<PanelBody
						title="Behavior"
						initialOpen={false}
						opened={openSettingsPanel === 'slider-settings'}
						onToggle={() => toggleSettingsPanel('slider-settings')}
					>
						<DeviceBadge device={device} />

						<RangeControl
							label="Testimonials to show"
							value={safeDisplayCount}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'displayCount',
									device,
									clamp(value || 1, 1, safeItems.length)
								)
							}
							min={1}
							max={safeItems.length}
							step={1}
						/>

						<ToggleControl
							label="Autoplay"
							checked={!!autoplay}
							onChange={(value) => setAttributes({ autoplay: !!value })}
						/>

						<ToggleControl
							label="Pause on hover"
							checked={!!pauseOnHover}
							onChange={(value) => setAttributes({ pauseOnHover: !!value })}
							disabled={!autoplay}
						/>

						<RangeControl
							label="Interval (ms)"
							value={safeInterval}
							onChange={(value) => setAttributes({ interval: value || 3500 })}
							min={1000}
							max={15000}
							step={100}
							disabled={!autoplay}
						/>

						<RangeControl
							label="Speed (ms)"
							value={safeSpeed}
							onChange={(value) => setAttributes({ speed: value || 650 })}
							min={150}
							max={2000}
							step={50}
						/>

						<ToggleControl
							label="Show arrows"
							checked={!!showArrows}
							onChange={(value) => setAttributes({ showArrows: !!value })}
						/>

						<ToggleControl
							label="Show dots"
							checked={!!showDots}
							onChange={(value) => setAttributes({ showDots: !!value })}
						/>

						<Button variant="primary" onClick={addMore} style={{ marginTop: '10px' }}>
							Add More
						</Button>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<InspectorControls group="styles">
				<Panel>
					<PanelBody
						title="Layout"
						initialOpen={false}
						opened={openStylesPanel === 'layout'}
						onToggle={() => toggleStylesPanel('layout')}
					>
						<DeviceBadge device={device} />

						<RangeControl
							label="Gap (px)"
							value={safeGap}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'gap', device, value || 0)
							}
							min={0}
							max={64}
							step={1}
						/>

						<RangeControl
							label="Min Card Width (px)"
							value={safeMinCard}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'minCardWidth', device, value || 280)
							}
							min={180}
							max={520}
							step={1}
						/>

						<RangeControl
							label="Image Width (px)"
							value={safeImgW}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'imageWidth', device, value || 64)
							}
							min={24}
							max={240}
							step={1}
						/>

						<RangeControl
							label="Image Height (px)"
							value={safeImgH}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'imageHeight', device, value || 64)
							}
							min={24}
							max={240}
							step={1}
						/>

						<RangeControl
							label={`Per View (${device})`}
							value={safePerView}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'perView', device, value || 1)
							}
							min={1}
							max={device === 'desktop' ? 6 : device === 'tablet' ? 4 : 2}
							step={1}
						/>
					</PanelBody>

					<PanelBody
						title="Colors"
						initialOpen={false}
						opened={openStylesPanel === 'color'}
						onToggle={() => toggleStylesPanel('color')}
					>
						<DeviceBadge device={device} />

						<div className="components-base-control">
							<div className="components-base-control__label">Text Color</div>
							<ColorPalette
								value={textColor || undefined}
								onChange={(value) =>
									setResponsiveValue(attributes, setAttributes, 'textColor', device, value || '')
								}
							 enableAlpha/>
						</div>

						<div className="components-base-control" style={{ marginTop: '12px' }}>
							<div className="components-base-control__label">Background Color</div>
							<ColorPalette
								value={backgroundColor || undefined}
								onChange={(value) =>
									setResponsiveValue(attributes, setAttributes, 'backgroundColor', device, value || '')
								}
							 enableAlpha/>
						</div>
					</PanelBody>

					<PanelBody
						title="Typography"
						initialOpen={false}
						opened={openStylesPanel === 'typography'}
						onToggle={() => toggleStylesPanel('typography')}
					>
						<DeviceBadge device={device} />

						<ResponsiveFontFamilyControl
							label="Name Section Fonts"
							device={device}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeName="nameFontFamily"
							getResponsiveValue={getResponsiveValue}
							setResponsiveValue={setResponsiveValue}
						/>

						<ResponsiveFontFamilyControl
							label="Designation Section Fonts"
							device={device}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeName="designationFontFamily"
							getResponsiveValue={getResponsiveValue}
							setResponsiveValue={setResponsiveValue}
						/>

						<ResponsiveFontFamilyControl
							label="About Section Fonts"
							device={device}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeName="fontFamily"
							getResponsiveValue={getResponsiveValue}
							setResponsiveValue={setResponsiveValue}
						/>

						<ToggleControl
							label="Italic"
							checked={!!isItalic}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'isItalic', device, !!value)
							}
						/>

						<SelectControl
							label="Font Weight"
							value={fontWeight || '400'}
							options={[
								{ label: '100 (Thin)', value: '100' },
								{ label: '200 (Extra Light)', value: '200' },
								{ label: '300 (Light)', value: '300' },
								{ label: '400 (Regular)', value: '400' },
								{ label: '500 (Medium)', value: '500' },
								{ label: '600 (Semi Bold)', value: '600' },
								{ label: '700 (Bold)', value: '700' },
								{ label: '800 (Extra Bold)', value: '800' },
								{ label: '900 (Black)', value: '900' }
							]}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'fontWeight', device, value)
							}
						/>

						<RangeControl
							label="Font Size (px)"
							value={fontSize !== '' ? Number(fontSize) : undefined}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'fontSize', device, value ?? '')
							}
							min={10}
							max={72}
							step={1}
							allowReset
						/>

						<RangeControl
							label="Line Height"
							value={lineHeight !== '' ? Number(lineHeight) : undefined}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'lineHeight', device, value ?? '')
							}
							min={0.8}
							max={3}
							step={0.05}
							allowReset
						/>
					</PanelBody>

					<PanelBody
						title="Spacing"
						initialOpen={false}
						opened={openStylesPanel === 'dimensions'}
						onToggle={() => toggleStylesPanel('dimensions')}
					>
						<DeviceBadge device={device} />

						<BoxControl
							label="Padding"
							values={padding}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'padding', device, value)
							}
						/>

						<div style={{ height: '12px' }} />

						<BoxControl
							label="Margin"
							values={margin}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'margin', device, value)
							}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<div {...blockProps}>
				<div style={{ padding: '16px', boxSizing: 'border-box' }}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: `repeat(${safePerView}, minmax(${safeMinCard}px, 1fr))`,
							gap: `${safeGap}px`,
							overflowX: 'auto',
							overflowY: 'hidden',
							WebkitOverflowScrolling: 'touch',
							boxSizing: 'border-box'
						}}
					>
						{safeItems.slice(0, safeDisplayCount).map((item, index) => (
							<div
								key={index}
								style={{
									minWidth: `${safeMinCard}px`,
									border: '1px solid #e5e7eb',
									borderRadius: '16px',
									padding: '16px',
									boxSizing: 'border-box',
									backgroundColor: '#ffffff'
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
										boxSizing: 'border-box'
									}}
								>
									<div style={{ flex: '0 0 auto' }}>
										<MediaUploadCheck>
											<MediaUpload
												onSelect={(media) => {
													if (!media) return;

													const url = media.url || media?.sizes?.full?.url || '';
													const alt = media.alt || media?.alt_text || '';

													updateItem(index, {
														imageId: media.id,
														imageUrl: url,
														imageAlt: alt
													});
												}}
												allowedTypes={['image']}
												value={item.imageId}
												render={({ open }) => (
													<button
														type="button"
														onClick={open}
														style={{
															cursor: 'pointer',
															border: '0',
															backgroundColor: 'transparent',
															padding: '0',
															margin: '0',
															display: 'block'
														}}
														aria-label="Upload testimonial image"
													>
														{item.imageUrl ? (
															<img
																src={item.imageUrl}
																alt={item.imageAlt || ''}
																style={{
																	width: `${safeImgW}px`,
																	height: `${safeImgH}px`,
																	borderRadius: '9999px',
																	objectFit: 'cover',
																	display: 'block',
																	border: '1px solid #e5e7eb',
																	boxSizing: 'border-box'
																}}
															/>
														) : (
															<div
																style={{
																	width: `${safeImgW}px`,
																	height: `${safeImgH}px`,
																	borderRadius: '9999px',
																	backgroundColor: '#f3f4f6',
																	border: '1px solid #e5e7eb',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '12px',
																	color: '#6b7280',
																	boxSizing: 'border-box'
																}}
															>
																Upload Image
															</div>
														)}
													</button>
												)}
											/>
										</MediaUploadCheck>
									</div>

									<div style={{ flex: '1 1 auto', minWidth: '0' }}>
										<div
											className="uplifters-site-builder-blocks-testimonial-carousel__name"
											style={{ fontFamily: nameFontStack }}
										>
											<TextControl
												label="Name"
												value={item.name || ''}
												onChange={(value) => updateItem(index, { name: value })}
												placeholder="Name…"
												style={{ fontFamily: nameFontStack }}
											/>
										</div>

										<div
											className="uplifters-site-builder-blocks-testimonial-carousel__designation"
											style={{ fontFamily: designationFontStack }}
										>
											<TextControl
												label="Designation"
												value={item.designation || ''}
												onChange={(value) => updateItem(index, { designation: value })}
												placeholder="Designation…"
												style={{ fontFamily: designationFontStack }}
											/>
										</div>
									</div>
								</div>

								<div style={{ marginTop: '12px' }}>
									<RichText
										tagName="p"
										value={item.text || ''}
						onChange={(value) => updateItem(index, { text: value })}
										placeholder="Write testimonial text…"
										allowedFormats={['core/bold', 'core/italic', 'core/link']}
										style={{ margin: '0' }}
									/>
								</div>

								{safeItems.length > 1 ? (
									<Button variant="secondary" onClick={() => removeItem(index)} style={{ marginTop: '10px' }}>
										Remove This
									</Button>
								) : null}
							</div>
						))}
					</div>

					<Button variant="primary" onClick={addMore} style={{ display: 'flex', margin: '20px auto 0' }}>
						Add More
					</Button>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="testimonial-carousel" /> : <Editor {...props} />;
}
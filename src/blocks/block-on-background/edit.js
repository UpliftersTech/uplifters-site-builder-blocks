import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	InnerBlocks,
	useSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	RangeControl,
	BaseControl,
	GradientPicker,
	Disabled,
	Notice,
} from '@wordpress/components';

import './editor.scss';

function Editor({ attributes, setAttributes }) {
	const {
		blockHeight,
		blockWidth,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		bgImageId,
		bgImageUrl,
		overlayOpacity,
		bgColor,
		bgGradient,
	} = attributes;

	const [themeGradients] = useSettings('color.gradients');

	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	// Only one background source can be active at a time.
	const hasImage = !!bgImageUrl;
	const hasGradient = !!bgGradient;

	const onSelectMedia = (media) => {
		setAttributes({
			bgImageId: media?.id || 0,
			bgImageUrl: media?.url || '',
			// Selecting an image clears any gradient.
			bgGradient: '',
		});
	};

	const removeMedia = () => {
		setAttributes({
			bgImageId: 0,
			bgImageUrl: '',
		});
	};

	const onSelectGradient = (value) => {
		setAttributes({
			bgGradient: value || '',
			// Selecting a gradient clears any image.
			...(value ? { bgImageId: 0, bgImageUrl: '' } : {}),
		});
	};

	const gradientValue = bgGradient || 'none';
	const imageValue = bgImageUrl ? `url(${bgImageUrl})` : 'none';

	const blockStyle = {
		'--uplifters-block-on-background-height': `${blockHeight || 400}px`,
		'--uplifters-block-on-background-width': `${blockWidth || 1200}px`,
		'--uplifters-block-on-background-padding-top': `${paddingTop || 0}px`,
		'--uplifters-block-on-background-padding-bottom': `${paddingBottom || 0}px`,
		'--uplifters-block-on-background-padding-left': `${paddingLeft || 0}px`,
		'--uplifters-block-on-background-padding-right': `${paddingRight || 0}px`,
		'--uplifters-block-on-background-bg-color': bgColor || '#e5e7eb',
		'--uplifters-block-on-background-bg-image': imageValue,
		'--uplifters-block-on-background-bg-gradient': gradientValue,
		'--uplifters-block-on-background-overlay': `rgba(0, 0, 0, ${
			(overlayOpacity || 0) / 100
		})`,
	};

	const blockProps = useBlockProps({
		className: 'uplifters-block-on-background',
		style: blockStyle,
	});

	const toggleSettingsPanel = (panelName) => {
		setOpenSettingsPanel((current) =>
			current === panelName ? null : panelName
		);
	};

	const toggleStylesPanel = (panelName) => {
		setOpenStylesPanel((current) =>
			current === panelName ? null : panelName
		);
	};

	const gradientControl = (
		<GradientPicker
			value={bgGradient || undefined}
			gradients={themeGradients || []}
			onChange={onSelectGradient}
			clearable
			__experimentalIsRenderedInSidebar
		/>
	);

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Background Image Settings',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openSettingsPanel === 'background'}
					onToggle={() => toggleSettingsPanel('background')}
				>
					{hasGradient && (
						<Notice status="warning" isDismissible={false}>
							{__(
								'A background gradient is active. Clear the gradient to use an image instead.',
								'uplifters-site-builder-blocks'
							)}
						</Notice>
					)}

					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectMedia}
							allowedTypes={['image']}
							value={bgImageId}
							render={({ open }) => (
								<BaseControl
									label={__(
										'Background Image',
										'uplifters-site-builder-blocks'
									)}
								>
									{bgImageUrl && (
										<img
											className="uplifters-block-on-background__preview"
											src={bgImageUrl}
											alt={__(
												'Background preview',
												'uplifters-site-builder-blocks'
											)}
										/>
									)}

									<Button
										className="uplifters-block-on-background__media-button"
										onClick={open}
										variant="secondary"
										disabled={hasGradient}
										__next40pxDefaultSize
									>
										{bgImageId
											? __(
													'Replace Image',
													'uplifters-site-builder-blocks'
											  )
											: __(
													'Upload Image',
													'uplifters-site-builder-blocks'
											  )}
									</Button>

									{bgImageUrl && (
										<Button
											onClick={removeMedia}
											variant="link"
											isDestructive
										>
											{__(
												'Remove Image',
												'uplifters-site-builder-blocks'
											)}
										</Button>
									)}
								</BaseControl>
							)}
						/>
					</MediaUploadCheck>
				</PanelBody>

				<PanelBody
					title={__(
						'Background Gradient color',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openSettingsPanel === 'gradient'}
					onToggle={() => toggleSettingsPanel('gradient')}
				>
					{hasImage && (
						<Notice status="warning" isDismissible={false}>
							{__(
								'A background image is active. Remove the image to use a gradient instead.',
								'uplifters-site-builder-blocks'
							)}
						</Notice>
					)}

					<BaseControl
						label={__(
							'Background Gradient',
							'uplifters-site-builder-blocks'
						)}
					>
						{hasImage ? (
							<Disabled>{gradientControl}</Disabled>
						) : (
							gradientControl
						)}
					</BaseControl>
				</PanelBody>

				<PanelBody
					title={__('Dimensions', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'dimensions'}
					onToggle={() => toggleSettingsPanel('dimensions')}
				>
					<RangeControl
						label={__(
							'Block Height (px)',
							'uplifters-site-builder-blocks'
						)}
						value={blockHeight}
						onChange={(value) =>
							setAttributes({ blockHeight: value ?? 400 })
						}
						min={100}
						max={1200}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__(
							'Block Width (px)',
							'uplifters-site-builder-blocks'
						)}
						value={blockWidth}
						onChange={(value) =>
							setAttributes({ blockWidth: value ?? 1200 })
						}
						min={200}
						max={1920}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__(
							'Padding Top (px)',
							'uplifters-site-builder-blocks'
						)}
						value={paddingTop}
						onChange={(value) =>
							setAttributes({ paddingTop: value ?? 20 })
						}
						min={0}
						max={200}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__(
							'Padding Bottom (px)',
							'uplifters-site-builder-blocks'
						)}
						value={paddingBottom}
						onChange={(value) =>
							setAttributes({ paddingBottom: value ?? 20 })
						}
						min={0}
						max={200}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__(
							'Padding Left (px)',
							'uplifters-site-builder-blocks'
						)}
						value={paddingLeft}
						onChange={(value) =>
							setAttributes({ paddingLeft: value ?? 20 })
						}
						min={0}
						max={200}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__(
							'Padding Right (px)',
							'uplifters-site-builder-blocks'
						)}
						value={paddingRight}
						onChange={(value) =>
							setAttributes({ paddingRight: value ?? 20 })
						}
						min={0}
						max={200}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Color Settings', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() => toggleStylesPanel('colors')}
				>
					<RangeControl
						label={__(
							'Overlay Darken (%)',
							'uplifters-site-builder-blocks'
						)}
						value={overlayOpacity}
						onChange={(value) =>
							setAttributes({ overlayOpacity: value ?? 0 })
						}
						min={0}
						max={100}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="uplifters-block-on-background__overlay"
					aria-hidden="true"
				/>

				<div className="uplifters-block-on-background__content">
					<InnerBlocks
						renderAppender={InnerBlocks.ButtonBlockAppender}
					/>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="block-on-background" /> : <Editor {...props} />;
}

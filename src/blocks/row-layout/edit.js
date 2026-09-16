import { __ } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	ColorPalette,
	RangeControl,
} from '@wordpress/components';

import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview-shared';
import { ROW_SECTION_NAME } from './row-section';

const ROW_SECTION_BLOCK = ROW_SECTION_NAME;
const ROW_TEMPLATE = [ [ ROW_SECTION_BLOCK ] ];

function getCurrentDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

function getResponsiveValue(attributes, key, device) {
	const value = attributes[key] || {};

	return (
		value[device] ||
		value.desktop ||
		value.tablet ||
		value.mobile ||
		''
	);
}

function setResponsiveValue(
	attributes,
	setAttributes,
	key,
	device,
	value
) {
	setAttributes({
		[key]: {
			...(attributes[key] || {}),
			[device]: value,
		},
	});
}

function getPxNumber(value, fallback) {
	const match = /(-?\d+(?:\.\d+)?)/.exec(value || '');

	if (!match) {
		return fallback;
	}

	const parsed = Number(match[1]);

	return Number.isNaN(parsed) ? fallback : parsed;
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
		<div className="uplifters-site-builder-blocks-row-layout-device-badge">
			{label}
		</div>
	);
}

function Editor({ attributes, setAttributes, clientId }) {
	const [device, setDevice] = useState(getCurrentDevice());
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const toggleSettingsPanel = (panel) => {
		setOpenSettingsPanel((currentPanel) =>
			currentPanel === panel ? null : panel
		);
	};

	const toggleStylesPanel = (panel) => {
		setOpenStylesPanel((currentPanel) =>
			currentPanel === panel ? null : panel
		);
	};

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

	const innerBlocks = useSelect(
		(select) =>
			select('core/block-editor').getBlock(clientId)?.innerBlocks || [],
		[clientId]
	);

	const { insertBlock } = useDispatch('core/block-editor');

	useEffect(() => {
		if (innerBlocks.length === 0) {
			insertBlock(createBlock(ROW_SECTION_BLOCK), 0, clientId, false);
		}
	}, [innerBlocks.length, clientId, insertBlock]);

	const padding = getResponsiveValue(attributes, 'padding', device);
	const margin = getResponsiveValue(attributes, 'margin', device);
	const borderRadius = getResponsiveValue(attributes, 'borderRadius', device);
	const backgroundColor = getResponsiveValue(attributes, 'backgroundColor', device);
	const dividerGap = getResponsiveValue(attributes, 'dividerGap', device);

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-row-layout-editor-wrapper uplifters-site-builder-blocks-row-layout-device-${device}`,
		style: {
			padding: padding || undefined,
			margin: margin || undefined,
			borderRadius: borderRadius || undefined,
			backgroundColor: backgroundColor || undefined,
			gap: dividerGap || undefined,
		},
	});

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: [ROW_SECTION_BLOCK],
		template: ROW_TEMPLATE,
		renderAppender: false,
		orientation: 'vertical',
	});

	const handleAddRow = () => {
		insertBlock(createBlock(ROW_SECTION_BLOCK), innerBlocks.length, clientId, false);
	};

	return (
		<Fragment>

			<InspectorControls group="settings">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'layout'}
					onToggle={() => toggleSettingsPanel('layout')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Divider Gap', 'uplifters-site-builder-blocks')}
						value={getPxNumber(dividerGap, 0)}
						min={0}
						max={120}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'dividerGap',
								device,
								`${value}px`
							);
						}}
						help={__(
							'Space between each row in this block. 0 stacks the rows with no space at all.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() => toggleStylesPanel('spacing')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Padding', 'uplifters-site-builder-blocks')}
						value={getPxNumber(padding, 24)}
						min={0}
						max={120}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'padding',
								device,
								`${value}px`
							);
						}}
					/>

					<RangeControl
						label={__('Margin', 'uplifters-site-builder-blocks')}
						value={getPxNumber(margin, 0)}
						min={0}
						max={120}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'margin',
								device,
								`${value}px`
							);
						}}
					/>

					<RangeControl
						label={__('Border Radius', 'uplifters-site-builder-blocks')}
						value={getPxNumber(borderRadius, 0)}
						min={0}
						max={100}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'borderRadius',
								device,
								`${value}px`
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() => toggleStylesPanel('colors')}
				>
					<DeviceBadge device={device} />

					<p className="uplifters-site-builder-blocks-row-layout-control-label">
						{__('Background Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={backgroundColor}
						onChange={(color) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'backgroundColor',
								device,
								color || ''
							);
						}}
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div {...innerBlocksProps}>
				{innerBlocksProps.children}

				<div className="uplifters-site-builder-blocks-row-layout-add-more">
					<Button
						variant="secondary"
						onClick={handleAddRow}
					>
						{__('Add More', 'uplifters-site-builder-blocks')}
					</Button>
				</div>
			</div>
		</Fragment>
	);
}

export default function Edit( props ) {
	return props.attributes.preview ? (
		<InserterPreview type="row-layout" />
	) : (
		<Editor { ...props } />
	);
}

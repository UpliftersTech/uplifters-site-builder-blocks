import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	Fragment,
} from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	InspectorControls,
	Inserter,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	ColorPalette,
	RangeControl,
	Tooltip,
} from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';

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

const DEVICE_LABELS = {
	desktop: __('Desktop', 'uplifters-site-builder-blocks'),
	tablet: __('Tablet', 'uplifters-site-builder-blocks'),
	mobile: __('Mobile', 'uplifters-site-builder-blocks'),
};

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

/*
 * Measures the vertical centre of every row so the delete controls layer can
 * park one button beside each row. The layer is a child of the rows' container,
 * so its parent is the offset parent every row is measured against.
 *
 * `orderKey` changes whenever the active device's row order changes. Reordering
 * moves the rows without resizing anything, so the ResizeObserver below never
 * fires for it and the measurement has to be re-run from the dependency list.
 */
function useRowCentres(overlayRef, rowClientIds, orderKey) {
	const [centres, setCentres] = useState([]);

	useLayoutEffect(() => {
		const overlay = overlayRef.current;
		const container = overlay?.parentElement;

		if (!container) {
			setCentres([]);
			return undefined;
		}

		const measure = () => {
			setCentres(
				rowClientIds
					.map((rowClientId) => {
						const row = container.querySelector(
							`[data-block="${rowClientId}"]`
						);

						if (!row) {
							return null;
						}

						return {
							clientId: rowClientId,
							centre: row.offsetTop + row.offsetHeight / 2,
						};
					})
					.filter(Boolean)
			);
		};

		measure();

		const view = container.ownerDocument.defaultView;

		if (!view || !view.ResizeObserver) {
			return undefined;
		}

		// A row grows as it is edited, so the buttons follow the rendered
		// heights rather than a single measurement taken on mount.
		const observer = new view.ResizeObserver(measure);

		observer.observe(container);

		Array.from(container.children).forEach((child) => {
			if (child !== overlay) {
				observer.observe(child);
			}
		});

		return () => observer.disconnect();
	}, [overlayRef, rowClientIds, orderKey]);

	return centres;
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

	const rowClientIds = useSelect(
		(select) => select('core/block-editor').getBlockOrder(clientId),
		[clientId]
	);

	/*
	 * Row labels for the reorder control. Joined into one string so the mapped
	 * value compares by value: an array would be a new reference on every store
	 * change and re-render the block each time.
	 */
	const rowLabelKey = useSelect(
		(select) => {
			const { getBlockOrder, getBlockName } = select('core/block-editor');
			const { getBlockType } = select('core/blocks');

			return getBlockOrder(clientId)
				.map(
					(rowClientId) =>
						getBlockType(getBlockName(rowClientId))?.title || ''
				)
				.join('\n');
		},
		[clientId]
	);

	const {
		removeBlock,
		moveBlocksToPosition,
		__unstableMarkNextChangeAsNotPersistent,
	} = useDispatch('core/block-editor');

	const rowControlsRef = useRef(null);

	/**
	 * Empty rows waiting to be filled. They are editor-only placeholders, not
	 * blocks, so an unused one never reaches the saved content.
	 */
	const [emptyRows, setEmptyRows] = useState(0);
	const filledRowCount = useRef(rowClientIds.length);

	useEffect(() => {
		const added = rowClientIds.length - filledRowCount.current;

		filledRowCount.current = rowClientIds.length;

		if (rowClientIds.length === 0) {
			// A block with nothing in it always offers one empty row.
			setEmptyRows((count) => (count === 0 ? 1 : count));
			return;
		}

		if (added > 0) {
			// Each block that lands in the layout consumes one empty row.
			setEmptyRows((count) => Math.max(0, count - added));
		}
	}, [rowClientIds.length]);

	/*
	 * Row order for the active device. Every row is one slot, filled rows first
	 * and the empty placeholders after them, so a slot the visitor will never
	 * see keeps a position in the editor all the same.
	 */
	const slotCount = rowClientIds.length + emptyRows;

	const orderObject = useMemo(
		() => resolveOrder(attributes.childOrder, slotCount),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(attributes.childOrder), slotCount]
	);

	const orderSequence = orderObject[device];
	const orderKey = orderSequence.join(',');

	/*
	 * Desktop is the document order itself, so a desktop reorder moves the real
	 * blocks and leaves childOrder.desktop natural. Only the narrower devices
	 * keep a saved order of their own.
	 */
	const setOrderForDevice = (nextSequence) => {
		if (device !== 'desktop') {
			setAttributes({
				childOrder: { ...orderObject, [device]: nextSequence },
			});

			return;
		}

		const move = getDocumentMove(
			getNaturalOrder(nextSequence.length),
			nextSequence
		);

		// An empty row is a placeholder, not a block, so it cannot be moved in
		// the document; only the filled rows have something to reorder.
		if (!move || !rowClientIds[move.from] || move.to >= rowClientIds.length) {
			return;
		}

		moveBlocksToPosition(
			[rowClientIds[move.from]],
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
	const documentOrderRef = useRef(null);

	useEffect(() => {
		const currentIds = rowClientIds;
		const previousIds = documentOrderRef.current;

		documentOrderRef.current = currentIds;

		// First run, or a row was added or removed rather than moved.
		if (!previousIds || previousIds.length !== currentIds.length) {
			return;
		}

		const move = getDocumentMove(previousIds, currentIds);

		if (!move) {
			return;
		}

		if (device === 'desktop') {
			setAttributes({
				childOrder: {
					desktop: getNaturalOrder(slotCount),
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
			});

			return;
		}

		const sequence = orderObject[device];
		const position = sequence.indexOf(move.from + 1);

		if (position === -1) {
			return;
		}

		// The arrows step through the document, so the same step is applied to
		// what this device shows rather than to the document position.
		const target = Math.max(
			0,
			Math.min(sequence.length - 1, position + (move.to - move.from))
		);

		documentOrderRef.current = previousIds;

		if (typeof __unstableMarkNextChangeAsNotPersistent === 'function') {
			__unstableMarkNextChangeAsNotPersistent();
		}

		moveBlocksToPosition([move.clientId], clientId, clientId, move.from);

		setAttributes({
			childOrder: {
				...orderObject,
				[device]: withSlotMoved(sequence, position, target),
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rowClientIds, device]);

	const rowLabels = useMemo(
		() => (rowLabelKey === '' ? [] : rowLabelKey.split('\n')),
		[rowLabelKey]
	);

	const rowCentres = useRowCentres(rowControlsRef, rowClientIds, orderKey);

	const padding = getResponsiveValue(attributes, 'padding', device);
	const margin = getResponsiveValue(attributes, 'margin', device);
	const borderRadius = getResponsiveValue(attributes, 'borderRadius', device);
	const backgroundColor = getResponsiveValue(attributes, 'backgroundColor', device);
	const dividerGap = getResponsiveValue(attributes, 'dividerGap', device);

	// Previews the active device's row order in the canvas.
	const orderRef = useChildOrder(orderSequence);

	const blockProps = useBlockProps({
		ref: orderRef,
		className: `uplifters-site-builder-blocks-row-layout-editor-wrapper uplifters-site-builder-blocks-row-layout-device-${device}`,
		style: {
			padding: padding || undefined,
			margin: margin || undefined,
			borderRadius: borderRadius || undefined,
			backgroundColor: backgroundColor || undefined,
			gap: dividerGap || undefined,
		},
	});

	// The empty rows below replace the default appender.
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		renderAppender: false,
		orientation: 'vertical',
	});

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

					<ResponsiveOrderControl
						sequence={orderSequence}
						labels={rowLabels}
						deviceLabel={DEVICE_LABELS[device] || DEVICE_LABELS.desktop}
						onChange={setOrderForDevice}
						help={__(
							'Moving a row in the canvas does the same thing. With Tablet or Mobile active the move applies to that device only; on Desktop it moves the row for every device.',
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

				{rowClientIds.length > 0 && (
					<div
						className="uplifters-site-builder-blocks-row-layout-row-controls"
						ref={rowControlsRef}
					>
						{rowCentres.map(({ clientId: rowClientId, centre }) => (
							<div
								key={rowClientId}
								className="uplifters-site-builder-blocks-row-layout-row-control"
								style={{ top: `${centre}px` }}
							>
								<Tooltip
									text={__(
										'Delete row',
										'uplifters-site-builder-blocks'
									)}
								>
									<Button
										className="uplifters-site-builder-blocks-row-layout-row-delete"
										icon={trash}
										label={__(
											'Delete row',
											'uplifters-site-builder-blocks'
										)}
										onClick={() =>
											removeBlock(rowClientId)
										}
									/>
								</Tooltip>
							</div>
						))}
					</div>
				)}

				{Array.from({ length: emptyRows }).map((ignored, index) => (
					<div
						key={index}
						className="uplifters-site-builder-blocks-row-layout-empty-row"
						style={{
							order: getSlotOrder(
								orderSequence,
								rowClientIds.length + index + 1
							),
						}}
					>
						<div className="uplifters-site-builder-blocks-row-layout-empty-row-inserter">
							<Inserter
								rootClientId={clientId}
								isAppender
								renderToggle={({ onToggle, disabled }) => (
									<Button
										className="uplifters-site-builder-blocks-row-layout-empty-row-add"
										icon={plus}
										label={__(
											'Add block',
											'uplifters-site-builder-blocks'
										)}
										onClick={onToggle}
										disabled={disabled}
									/>
								)}
							/>
						</div>

						<div className="uplifters-site-builder-blocks-row-layout-row-control">
							<Tooltip
								text={__(
									'Delete row',
									'uplifters-site-builder-blocks'
								)}
							>
								<Button
									className="uplifters-site-builder-blocks-row-layout-row-delete"
									icon={trash}
									label={__(
										'Delete row',
										'uplifters-site-builder-blocks'
									)}
									onClick={() =>
										setEmptyRows((count) =>
											Math.max(0, count - 1)
										)
									}
								/>
							</Tooltip>
						</div>
					</div>
				))}

				<div
					className="uplifters-site-builder-blocks-row-layout-add-more"
					style={{ order: EDITOR_CHROME_ORDER }}
				>
					<Button
						variant="secondary"
						onClick={() => setEmptyRows((count) => count + 1)}
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

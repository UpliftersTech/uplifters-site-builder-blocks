import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import './editor.scss';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
	BoxControl,
	Spinner,
	Notice,
	CheckboxControl,
	Button,
	ColorPalette,
} from "@wordpress/components";
import { useEffect, useMemo, useState } from "@wordpress/element";

// Change this path only if your API file is in another location.
import { fetchPages } from "../../api-requests";
import { FontFamilyControl, getFontFamilyCss } from "../../assets-shared/fonts-family/font-family-control";

const RESPONSIVE_DEVICES = ["desktop", "tablet", "mobile"];
const POSITION_VALUES = ["start", "center", "end"];

function getCurrentGlobalResponsiveDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === "function"
	) {
		const device = window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		return RESPONSIVE_DEVICES.includes(device)
			? device
			: "desktop";
	}

	return "desktop";
}

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
					: "desktop"
			);
		}

		window.addEventListener(
			"uplifters-site-builder-blocks-responsive-device-change",
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
				"uplifters-site-builder-blocks-responsive-device-change",
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	return device;
}


const buildTree = (pages) => {
	const byParent = new Map();

	for (const page of pages) {
		const parent = Number(page.parent || 0);

		if (!byParent.has(parent)) {
			byParent.set(parent, []);
		}

		byParent.get(parent).push(page);
	}

	for (const [parent, children] of byParent.entries()) {
		children.sort(
			(a, b) =>
				a.menu_order - b.menu_order ||
				String(a.title).localeCompare(String(b.title))
		);

		byParent.set(parent, children);
	}

	return byParent;
};

const toPaddingStyle = (box = {}) => ({
	paddingTop: box?.top || "0px",
	paddingRight: box?.right || "0px",
	paddingBottom: box?.bottom || "0px",
	paddingLeft: box?.left || "0px",
});

const getPositionMargins = (position) => {
	if (position === "center") {
		return {
			marginLeft: "auto",
			marginRight: "auto",
		};
	}

	if (position === "end") {
		return {
			marginLeft: "auto",
			marginRight: "0",
		};
	}

	return {
		marginLeft: "0",
		marginRight: "auto",
	};
};

const normalizeOrphanParentsToRoot = (
	pages,
	visibleSet
) =>
	pages.map((page) => {
		const parent = Number(page.parent || 0);

		if (parent !== 0 && !visibleSet.has(parent)) {
			return {
				...page,
				parent: 0,
			};
		}

		return page;
	});

const computeVisiblePages = (
	allPages,
	selectedIds
) => {
	const selected = new Set(
		(selectedIds || []).map((id) => Number(id))
	);

	if (selected.size === 0) {
		return {
			visiblePages: allPages,
			visibleSet: new Set(
				allPages.map((page) => Number(page.id))
			),
		};
	}

	const childrenByParent = new Map();

	for (const page of allPages) {
		const parent = Number(page.parent || 0);

		if (!childrenByParent.has(parent)) {
			childrenByParent.set(parent, []);
		}

		childrenByParent
			.get(parent)
			.push(Number(page.id));
	}

	const visibleSet = new Set(selected);

	const addDescendants = (id) => {
		const children =
			childrenByParent.get(id) || [];

		for (const childId of children) {
			if (!visibleSet.has(childId)) {
				visibleSet.add(childId);
				addDescendants(childId);
			}
		}
	};

	for (const id of selected) {
		addDescendants(id);
	}

	const filtered = allPages.filter((page) =>
		visibleSet.has(Number(page.id))
	);

	const normalized =
		normalizeOrphanParentsToRoot(
			filtered,
			visibleSet
		);

	return {
		visiblePages: normalized,
		visibleSet,
	};
};

const getResponsiveValue = (
	value,
	device,
	fallback = ""
) => {
	if (
		value &&
		typeof value === "object" &&
		!Array.isArray(value)
	) {
		return (
			value[device] ??
			value.desktop ??
			value.tablet ??
			value.mobile ??
			fallback
		);
	}

	return value ?? fallback;
};

const setResponsiveValue = (
	value,
	device,
	nextValue
) => {
	const currentValue =
		value &&
		typeof value === "object" &&
		!Array.isArray(value)
			? value
			: {};

	return {
		...currentValue,
		[device]: nextValue,
	};
};

const DeviceBadge = ({ device }) => {
	let label = "Desktop variant";

	if (device === "tablet") {
		label = "Tablet variant";
	}

	if (device === "mobile") {
		label = "Mobile variant";
	}

	return (
		<div className="uplifters-site-builder-blocks-page-grid-device-badge">
			{label}
		</div>
	);
};

const TitleList = ({
	tree,
	parentId = 0,
	depth = 0,
	titleStyle,
}) => {
	const children = tree.get(parentId) || [];

	if (!children.length) {
		return null;
	}

	const ulClass =
		depth === 0
			? "up2-root-grid"
			: "up2-nested";

	return (
		<ul
			className={ulClass}
			style={{
				listStyle: "none",
				padding: 0,
				marginTop: 0,
				marginBottom: 0,
			}}
		>
			{children.map((page) => (
				<li
					key={page.id}
					className="up2-page-li"
					style={{
						listStyle: "none",
						margin: 0,
						padding: 0,
						display: "block",
						width: "max-content",
						maxWidth: "100%",
					}}
				>
					<a
						href={page.permalink}
						target="_blank"
						rel="noreferrer"
						className="up2-item"
						style={{
							display: "inline-block",
							width: "auto",
							maxWidth: "100%",
							borderRadius: "0.75rem",
							backgroundColor:
								"transparent",
							transition:
								"background-color 0.15s ease, color 0.15s ease",
						}}
					>
						<div
							className="up2-title"
							style={{
								...titleStyle,
								display:
									"inline-block",
								width: "auto",
								maxWidth: "100%",
								overflowWrap:
									"break-word",
								wordBreak:
									"break-word",
								lineHeight: 1.375,
								fontWeight: 600,
							}}
						>
							{page.title ||
								"Untitled"}
						</div>
					</a>

					<TitleList
						tree={tree}
						parentId={page.id}
						depth={depth + 1}
						titleStyle={titleStyle}
					/>
				</li>
			))}
		</ul>
	);
};

const PagePickerTree = ({
	tree,
	selectedSet,
	onToggle,
	parentId = 0,
	depth = 0,
}) => {
	const children = tree.get(parentId) || [];

	if (!children.length) {
		return null;
	}

	return (
		<div
			style={
				depth === 0
					? undefined
					: {
							marginLeft: "1rem",
							paddingLeft:
								"0.5rem",
							borderLeft:
								"1px solid #e2e8f0",
					  }
			}
		>
			{children.map((page) => {
				const id = Number(page.id);
				const checked =
					selectedSet.has(id);

				return (
					<div
						key={id}
						style={{
							marginTop:
								depth === 0
									? 6
									: 4,
						}}
					>
						<CheckboxControl
							label={
								page.title ||
								`Untitled (#${id})`
							}
							checked={checked}
							onChange={() =>
								onToggle(id)
							}
						/>

						<PagePickerTree
							tree={tree}
							selectedSet={
								selectedSet
							}
							onToggle={onToggle}
							parentId={id}
							depth={depth + 1}
						/>
					</div>
				);
			})}
		</div>
	);
};

function Editor({
	attributes,
	setAttributes,
}) {
	const {
		perPage,
		itemsPerRow,
		position,
		selectedPageIds,
		titlePadding,
		titleBg,
		titleColor,
		titleFontSize,
		titleFontFamily,
		hoverBg,
		hoverTextColor,
	} = attributes;

	const device = useGlobalResponsiveDevice();

	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");

	const [
		openSettingsPanel,
		setOpenSettingsPanel,
	] = useState(null);

	const [
		openStylesPanel,
		setOpenStylesPanel,
	] = useState(null);

	const defaultItemsPerRow =
		device === "tablet"
			? 2
			: device === "mobile"
				? 1
				: 3;

	const defaultTitleFontSize =
		device === "tablet"
			? 11
			: device === "mobile"
				? 14
				: 13;

	const currentItemsPerRow =
		getResponsiveValue(
			itemsPerRow,
			device,
			defaultItemsPerRow
		);

	const safeItemsPerRow = Math.max(
		1,
		Math.min(
			Number(
				currentItemsPerRow ||
					defaultItemsPerRow
			),
			12
		)
	);

	const rawCurrentPosition =
		getResponsiveValue(
			position,
			device,
			"start"
		);

	const currentPosition =
		POSITION_VALUES.includes(
			rawCurrentPosition
		)
			? rawCurrentPosition
			: "start";

	const positionMargins =
		getPositionMargins(currentPosition);

	const currentTitlePadding =
		getResponsiveValue(
			titlePadding,
			device,
			{
				top: "3px",
				right: "3px",
				bottom: "3px",
				left: "3px",
			}
		);

	const currentTitleBg =
		getResponsiveValue(
			titleBg,
			device,
			""
		);

	const currentTitleColor =
		getResponsiveValue(
			titleColor,
			device,
			"#0f172a"
		);

	const currentTitleFontSize =
		getResponsiveValue(
			titleFontSize,
			device,
			defaultTitleFontSize
		);

	const currentTitleFontFamily =
		getResponsiveValue(
			titleFontFamily,
			device,
			""
		);

	const currentHoverBg =
		getResponsiveValue(
			hoverBg,
			device,
			"#e2e8f0"
		);

	const currentHoverTextColor =
		getResponsiveValue(
			hoverTextColor,
			device,
			"#0f172a"
		);

	const updateResponsiveAttribute = (
		key,
		value
	) => {
		setAttributes({
			[key]: setResponsiveValue(
				attributes[key],
				device,
				value
			),
		});
	};

	const pagesTreeAll = useMemo(
		() => buildTree(pages),
		[pages]
	);

	const selectedSet = useMemo(
		() =>
			new Set(
				(selectedPageIds || []).map(
					(id) => Number(id)
				)
			),
		[selectedPageIds]
	);

	const onTogglePage = (id) => {
		const next = new Set(selectedSet);

		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}

		setAttributes({
			selectedPageIds: Array.from(next),
		});
	};

	const { visiblePages } = useMemo(
		() =>
			computeVisiblePages(
				pages,
				selectedPageIds
			),
		[pages, selectedPageIds]
	);

	const visibleTree = useMemo(
		() => buildTree(visiblePages),
		[visiblePages]
	);

	const titleStyle = useMemo(() => {
		const fontSize = Number(
			currentTitleFontSize ||
				defaultTitleFontSize
		);

		return {
			...toPaddingStyle(
				currentTitlePadding
			),
			backgroundColor:
				currentTitleBg || "transparent",
			color:
				currentTitleColor || "inherit",
			fontSize: `${
				Number.isFinite(fontSize)
					? fontSize
					: defaultTitleFontSize
			}px`,
			fontFamily:
				getFontFamilyCss(currentTitleFontFamily),
		};
	}, [
		currentTitlePadding,
		currentTitleBg,
		currentTitleColor,
		currentTitleFontSize,
		currentTitleFontFamily,
		defaultTitleFontSize,
	]);

	useEffect(() => {
		let alive = true;

		setLoading(true);
		setErr("");

		fetchPages({ perPage })
			.then((data) => {
				if (!alive) {
					return;
				}

				setPages(
					Array.isArray(data)
						? data
						: []
				);
			})
			.catch((error) => {
				if (!alive) {
					return;
				}

				setErr(
					error?.message ||
						"Failed to load pages."
				);
			})
			.finally(() => {
				if (!alive) {
					return;
				}

				setLoading(false);
			});

		return () => {
			alive = false;
		};
	}, [perPage]);

	const blockProps = useBlockProps({
		className: `up2-m-sub uplifters-site-builder-blocks-page-grid-device-${device}`,
		style: {
			"--up2-hover-bg":
				currentHoverBg || "#e2e8f0",
			"--up2-hover-text":
				currentHoverTextColor ||
				"#0f172a",
			"--up2-items-per-row":
				safeItemsPerRow,
			"--up2-grid-margin-left":
				positionMargins.marginLeft,
			"--up2-grid-margin-right":
				positionMargins.marginRight,
			width: "100%",
			maxWidth: "100%",
			overflow: "visible",
		},
	});

	return (
		<>

			<InspectorControls group="settings">
				<PanelBody
					title="Query"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						"pages-query"
					}
					onToggle={() =>
						setOpenSettingsPanel(
							(current) =>
								current ===
								"pages-query"
									? null
									: "pages-query"
						)
					}
				>
					<RangeControl
						label="How many pages?"
						value={Number(
							perPage || 10
						)}
						onChange={(value) =>
							setAttributes({
								perPage:
									value ?? 10,
							})
						}
						min={1}
						max={1000}
					/>
				</PanelBody>

				<PanelBody
					title="Pages"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						"show-pages"
					}
					onToggle={() =>
						setOpenSettingsPanel(
							(current) =>
								current ===
								"show-pages"
									? null
									: "show-pages"
						)
					}
				>
					{loading && (
						<div
							style={{
								display: "flex",
								alignItems:
									"center",
								gap: "0.5rem",
								color: "#475569",
							}}
						>
							<Spinner />
							<span
								style={{
									fontSize:
										"0.875rem",
								}}
							>
								Loading pages…
							</span>
						</div>
					)}

					{!loading && err && (
						<Notice
							status="error"
							isDismissible={false}
						>
							{err}
						</Notice>
					)}

					{!loading &&
						!err &&
						pages.length === 0 && (
							<div
								style={{
									fontSize:
										"0.875rem",
									color:
										"#475569",
								}}
							>
								No pages found.
							</div>
						)}

					{!loading &&
						!err &&
						pages.length > 0 && (
							<>
								<div
									style={{
										fontSize:
											"0.75rem",
										color:
											"#475569",
									}}
								>
									<b>Note:</b> If
									you do not
									select
									anything, all
									pages will be
									shown by
									default.
								</div>

								<div
									style={{
										display:
											"flex",
										gap:
											"0.5rem",
										marginTop:
											"0.5rem",
									}}
								>
									<Button
										variant="secondary"
										onClick={() =>
											setAttributes(
												{
													selectedPageIds:
														[],
												}
											)
										}
									>
										Show All
										(Clear
										Selection)
									</Button>
								</div>

								<div
									style={{
										marginTop:
											"0.75rem",
									}}
								>
									<PagePickerTree
										tree={
											pagesTreeAll
										}
										selectedSet={
											selectedSet
										}
										onToggle={
											onTogglePage
										}
									/>
								</div>
							</>
						)}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title="Layout"
					initialOpen={false}
					opened={
						openStylesPanel ===
						"layout"
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								"layout"
									? null
									: "layout"
						)
					}
				>
					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label="Pages per row"
						value={safeItemsPerRow}
						onChange={(value) =>
							updateResponsiveAttribute(
								"itemsPerRow",
								value ??
									defaultItemsPerRow
							)
						}
						min={1}
						max={12}
						help="This value is saved only for the active global responsive device."
					/>

					<SelectControl
						label="Position"
						value={currentPosition}
						options={[
							{
								label: "Start",
								value: "start",
							},
							{
								label: "Center",
								value: "center",
							},
							{
								label: "End",
								value: "end",
							},
						]}
						onChange={(value) =>
							updateResponsiveAttribute(
								"position",
								POSITION_VALUES.includes(
									value
								)
									? value
									: "start"
							)
						}
						help="Controls the position of the page grid for the active responsive device."
					/>
				</PanelBody>

				<PanelBody
					title="Spacing"
					initialOpen={false}
					opened={
						openStylesPanel ===
						"spacing"
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								"spacing"
									? null
									: "spacing"
						)
					}
				>
					<DeviceBadge
						device={device}
					/>

					<BoxControl
						label="Title Padding"
						values={
							currentTitlePadding
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								"titlePadding",
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
						"typography"
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								"typography"
									? null
									: "typography"
						)
					}
				>
					<DeviceBadge
						device={device}
					/>

					<FontFamilyControl
						label="Font Family"
						value={
							currentTitleFontFamily
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								"titleFontFamily",
								value || ""
							)
						}
						help="This value is saved only for the active global responsive device."
					/>

					<RangeControl
						label="Title Font Size (px)"
						value={Number(
							currentTitleFontSize ||
								defaultTitleFontSize
						)}
						onChange={(value) =>
							updateResponsiveAttribute(
								"titleFontSize",
								value ??
									defaultTitleFontSize
							)
						}
						min={10}
						max={40}
					/>
				</PanelBody>

				<PanelBody
					title="Colors"
					initialOpen={false}
					opened={
						openStylesPanel ===
						"colors"
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								"colors"
									? null
									: "colors"
						)
					}
				>
					<DeviceBadge
						device={device}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							Title Color
						</div>

						<ColorPalette
							value={
								currentTitleColor
							}
							onChange={(color) =>
								updateResponsiveAttribute(
									"titleColor",
									color ||
										"#0f172a"
								)
							}
							enableAlpha
						/>
					</div>

					<div
						style={{
							height: "0.75rem",
						}}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							Title Background
						</div>

						<ColorPalette
							value={currentTitleBg}
							onChange={(color) =>
								updateResponsiveAttribute(
									"titleBg",
									color || ""
								)
							}
							enableAlpha
						/>
					</div>

					<div
						style={{
							height: "0.75rem",
						}}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							Hover Background
						</div>

						<ColorPalette
							value={currentHoverBg}
							onChange={(color) =>
								updateResponsiveAttribute(
									"hoverBg",
									color ||
										"#e2e8f0"
								)
							}
							enableAlpha
						/>
					</div>

					<div
						style={{
							height: "0.75rem",
						}}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							Hover Text Color
						</div>

						<ColorPalette
							value={
								currentHoverTextColor
							}
							onChange={(color) =>
								updateResponsiveAttribute(
									"hoverTextColor",
									color ||
										"#0f172a"
								)
							}
							enableAlpha
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{loading && (
					<div
						style={{
							display:
								"inline-flex",
							alignItems:
								"center",
							gap: "0.5rem",
							color: "#475569",
						}}
					>
						<Spinner />

						<span
							style={{
								fontSize:
									"0.875rem",
							}}
						>
							Loading pages…
						</span>
					</div>
				)}

				{!loading && err && (
					<Notice
						status="error"
						isDismissible={false}
					>
						{err}
					</Notice>
				)}

				{!loading &&
					!err &&
					visiblePages.length === 0 && (
						<div
							style={{
								fontSize:
									"0.875rem",
								color: "#475569",
							}}
						>
							No pages found.
						</div>
					)}

				{!loading &&
					!err &&
					visiblePages.length > 0 && (
						<TitleList
							tree={visibleTree}
							titleStyle={titleStyle}
						/>
					)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="page-grid" /> : <Editor {...props} />;
}

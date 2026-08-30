import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from "@wordpress/i18n";
import { InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	Button,
	SelectControl,
	ColorPalette,
} from "@wordpress/components";
import { Fragment, useEffect, useRef, useState } from "@wordpress/element";
import { ResponsiveFontFamilyControl, getFontFamilyCss } from "../../assets-shared/fonts-family/font-family-control";

function normalizeDevice(device) {
	return ["desktop", "tablet", "mobile"].includes(device) ? device : "desktop";
}

function getGlobalResponsiveDevice() {
	if (
		typeof window !== "undefined" &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === "function"
	) {
		return normalizeDevice(window.UpliftersSiteBuilderBlocksResponsive.getDevice());
	}

	return "desktop";
}

/**
 * Global Responsive Device Tracking hook.
 *
 * The block does not render its own desktop/tablet/mobile switcher. It follows
 * the global floating responsive toolbar/device context and updates only the
 * active device branch.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getGlobalResponsiveDevice());

	useEffect(() => {
		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(normalizeDevice(event.detail.device));
				return;
			}

			setDevice(getGlobalResponsiveDevice());
		}

		window.addEventListener("uplifters-site-builder-blocks-responsive-device-change", handleDeviceChange);

		const interval = window.setInterval(() => {
			const nextDevice = getGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice ? nextDevice : currentDevice
			);
		}, 500);

		return () => {
			window.removeEventListener("uplifters-site-builder-blocks-responsive-device-change", handleDeviceChange);
			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(attributes, key, device, fallback = "") {
	const value = attributes[key];

	if (value && typeof value === "object" && !Array.isArray(value)) {
		return (
			value[device] ??
			value.desktop ??
			value.tablet ??
			value.mobile ??
			fallback
		);
	}

	return value ?? fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
	const current =
		attributes[key] && typeof attributes[key] === "object" && !Array.isArray(attributes[key])
			? attributes[key]
			: { desktop: attributes[key] ?? undefined };

	setAttributes({
		[key]: {
			...current,
			[device]: value,
		},
	});
}

function DeviceBadge({ device }) {
	let label = __("Desktop variant", "uplifters-site-builder-blocks");

	if (device === "tablet") label = __("Tablet variant", "uplifters-site-builder-blocks");
	if (device === "mobile") label = __("Mobile variant", "uplifters-site-builder-blocks");

	return <div className="uplifters-site-builder-blocks-accordion-icon-custom-device-badge">{label}</div>;
}

function uid() {
	return `acc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createItem(nextIndex = 1) {
	return {
		id: uid(),
		title: `Accordion #${nextIndex}`,
		content: "",
		isOpen: false,
	};
}

const IconChevronDown = ({ className = "" }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="m6 9 6 6 6-6" />
	</svg>
);

const IconChevronUp = ({ className = "" }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="m18 15-6-6-6 6" />
	</svg>
);

const IconPlus = ({ className = "" }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M12 5v14" />
		<path d="M5 12h14" />
	</svg>
);

const IconTrash = ({ className = "" }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M3 6h18" />
		<path d="M8 6V4h8v2" />
		<path d="M19 6l-1 14H6L5 6" />
		<path d="M10 11v6" />
		<path d="M14 11v6" />
	</svg>
);

const IconDrag = ({ className = "" }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<circle cx="9" cy="7" r="1.2" />
		<circle cx="15" cy="7" r="1.2" />
		<circle cx="9" cy="12" r="1.2" />
		<circle cx="15" cy="12" r="1.2" />
		<circle cx="9" cy="17" r="1.2" />
		<circle cx="15" cy="17" r="1.2" />
	</svg>
);

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();

	const {
		heading,
		items = [],
		defaultOpenId,
	} = attributes;

	const headingFontFamily = getResponsiveValue(attributes, "headingFontFamily", device, "default");
	const headingFontSize = getResponsiveValue(attributes, "headingFontSize", device, 28);
	const headingColor = getResponsiveValue(attributes, "headingColor", device, "");

	const titleFontFamily = getResponsiveValue(attributes, "titleFontFamily", device, "default");
	const titleFontSize = getResponsiveValue(attributes, "titleFontSize", device, 16);
	const titleColor = getResponsiveValue(attributes, "titleColor", device, "");

	const contentFontFamily = getResponsiveValue(attributes, "contentFontFamily", device, "default");
	const contentFontSize = getResponsiveValue(attributes, "contentFontSize", device, 14);
	const contentColor = getResponsiveValue(attributes, "contentColor", device, "");

	const dragIdRef = useRef(null);

	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);
	const toggleSettingsPanel = (key) => setOpenSettingsPanel((current) => (current === key ? null : key));
	const toggleStylesPanel = (key) => setOpenStylesPanel((current) => (current === key ? null : key));

	const blockProps = useBlockProps({
		className: `wp-block-uplifters-site-builder-blocks-accordion-icon-custom uplifters-site-builder-blocks-accordion-icon-custom-device-${device}`,
	});

	const headingStyle = {
		fontFamily: getFontFamilyCss(headingFontFamily),
		fontSize: headingFontSize ? `${headingFontSize}px` : undefined,
		color: headingColor || undefined,
	};

	const titleStyle = {
		fontFamily: getFontFamilyCss(titleFontFamily),
		fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
		color: titleColor || undefined,
	};

	const contentStyle = {
		fontFamily: getFontFamilyCss(contentFontFamily),
		fontSize: contentFontSize ? `${contentFontSize}px` : undefined,
		color: contentColor || undefined,
	};

	const updateItem = (id, patch) => {
		const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
		setAttributes({ items: next });
	};

	const setOpenById = (idOrNone) => {
		const nextDefault = idOrNone || "";
		const nextItems = items.map((it) => ({
			...it,
			isOpen: !!nextDefault && it.id === nextDefault,
		}));

		setAttributes({ defaultOpenId: nextDefault, items: nextItems });
	};

	const toggleItem = (id) => {
		const target = items.find((it) => it.id === id);
		if (!target) return;

		const willOpen = !target.isOpen;
		const nextDefaultOpenId = willOpen ? id : "";

		const next = items.map((it) => {
			if (it.id === id) return { ...it, isOpen: willOpen };
			return { ...it, isOpen: false };
		});

		setAttributes({ items: next, defaultOpenId: nextDefaultOpenId });
	};

	const insertAfter = (afterId) => {
		const idx = items.findIndex((it) => it.id === afterId);
		const newItem = createItem(items.length + 1);
		const next = [...items];

		if (idx < 0) next.push(newItem);
		else next.splice(idx + 1, 0, newItem);

		setAttributes({ items: next });
	};

	const removeItem = (id) => {
		if (items.length <= 1) return;

		const next = items.filter((it) => it.id !== id);
		let nextDefault = defaultOpenId || "";
		if (nextDefault === id) nextDefault = "";

		const normalized = next.map((it) => ({
			...it,
			isOpen: !!nextDefault && it.id === nextDefault,
		}));

		setAttributes({ items: normalized, defaultOpenId: nextDefault });
	};

	const reorder = (fromId, toId) => {
		if (!fromId || !toId || fromId === toId) return;

		const fromIndex = items.findIndex((it) => it.id === fromId);
		const toIndex = items.findIndex((it) => it.id === toId);
		if (fromIndex < 0 || toIndex < 0) return;

		const next = [...items];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);

		setAttributes({ items: next });
	};

	const onDragStart = (e, id) => {
		dragIdRef.current = id;
		e.dataTransfer.effectAllowed = "move";

		try {
			e.dataTransfer.setData("text/plain", id);
		} catch (_) {}
	};

	const onDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const onDrop = (e, toId) => {
		e.preventDefault();
		const fromId = dragIdRef.current;
		dragIdRef.current = null;
		reorder(fromId, toId);
	};

	const defaultOpenOptions = [
		{ label: __("None", "uplifters-site-builder-blocks"), value: "" },
		...items.map((it, idx) => ({
			label: it.title ? it.title.replace(/<[^>]*>/g, "") : `Accordion #${idx + 1}`,
			value: it.id,
		})),
	];

	return (
		<Fragment>
			<InspectorControls group="settings">
				<PanelBody
						title={__("Behavior", "uplifters-site-builder-blocks")}
						initialOpen={false}
						opened={openSettingsPanel === "behavior"}
						onToggle={() => toggleSettingsPanel("behavior")}
					>
					<SelectControl
						label={__("Default open item", "uplifters-site-builder-blocks")}
						value={defaultOpenId || ""}
						options={defaultOpenOptions}
						onChange={(val) => setOpenById(val)}
						help={__("Single-open behavior: opening one will close others.", "uplifters-site-builder-blocks")}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
						title={__("Heading", "uplifters-site-builder-blocks")}
						initialOpen={false}
						opened={openStylesPanel === "heading"}
						onToggle={() => toggleStylesPanel("heading")}
					>
					<DeviceBadge device={device} />

					<ResponsiveFontFamilyControl
						label={__("Font Family", "uplifters-site-builder-blocks")}
						device={device}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeName="headingFontFamily"
						getResponsiveValue={getResponsiveValue}
						setResponsiveValue={setResponsiveValue}
					/>
					<RangeControl
						label={__("Font size (px)", "uplifters-site-builder-blocks")}
						value={headingFontSize}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "headingFontSize", device, v)}
						min={12}
						max={72}
					/>
					<p className="components-base-control__label">{__("Color", "uplifters-site-builder-blocks")}</p>
					<ColorPalette
						value={headingColor || undefined}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "headingColor", device, v || "")}
						enableAlpha={true}
					/>
					<Button
						variant="secondary"
						onClick={() => setResponsiveValue(attributes, setAttributes, "headingColor", device, "")}
						style={{ marginTop: 8 }}
					>
						{__("Reset heading color", "uplifters-site-builder-blocks")}
					</Button>
				</PanelBody>

				<PanelBody
						title={__("Title", "uplifters-site-builder-blocks")}
						initialOpen={false}
						opened={openStylesPanel === "title"}
						onToggle={() => toggleStylesPanel("title")}
					>
					<DeviceBadge device={device} />

					<ResponsiveFontFamilyControl
						label={__("Font Family", "uplifters-site-builder-blocks")}
						device={device}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeName="titleFontFamily"
						getResponsiveValue={getResponsiveValue}
						setResponsiveValue={setResponsiveValue}
					/>
					<RangeControl
						label={__("Font size (px)", "uplifters-site-builder-blocks")}
						value={titleFontSize}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "titleFontSize", device, v)}
						min={12}
						max={48}
					/>
					<p className="components-base-control__label">{__("Color", "uplifters-site-builder-blocks")}</p>
					<ColorPalette
						value={titleColor || undefined}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "titleColor", device, v || "")}
						enableAlpha={true}
					/>
					<Button
						variant="secondary"
						onClick={() => setResponsiveValue(attributes, setAttributes, "titleColor", device, "")}
						style={{ marginTop: 8 }}
					>
						{__("Reset title color", "uplifters-site-builder-blocks")}
					</Button>
				</PanelBody>

				<PanelBody
						title={__("Content", "uplifters-site-builder-blocks")}
						initialOpen={false}
						opened={openStylesPanel === "content"}
						onToggle={() => toggleStylesPanel("content")}
					>
					<DeviceBadge device={device} />

					<ResponsiveFontFamilyControl
						label={__("Font Family", "uplifters-site-builder-blocks")}
						device={device}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeName="contentFontFamily"
						getResponsiveValue={getResponsiveValue}
						setResponsiveValue={setResponsiveValue}
					/>
					<RangeControl
						label={__("Font size (px)", "uplifters-site-builder-blocks")}
						value={contentFontSize}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "contentFontSize", device, v)}
						min={12}
						max={48}
					/>
					<p className="components-base-control__label">{__("Color", "uplifters-site-builder-blocks")}</p>
					<ColorPalette
						value={contentColor || undefined}
						onChange={(v) => setResponsiveValue(attributes, setAttributes, "contentColor", device, v || "")}
						enableAlpha={true}
					/>
					<Button
						variant="secondary"
						onClick={() => setResponsiveValue(attributes, setAttributes, "contentColor", device, "")}
						style={{ marginTop: 8 }}
					>
						{__("Reset content color", "uplifters-site-builder-blocks")}
					</Button>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<RichText
					tagName="h3"
					value={heading}
					onChange={(v) => setAttributes({ heading: v })}
					placeholder={__("Accordion Heading…", "uplifters-site-builder-blocks")}
					className="uplifters-site-builder-blocks-accordion-icon-custom__heading"
					style={headingStyle}
					allowedFormats={[]}
				/>

				<div className="uplifters-site-builder-blocks-accordion-icon-custom__group" data-allow-multiple="false">
					{items.map((item, index) => {
						const itemKey = item.id || `item-${index}`;
						const buttonId = `uplifters-site-builder-blocks-accordion-icon-custom-button-${itemKey}`;
						const collapseId = `uplifters-site-builder-blocks-accordion-icon-custom-panel-${itemKey}`;
						const isOpen = !!item.isOpen;

						return (
							<div
								key={itemKey}
								className="uplifters-site-builder-blocks-accordion-icon-custom__editor-item"
								onDragOver={onDragOver}
								onDrop={(e) => onDrop(e, item.id)}
							>
								<div className={`uplifters-site-builder-blocks-accordion-icon-custom__item ${isOpen ? "is-active" : ""}`}>
									<div
										id={buttonId}
										className="uplifters-site-builder-blocks-accordion-icon-custom__toggle"
										role="button"
										tabIndex={0}
										aria-expanded={isOpen ? "true" : "false"}
										aria-controls={collapseId}
										onClick={(event) => {
											if (event.target.closest("[contenteditable='true']")) return;
											toggleItem(item.id);
										}}
										onKeyDown={(event) => {
											if (event.target.closest("[contenteditable='true']")) return;
											if (event.key === "Enter" || event.key === " ") {
												event.preventDefault();
												toggleItem(item.id);
											}
										}}
									>
										<span className="uplifters-site-builder-blocks-accordion-icon-custom__icon" aria-hidden="true">
											<IconChevronDown className={isOpen ? "uplifters-site-builder-blocks-accordion-icon-custom__icon--hidden" : ""} />
											<IconChevronUp className={isOpen ? "" : "uplifters-site-builder-blocks-accordion-icon-custom__icon--hidden"} />
										</span>

										<RichText
											tagName="span"
											value={item.title}
											onChange={(value) => updateItem(item.id, { title: value })}
											placeholder={__(`Accordion #${index + 1}`, "uplifters-site-builder-blocks")}
											className="uplifters-site-builder-blocks-accordion-icon-custom__title"
											style={titleStyle}
											allowedFormats={[]}
										/>
									</div>

									<div
										id={collapseId}
										className={`uplifters-site-builder-blocks-accordion-icon-custom__content ${isOpen ? "" : "is-hidden"}`}
										role="region"
										aria-labelledby={buttonId}
									>
										<RichText
											tagName="p"
											value={item.content}
											onChange={(value) => updateItem(item.id, { content: value })}
											placeholder={__("Accordion content…", "uplifters-site-builder-blocks")}
											className="uplifters-site-builder-blocks-accordion-icon-custom__text"
											style={contentStyle}
										/>
									</div>
								</div>

								<div className="uplifters-site-builder-blocks-accordion-icon-custom__editor-toolbar" aria-label={__("Accordion item controls", "uplifters-site-builder-blocks")}>
									<button
										type="button"
										draggable
										onDragStart={(event) => onDragStart(event, item.id)}
										className="uplifters-site-builder-blocks-accordion-icon-custom__editor-action uplifters-site-builder-blocks-accordion-icon-custom__editor-action--drag"
										aria-label={__("Drag to reorder", "uplifters-site-builder-blocks")}
										title={__("Drag to reorder", "uplifters-site-builder-blocks")}
										onClick={(event) => event.preventDefault()}
									>
										<IconDrag />
									</button>

									<button
										type="button"
										className="uplifters-site-builder-blocks-accordion-icon-custom__editor-action"
										aria-label={__("Add accordion after this item", "uplifters-site-builder-blocks")}
										title={__("Add accordion after this item", "uplifters-site-builder-blocks")}
										onClick={() => insertAfter(item.id)}
									>
										<IconPlus />
									</button>

									<button
										type="button"
										className="uplifters-site-builder-blocks-accordion-icon-custom__editor-action"
										aria-label={__("Delete item", "uplifters-site-builder-blocks")}
										title={__("Delete item", "uplifters-site-builder-blocks")}
										onClick={() => removeItem(item.id)}
										disabled={items.length <= 1}
									>
										<IconTrash />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Fragment>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="accordion-icon-custom" /> : <Editor {...props} />;
}

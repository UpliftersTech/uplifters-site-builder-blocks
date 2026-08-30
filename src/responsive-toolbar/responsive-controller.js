(function (wp) {
	'use strict';

	if (!wp || !wp.element || !wp.components || !wp.data || !wp.domReady) {
		console.warn('UPLIFTERS_SITE_BUILDER_BLOCKS Responsive: Required wp packages not found.');
		return;
	}

	const { createElement, useEffect, useState } = wp.element;
	const { Button, Tooltip } = wp.components;
	const { __ } = wp.i18n || { __: (text) => text };

	const STORE_KEY = 'upliftersSiteBuilderBlocksResponsiveDevice';
	const POSITION_KEY = 'upliftersSiteBuilderBlocksResponsiveBarPosition';

	const DEFAULT_DEVICE = 'desktop';
	const ROOT_ID = 'uplifters-site-builder-blocks-responsive-floating-root';
	const IFRAME_STYLE_ID = 'uplifters-site-builder-blocks-responsive-iframe-style';

	/*
	 * The WordPress-enqueued <link> id for this file's own editor.css
	 * (wp_enqueue_style() suffixes the registered handle with "-css").
	 * The iframe canvas fix rules below live in that same stylesheet, so
	 * iframes are linked to it directly instead of having CSS text injected.
	 */
	const EDITOR_STYLE_LINK_ID = 'uplifters-site-builder-blocks-responsive-editor-css';

	const DEFAULT_POSITION = {
		top: 72,
		right: 24,
	};

	const devices = [
		{
			key: 'desktop',
			label: __('Desktop', 'uplifters-site-builder-blocks'),
		},
		{
			key: 'tablet',
			label: __('Tablet', 'uplifters-site-builder-blocks'),
		},
		{
			key: 'mobile',
			label: __('Mobile', 'uplifters-site-builder-blocks'),
		},
	];


	function getDevice() {
		const savedDevice = window.localStorage.getItem(STORE_KEY);
		return devices.some(function (device) {
			return device.key === savedDevice;
		})
			? savedDevice
			: DEFAULT_DEVICE;
	}

	function getPosition() {
		try {
			const saved = window.localStorage.getItem(POSITION_KEY);

			if (!saved) {
				return DEFAULT_POSITION;
			}

			const parsed = JSON.parse(saved);

			return {
				top: Number.isFinite(parsed.top)
					? parsed.top
					: DEFAULT_POSITION.top,
				right: Number.isFinite(parsed.right)
					? parsed.right
					: DEFAULT_POSITION.right,
			};
		} catch (error) {
			return DEFAULT_POSITION;
		}
	}

	function savePosition(position) {
		window.localStorage.setItem(
			POSITION_KEY,
			JSON.stringify(position)
		);
	}

	function resetPosition() {
		window.localStorage.removeItem(POSITION_KEY);
		applyPosition(DEFAULT_POSITION);
	}

	function applyPosition(position) {
		const root = document.getElementById(ROOT_ID);

		if (!root) {
			return;
		}

		const rootWidth = root.offsetWidth || 220;
		const rootHeight = root.offsetHeight || 50;
		const maxTop = Math.max(48, window.innerHeight - rootHeight - 8);
		const maxRight = Math.max(8, window.innerWidth - rootWidth - 8);
		const top = Math.max(48, Math.min(Number(position.top) || DEFAULT_POSITION.top, maxTop));
		const right = Math.max(8, Math.min(Number(position.right) || DEFAULT_POSITION.right, maxRight));

		root.style.top = top + 'px';
		root.style.right = right + 'px';
		root.style.left = 'auto';
		root.style.bottom = 'auto';
	}

	function removeDeviceClasses(element) {
		if (!element || !element.classList) {
			return;
		}

		element.classList.remove(
			'uplifters-site-builder-blocks-device-desktop',
			'uplifters-site-builder-blocks-device-tablet',
			'uplifters-site-builder-blocks-device-mobile'
		);
	}

	function injectIframeStyles(doc) {
		if (!doc || !doc.head || doc === document) {
			return;
		}

		if (doc.getElementById(IFRAME_STYLE_ID)) {
			return;
		}

		const sourceLink = document.getElementById(EDITOR_STYLE_LINK_ID);

		if (!sourceLink || !sourceLink.href) {
			return;
		}

		const link = doc.createElement('link');
		link.id = IFRAME_STYLE_ID;
		link.rel = 'stylesheet';
		link.href = sourceLink.href;
		doc.head.appendChild(link);
	}

	function applyDeviceToDocument(doc, device) {
		if (!doc || !doc.documentElement || !doc.body) {
			return;
		}

		removeDeviceClasses(doc.documentElement);
		removeDeviceClasses(doc.body);

		doc.documentElement.classList.add(
			'uplifters-site-builder-blocks-device-' + device
		);

		doc.body.classList.add(
			'uplifters-site-builder-blocks-device-' + device
		);

		injectIframeStyles(doc);
	}

	function applyDeviceClass(device) {
		applyDeviceToDocument(document, device);

		const iframes = document.querySelectorAll('iframe');

		iframes.forEach(function (iframe) {
			try {
				if (
					!iframe.contentDocument ||
					!iframe.contentDocument.body
				) {
					return;
				}

				applyDeviceToDocument(
					iframe.contentDocument,
					device
				);
			} catch (error) {
				// Ignore cross-origin iframe.
			}
		});
	}

	function refreshDeviceSoon() {
		window.requestAnimationFrame(function () {
			applyDeviceClass(getDevice());
			applyPosition(getPosition());
		});
	}

	function setDevice(device) {
		window.localStorage.setItem(STORE_KEY, device);
		applyDeviceClass(device);

		window.dispatchEvent(
			new CustomEvent(
				'uplifters-site-builder-blocks-responsive-device-change',
				{
					detail: {
						device: device,
					},
				}
			)
		);
	}

	function setResponsiveAttribute(attributeName, value) {
		if (
			!wp.data ||
			!wp.data.select ||
			!wp.data.dispatch
		) {
			return;
		}

		const selectedBlock = wp.data
			.select('core/block-editor')
			.getSelectedBlock();

		if (!selectedBlock) {
			return;
		}

		const device = getDevice();

		const currentValue =
			selectedBlock.attributes?.[attributeName] || {};

		wp.data
			.dispatch('core/block-editor')
			.updateBlockAttributes(
				selectedBlock.clientId,
				{
					[attributeName]: {
						...currentValue,
						[device]: value,
					},
				}
			);
	}

	window.UpliftersSiteBuilderBlocksResponsive = {
		getDevice: getDevice,
		setDevice: setDevice,
		setResponsiveAttribute: setResponsiveAttribute,
		resetBarPosition: resetPosition,
		refresh: refreshDeviceSoon,
	};

	function renderDesktopIcon() {
		return createElement(
			'svg',
			{
				width: '20',
				height: '20',
				viewBox: '0 0 24 24',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
			},
			[
				// Monitor outer frame
				createElement('rect', {
					key: 'body',
					className: 'uplifters-site-builder-blocks-device-frame',
					x: '1.5',
					y: '2.5',
					width: '21',
					height: '14',
					rx: '2.2',
					strokeWidth: '1.7',
				}),

				// Screen fill
				createElement('rect', {
					key: 'screen',
					className: 'uplifters-site-builder-blocks-device-screen',
					x: '3.4',
					y: '4.4',
					width: '17.2',
					height: '9.7',
					rx: '1',
				}),

				// Screen glare highlight
				createElement('path', {
					key: 'highlight',
					className: 'uplifters-site-builder-blocks-device-screen-highlight',
					d: 'M5 5.9h5.5',
					strokeWidth: '1',
					strokeLinecap: 'round',
				}),

				// Neck
				createElement('path', {
					key: 'neck',
					className: 'uplifters-site-builder-blocks-device-detail uplifters-site-builder-blocks-device-detail--stroke',
					d: 'M12 16.5v3',
					strokeWidth: '1.7',
					strokeLinecap: 'round',
				}),

				// Stand base
				createElement('path', {
					key: 'base',
					className: 'uplifters-site-builder-blocks-device-detail uplifters-site-builder-blocks-device-detail--stroke',
					d: 'M8.2 21h7.6',
					strokeWidth: '1.9',
					strokeLinecap: 'round',
				}),

				// Power LED dot
				createElement('circle', {
					key: 'power-led',
					className: 'uplifters-site-builder-blocks-device-home',
					cx: '12',
					cy: '15.3',
					r: '0.65',
				}),
			]
		);
	}

	function renderTabletIcon() {
		return createElement(
			'svg',
			{
				width: '20',
				height: '20',
				viewBox: '0 0 24 24',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
			},
			[
				// Tablet outer frame
				createElement('rect', {
					key: 'body',
					className: 'uplifters-site-builder-blocks-device-frame',
					x: '4.2',
					y: '1.5',
					width: '15.6',
					height: '21',
					rx: '3',
					strokeWidth: '1.8',
				}),

				// Screen fill
				createElement('rect', {
					key: 'screen',
					className: 'uplifters-site-builder-blocks-device-screen',
					x: '5.8',
					y: '4.8',
					width: '12.4',
					height: '13',
					rx: '1',
				}),

				// Screen glare highlight
				createElement('path', {
					key: 'highlight',
					className: 'uplifters-site-builder-blocks-device-screen-highlight',
					d: 'M7 6.2h5',
					strokeWidth: '1',
					strokeLinecap: 'round',
				}),

				// Front camera dot
				createElement('circle', {
					key: 'camera',
					className: 'uplifters-site-builder-blocks-device-detail uplifters-site-builder-blocks-device-detail--fill',
					cx: '12',
					cy: '3.1',
					r: '0.65',
				}),

				// Home indicator pill
				createElement('rect', {
					key: 'home',
					className: 'uplifters-site-builder-blocks-device-home',
					x: '10',
					y: '20',
					width: '4',
					height: '1.2',
					rx: '0.6',
				}),
			]
		);
	}






	function renderMobileIcon() {
		return createElement(
			'svg',
			{
				width: '20',
				height: '20',
				viewBox: '0 0 24 24',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
			},
			[
				// Phone outer frame
				createElement('rect', {
					key: 'body',
					className: 'uplifters-site-builder-blocks-device-frame',
					x: '5.5',
					y: '1',
					width: '12',
					height: '22',
					rx: '3.2',
					strokeWidth: '1.9',
				}),

				// Screen fill
				createElement('rect', {
					key: 'screen',
					className: 'uplifters-site-builder-blocks-device-screen',
					x: '7',
					y: '3.5',
					width: '10',
					height: '15.5',
					rx: '2',
				}),

				// Screen glare highlight
				createElement('path', {
					key: 'highlight',
					className: 'uplifters-site-builder-blocks-device-screen-highlight',
					d: 'M8.2 5h3.8',
					strokeWidth: '0.9',
					strokeLinecap: 'round',
				}),

				// Dynamic Island pill
				createElement('rect', {
					key: 'notch',
					className: 'uplifters-site-builder-blocks-device-detail uplifters-site-builder-blocks-device-detail--fill',
					x: '9.8',
					y: '4.2',
					width: '4.4',
					height: '1.6',
					rx: '0.8',
				}),

				// Volume up

				// Volume down
		
				// Power button
			

				// Home indicator bar
				createElement('rect', {
					key: 'home',
					className: 'uplifters-site-builder-blocks-device-home',
					x: '9.5',
					y: '20.4',
					width: '5',
					height: '1.3',
					rx: '0.65',
				}),
			]
		);
	}







	

	function renderDeviceIcon(device) {
		if (device === 'desktop') {
			return renderDesktopIcon();
		}

		if (device === 'tablet') {
			return renderTabletIcon();
		}

		return renderMobileIcon();
	}

	function FloatingResponsiveBar() {
		const [activeDevice, setActiveDevice] =
			useState(getDevice());

		useEffect(
			function () {
				applyDeviceClass(activeDevice);
				applyPosition(getPosition());

				const interval = window.setInterval(
					function () {
						applyDeviceClass(getDevice());
						applyPosition(getPosition());
					},
					700
				);

				const observer = new MutationObserver(
					function () {
						refreshDeviceSoon();
					}
				);

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});

				return function () {
					window.clearInterval(interval);
					observer.disconnect();
				};
			},
			[activeDevice]
		);

		function startDrag(event) {
			event.preventDefault();

			const pointer = event.touches
				? event.touches[0]
				: event;

			const startX = pointer.clientX;
			const startY = pointer.clientY;
			const startPosition = getPosition();

			function onMove(moveEvent) {
				const movePointer = moveEvent.touches
					? moveEvent.touches[0]
					: moveEvent;

				if (!movePointer) {
					return;
				}

				const deltaX =
					movePointer.clientX - startX;

				const deltaY =
					movePointer.clientY - startY;

				let nextTop =
					startPosition.top + deltaY;

				let nextRight =
					startPosition.right - deltaX;

				const maxTop =
					window.innerHeight - 56;

				const maxRight =
					window.innerWidth - 120;

				nextTop = Math.max(
					48,
					Math.min(nextTop, maxTop)
				);

				nextRight = Math.max(
					8,
					Math.min(nextRight, maxRight)
				);

				const nextPosition = {
					top: nextTop,
					right: nextRight,
				};

				applyPosition(nextPosition);
				savePosition(nextPosition);
			}

			function onEnd() {
				document.removeEventListener(
					'mousemove',
					onMove
				);

				document.removeEventListener(
					'mouseup',
					onEnd
				);

				document.removeEventListener(
					'touchmove',
					onMove
				);

				document.removeEventListener(
					'touchend',
					onEnd
				);
			}

			document.addEventListener(
				'mousemove',
				onMove
			);

			document.addEventListener(
				'mouseup',
				onEnd
			);

			document.addEventListener(
				'touchmove',
				onMove,
				{
					passive: false,
				}
			);

			document.addEventListener(
				'touchend',
				onEnd
			);
		}

		return createElement(
			'div',
			{
				className:
					'uplifters-site-builder-blocks-responsive-floating-bar',
				role: 'toolbar',
				'aria-label': __(
					'Responsive preview controls',
					'uplifters-site-builder-blocks'
				),
			},

			createElement(
				'button',
				{
					type: 'button',
					className:
						'uplifters-site-builder-blocks-responsive-drag-handle',
					onMouseDown: startDrag,
					onTouchStart: startDrag,
					title: __(
						'Drag responsive bar',
						'uplifters-site-builder-blocks'
					),
					'aria-label': __(
						'Drag responsive bar',
						'uplifters-site-builder-blocks'
					),
				},
				'⋮⋮'
			),

			devices.map(function (device) {
				const isActive =
					activeDevice === device.key;

				return createElement(
					Tooltip,
					{
						key: device.key,
						text: device.label,
					},
					createElement(
						Button,
						{
							className:
								'uplifters-site-builder-blocks-responsive-device-button' +
								(isActive
									? ' is-active'
									: ''),
							onClick: function () {
								setDevice(device.key);
								setActiveDevice(
									device.key
								);
							},
							'aria-pressed':
								isActive,
							label: device.label,
						},
						createElement(
							'span',
							{
								className:
									'uplifters-site-builder-blocks-responsive-device-icon ' +
									'uplifters-site-builder-blocks-responsive-' +
									device.key +
									'-icon',
								'aria-hidden': true,
							},
							renderDeviceIcon(
								device.key
							)
						)
					)
				);
			}),

			createElement(
				Tooltip,
				{
					text: __(
						'Reset position',
						'uplifters-site-builder-blocks'
					),
				},
				createElement(
					Button,
					{
						className:
							'uplifters-site-builder-blocks-responsive-reset-button',
						onClick: function () {
							resetPosition();
						},
						label: __(
							'Reset position',
							'uplifters-site-builder-blocks'
						),
					},
					'↺'
				)
			)
		);
	}

	function mountFloatingBar() {
		if (document.getElementById(ROOT_ID)) {
			refreshDeviceSoon();
			return;
		}

		const root = document.createElement('div');

		root.id = ROOT_ID;
		document.body.appendChild(root);

		applyPosition(getPosition());

		if (wp.element.createRoot) {
			wp.element
				.createRoot(root)
				.render(
					createElement(
						FloatingResponsiveBar
					)
				);
		} else if (wp.element.render) {
			wp.element.render(
				createElement(
					FloatingResponsiveBar
				),
				root
			);
		} else {
			console.warn(
				'UPLIFTERS_SITE_BUILDER_BLOCKS Responsive: React render function not found.'
			);
		}

		applyDeviceClass(getDevice());
	}

	wp.domReady(function () {
		mountFloatingBar();
		window.addEventListener('resize', refreshDeviceSoon);

		window.setTimeout(
			mountFloatingBar,
			500
		);

		window.setTimeout(
			mountFloatingBar,
			1500
		);

		window.setTimeout(
			refreshDeviceSoon,
			2500
		);
	});
})(window.wp);

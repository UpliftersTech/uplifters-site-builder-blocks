(function () {
	'use strict';

	document.querySelectorAll('.uplifters-site-builder-blocks-popup-scroll-modal').forEach((popupScrollModal) => {
		if (
			popupScrollModal.dataset.upliftersSiteBuilderBlocksPopupScrollModalInitialized === 'true'
		) {
			return;
		}

		popupScrollModal.dataset.upliftersSiteBuilderBlocksPopupScrollModalInitialized = 'true';

		const dialog = popupScrollModal.querySelector(
			'.uplifters-site-builder-blocks-popup-scroll-modal__dialog'
		);

		const backdrop = popupScrollModal.querySelector(
			'.uplifters-site-builder-blocks-popup-scroll-modal__backdrop'
		);

		const closeButtons = popupScrollModal.querySelectorAll(
			'[data-uplifters-site-builder-blocks-popup-scroll-modal-close="true"]'
		);

		const oncePerPage =
			popupScrollModal.dataset.oncePerPage === 'true';

		let hasShown = false;
		let isOpen = false;
		let previouslyFocusedElement = null;
		let closeTimer = null;

		/**
		 * Return the frontend device based on viewport width.
		 *
		 * Desktop: above 1024px.
		 * Tablet: 768px through 1024px.
		 * Mobile: 767px and below.
		 *
		 * @return {string} Current frontend device.
		 */
		const getFrontendDevice = () => {
			if (
				window.matchMedia(
					'(max-width: 767px)'
				).matches
			) {
				return 'mobile';
			}

			if (
				window.matchMedia(
					'(max-width: 1024px)'
				).matches
			) {
				return 'tablet';
			}

			return 'desktop';
		};

		/**
		 * Read the scroll offset for the current frontend device.
		 *
		 * @return {number} Scroll offset in pixels.
		 */
		const getResponsiveScrollOffset = () => {
			const device =
				getFrontendDevice();

			const datasetKey =
				device === 'mobile'
					? 'scrollOffsetMobile'
					: device === 'tablet'
						? 'scrollOffsetTablet'
						: 'scrollOffsetDesktop';

			const fallback =
				device === 'mobile'
					? 200
					: device === 'tablet'
						? 250
						: 300;

			const value = Number.parseInt(
				popupScrollModal.dataset[datasetKey] ||
					String(fallback),
				10
			);

			return Number.isFinite(value)
				? Math.max(0, value)
				: fallback;
		};

		const getFocusableElements = () => {
			if (!dialog) {
				return [];
			}

			return Array.from(
				dialog.querySelectorAll(
					'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			).filter((element) => {
				return (
					element.offsetWidth > 0 ||
					element.offsetHeight > 0 ||
					element ===
						document.activeElement
				);
			});
		};

		const setPageScrollLocked = (
			shouldLock
		) => {
			if (shouldLock) {
				if (
					!document.body.dataset
						.upliftersSiteBuilderBlocksPopupScrollModalOriginalOverflow
				) {
					document.body.dataset
						.upliftersSiteBuilderBlocksPopupScrollModalOriginalOverflow =
						document.body.style
							.overflow || '';
				}

				document.body.style.overflow =
					'hidden';

				return;
			}

			const openPopupScrollModalElement =
				document.querySelector(
					'.uplifters-site-builder-blocks-popup-scroll-modal[aria-hidden="false"]'
				);

			if (openPopupScrollModalElement) {
				return;
			}

			document.body.style.overflow =
				document.body.dataset
					.upliftersSiteBuilderBlocksPopupScrollModalOriginalOverflow ||
				'';

			delete document.body.dataset
				.upliftersSiteBuilderBlocksPopupScrollModalOriginalOverflow;
		};

		const openPopupScrollModal = () => {
			if (
				isOpen ||
				(oncePerPage && hasShown)
			) {
				return;
			}

			if (closeTimer) {
				window.clearTimeout(
					closeTimer
				);

				closeTimer = null;
			}

			hasShown = true;
			isOpen = true;

			previouslyFocusedElement =
				document.activeElement;

			popupScrollModal.style.display = 'flex';
			popupScrollModal.style.alignItems = 'center';
			popupScrollModal.style.justifyContent =
				'center';

			popupScrollModal.setAttribute(
				'aria-hidden',
				'false'
			);

			setPageScrollLocked(true);

			window.requestAnimationFrame(
				() => {
					if (backdrop) {
						backdrop.style.opacity =
							'1';
					}

					if (dialog) {
						dialog.style.opacity =
							'1';

						dialog.style.transform =
							'translateY(0) scale(1)';

						dialog.focus({
							preventScroll: true,
						});
					}
				}
			);

			if (oncePerPage) {
				window.removeEventListener(
					'scroll',
					handleScroll
				);
			}
		};

		const closePopupScrollModal = () => {
			if (!isOpen) {
				return;
			}

			isOpen = false;

			if (backdrop) {
				backdrop.style.opacity = '0';
			}

			if (dialog) {
				dialog.style.opacity = '0';

				dialog.style.transform =
					'translateY(24px) scale(0.96)';
			}

			popupScrollModal.setAttribute(
				'aria-hidden',
				'true'
			);

			closeTimer = window.setTimeout(
				() => {
					if (
						popupScrollModal.getAttribute(
							'aria-hidden'
						) === 'true'
					) {
						popupScrollModal.style.display =
							'none';
					}

					setPageScrollLocked(false);

					if (
						previouslyFocusedElement &&
						typeof previouslyFocusedElement
							.focus ===
							'function'
					) {
						previouslyFocusedElement.focus(
							{
								preventScroll:
									true,
							}
						);
					}
				},
				300
			);
		};

		function handleScroll() {
			const currentScroll =
				window.scrollY ||
				window.pageYOffset ||
				document.documentElement
					.scrollTop ||
				0;

			const responsiveScrollOffset =
				getResponsiveScrollOffset();

			if (
				currentScroll >=
				responsiveScrollOffset
			) {
				openPopupScrollModal();
			}
		}

		const handleResize = () => {
			if (!isOpen) {
				handleScroll();
			}
		};

		const handleKeydown = (event) => {
			if (!isOpen) {
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				closePopupScrollModal();
				return;
			}

			if (
				event.key !== 'Tab' ||
				!dialog
			) {
				return;
			}

			const focusableElements =
				getFocusableElements();

			if (
				focusableElements.length === 0
			) {
				event.preventDefault();
				dialog.focus();
				return;
			}

			const firstElement =
				focusableElements[0];

			const lastElement =
				focusableElements[
					focusableElements.length - 1
				];

			if (
				event.shiftKey &&
				document.activeElement ===
					firstElement
			) {
				event.preventDefault();
				lastElement.focus();
				return;
			}

			if (
				!event.shiftKey &&
				document.activeElement ===
					lastElement
			) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		closeButtons.forEach((button) => {
			button.addEventListener(
				'click',
				closePopupScrollModal
			);
		});

		document.addEventListener(
			'keydown',
			handleKeydown
		);

		window.addEventListener(
			'scroll',
			handleScroll,
			{
				passive: true,
			}
		);

		window.addEventListener(
			'resize',
			handleResize,
			{
				passive: true,
			}
		);

		handleScroll();
	});
})();

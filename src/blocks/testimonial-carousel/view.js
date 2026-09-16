(function () {
	const READY = () =>
		document.readyState === 'complete' || document.readyState === 'interactive';

	const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

	function prefersReducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function getViewportDevice() {
		const width = window.innerWidth || document.documentElement.clientWidth || 1200;

		if (width <= 640) return 'mobile';
		if (width <= 1024) return 'tablet';

		return 'desktop';
	}

	function getResponsiveNumber(root, baseName, fallback) {
		const device = getViewportDevice();
		const value = Number(root.dataset[baseName + device.charAt(0).toUpperCase() + device.slice(1)] || fallback);

		return Number.isFinite(value) ? value : fallback;
	}

	function getPerView(root) {
		const device = getViewportDevice();

		if (device === 'mobile') {
			return clamp(Number(root.dataset.perMobile || 1), 1, 2);
		}

		if (device === 'tablet') {
			return clamp(Number(root.dataset.perTablet || 2), 1, 4);
		}

		return clamp(Number(root.dataset.perDesktop || 3), 1, 6);
	}

	function setStyles(element, styles) {
		Object.keys(styles).forEach((property) => {
			element.style[property] = styles[property];
		});
	}

	function makeButton(label, direction) {
		const button = document.createElement('button');

		button.type = 'button';
		button.setAttribute('aria-label', label);
		button.setAttribute('data-dir', direction);

		setStyles(button, {
			position: 'absolute',
			top: '50%',
			transform: 'translateY(-50%)',
			width: '40px',
			height: '40px',
			borderRadius: '9999px',
			border: '1px solid #e5e7eb',
			backgroundColor: '#ffffff',
			boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			userSelect: 'none',
			zIndex: '5',
			padding: '0',
			margin: '0',
			lineHeight: '1',
			boxSizing: 'border-box'
		});

		button.innerHTML = direction === 'prev' ? '&#10094;' : '&#10095;';

		return button;
	}

	function initOne(root) {
		const viewport = root.querySelector('.uplifters-site-builder-blocks-testimonial-carousel-slider__viewport');
		const track = root.querySelector('.uplifters-site-builder-blocks-testimonial-carousel-slider__track');
		const dotsWrap = root.querySelector('.uplifters-site-builder-blocks-testimonial-carousel-slider__dots');

		if (!viewport || !track) return;
		if (root.__upliftersSiteBuilderBlocksTestimonialCarouselInited) return;
		root.__upliftersSiteBuilderBlocksTestimonialCarouselInited = true;

		const originalCards = Array.from(
			track.querySelectorAll('.uplifters-site-builder-blocks-testimonial-carousel-slider__card')
		).filter((card) => window.getComputedStyle(card).display !== 'none');

		if (originalCards.length <= 1) {
			if (dotsWrap) {
				dotsWrap.style.display = 'none';
			}
			return;
		}

		const autoplay = root.dataset.autoplay === '1';
		const pauseHover = root.dataset.pauseHover === '1';
		const intervalMs = clamp(Number(root.dataset.interval || 3500), 1000, 15000);
		const speedMs = clamp(Number(root.dataset.speed || 650), 150, 2000);
		const showArrows = root.dataset.showArrows === '1';
		const showDots = root.dataset.showDots === '1';

		const total = originalCards.length;
		const maxPerView = Math.max(
			clamp(Number(root.dataset.perDesktop || 3), 1, 6),
			clamp(Number(root.dataset.perTablet || 2), 1, 4),
			clamp(Number(root.dataset.perMobile || 1), 1, 2)
		);

		let timer = null;

		/**
		 * Whole clone sets are placed before and after the real cards, enough of
		 * them to keep a full screen of cards on either side at every breakpoint.
		 * Sliding therefore never runs out of cards on the right, and the silent
		 * jump back onto the real set happens far outside the viewport.
		 */
		const cloneSets = Math.max(1, Math.ceil(maxPerView / total));
		const leadingClones = document.createDocumentFragment();
		const trailingClones = document.createDocumentFragment();

		for (let set = 0; set < cloneSets; set++) {
			originalCards.forEach((card) => {
				const before = card.cloneNode(true);
				const after = card.cloneNode(true);

				before.setAttribute('data-clone', 'before');
				after.setAttribute('data-clone', 'after');
				before.setAttribute('aria-hidden', 'true');
				after.setAttribute('aria-hidden', 'true');

				leadingClones.appendChild(before);
				trailingClones.appendChild(after);
			});
		}

		track.insertBefore(leadingClones, track.firstChild);
		track.appendChild(trailingClones);

		const allCards = Array.from(track.querySelectorAll('.uplifters-site-builder-blocks-testimonial-carousel-slider__card'));

		// Slot of the leftmost visible card inside allCards; kept inside the
		// real set ([baseSlot, baseSlot + total)) by normalizePosition().
		const baseSlot = total * cloneSets;

		let position = baseSlot;
		let index = 0;

		let step = 0;
		let perView = 1;

		function setCardWidths() {
			perView = getPerView(root);

			const gap = getResponsiveNumber(root, 'gap', 16);
			const minCard = clamp(getResponsiveNumber(root, 'minCard', 280), 180, 520);
			const viewportRect = viewport.getBoundingClientRect();
			const viewportWidth = viewportRect.width || 0;
			const idealWidth = (viewportWidth - gap * (perView - 1)) / perView;
			const cardWidth = Math.max(minCard, Math.floor(idealWidth));

			track.style.gap = `${gap}px`;

			allCards.forEach((card) => {
				card.style.width = `${cardWidth}px`;
			});

			step = cardWidth + gap;
		}

		function setTransform(px, animate) {
			track.style.transition = animate ? `transform ${speedMs}ms ease` : 'none';
			track.style.transform = `translateX(-${px}px)`;
		}

		function toRealIndex(slot) {
			return ((slot % total) + total) % total;
		}

		function goTo(slot, animate) {
			position = slot;
			index = toRealIndex(position);

			setTransform(position * step, animate);
			updateDots();
		}

		/**
		 * Pulls the track back onto the middle (real) set without animating, so an
		 * endless run of "next" keeps sliding right to left with no visible rewind.
		 */
		function normalizePosition() {
			const normalized = baseSlot + toRealIndex(position);

			if (normalized === position) return;

			// A whole set away shows the very same cards, so this jump is invisible
			// even when it lands in the middle of a running transition.
			position = normalized;

			setTransform(position * step, false);

			// Flush the jump so the next animated move starts from the new offset.
			void track.offsetWidth;
		}

		function updateDots() {
			if (!showDots || !dotsWrap) return;

			const dots = Array.from(dotsWrap.querySelectorAll('button[data-dot]'));

			dots.forEach((dot) => {
				const dotIndex = Number(dot.getAttribute('data-dot'));
				const isActive = dotIndex === index;

				dot.style.opacity = isActive ? '1' : '0.4';
				dot.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
			});
		}

		function buildDots() {
			if (!dotsWrap) return;

			if (!showDots) {
				dotsWrap.style.display = 'none';
				return;
			}

			dotsWrap.style.display = 'flex';
			dotsWrap.innerHTML = '';

			for (let i = 0; i < originalCards.length; i++) {
				const button = document.createElement('button');

				button.type = 'button';
				button.setAttribute('data-dot', String(i));
				button.setAttribute('aria-label', `Go to slide ${i + 1}`);

				setStyles(button, {
					width: '10px',
					height: '10px',
					borderRadius: '9999px',
					border: '1px solid #e5e7eb',
					backgroundColor: '#ffffff',
					cursor: 'pointer',
					padding: '0',
					margin: '0',
					transition: 'opacity 200ms ease, transform 200ms ease',
					boxSizing: 'border-box'
				});

				button.addEventListener('click', () => {
					goTo(baseSlot + i, true);
					restart();
				});

				dotsWrap.appendChild(button);
			}

			updateDots();
		}

		let prevButton = null;
		let nextButton = null;

		function buildArrows() {
			if (!showArrows) return;

			const sliderRoot = root.querySelector('.uplifters-site-builder-blocks-testimonial-carousel-slider');
			if (!sliderRoot) return;

			prevButton = makeButton('Previous slide', 'prev');
			nextButton = makeButton('Next slide', 'next');

			prevButton.style.left = '8px';
			nextButton.style.right = '8px';

			prevButton.addEventListener('click', () => {
				goPrev();
				restart();
			});

			nextButton.addEventListener('click', () => {
				goNext();
				restart();
			});

			sliderRoot.appendChild(prevButton);
			sliderRoot.appendChild(nextButton);
		}

		function goNext() {
			// Re-anchor first so a burst of clicks can never outrun the clones.
			normalizePosition();
			goTo(position + 1, true);
		}

		function goPrev() {
			normalizePosition();
			goTo(position - 1, true);
		}

		function start() {
			if (!autoplay) return;
			if (prefersReducedMotion()) return;

			stop();
			timer = window.setInterval(goNext, intervalMs);
		}

		function stop() {
			if (timer) {
				window.clearInterval(timer);
			}
			timer = null;
		}

		function restart() {
			if (!autoplay) return;
			start();
		}

		function onTransitionEnd(event) {
			if (event && event.target !== track) return;
			if (step <= 0) return;

			normalizePosition();
		}

		function onResize() {
			setCardWidths();
			goTo(position, false);
		}

		setCardWidths();
		goTo(position, false);
		buildArrows();
		buildDots();
		track.addEventListener('transitionend', onTransitionEnd);

		if (pauseHover) {
			root.addEventListener('mouseenter', stop);
			root.addEventListener('mouseleave', start);
		}

		let startX = null;

		viewport.addEventListener(
			'touchstart',
			(event) => {
				if (!event.touches || !event.touches[0]) return;
				startX = event.touches[0].clientX;
			},
			{ passive: true }
		);

		viewport.addEventListener(
			'touchend',
			(event) => {
				if (startX === null) return;

				const endX =
					event.changedTouches && event.changedTouches[0]
						? event.changedTouches[0].clientX
						: null;

				if (endX === null) return;

				const diffX = endX - startX;
				startX = null;

				if (Math.abs(diffX) < 40) return;

				if (diffX < 0) {
					goNext();
				} else {
					goPrev();
				}

				restart();
			},
			{ passive: true }
		);

		let resizeTimer = null;

		window.addEventListener('resize', () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(onResize, 150);
		});

		start();
	}

	function boot() {
		const blocks = document.querySelectorAll(
			'.uplifters-site-builder-blocks-testimonial-carousel[data-uplifters-site-builder-blocks-testimonial-carousel-slider="testimonial-carousel"]'
		);

		blocks.forEach(initOne);
	}

	if (READY()) {
		boot();
	} else {
		document.addEventListener('DOMContentLoaded', boot);
	}
})();

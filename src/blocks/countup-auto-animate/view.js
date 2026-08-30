(function () {
	'use strict';

	function getEndValue(el) {
		var endValue = parseInt(el.getAttribute('data-count'), 10);
		return isNaN(endValue) ? 0 : endValue;
	}

	function resetNumber(el) {
		if (!el) {
			return;
		}

		if (el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame) {
			window.cancelAnimationFrame(parseInt(el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame, 10));
			delete el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame;
		}

		delete el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateRunning;
		el.textContent = '0';
	}

	function animateNumber(el) {
		if (!el) {
			return;
		}

		if (el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame) {
			window.cancelAnimationFrame(parseInt(el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame, 10));
			delete el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame;
		}

		var endValue = getEndValue(el);
		var duration = 2000;
		var startTime = null;

		el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateRunning = 'true';
		el.textContent = '0';

		function step(timestamp) {
			if (el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateRunning !== 'true') {
				return;
			}

			if (!startTime) {
				startTime = timestamp;
			}

			var progress = Math.min((timestamp - startTime) / duration, 1);
			var easedProgress = 1 - Math.pow(1 - progress, 3);
			var currentValue = Math.floor(easedProgress * endValue);

			el.textContent = String(currentValue);

			if (progress < 1) {
				el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame = String(window.requestAnimationFrame(step));
			} else {
				el.textContent = String(endValue);
				delete el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateRunning;
				delete el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame;
			}
		}

		el.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateFrame = String(window.requestAnimationFrame(step));
	}

	function initCountupAutoAnimate() {
		var numbers = Array.prototype.slice.call(
			document.querySelectorAll('.uplifters-site-builder-blocks-countup-auto-animate__number:not([data-uplifters-site-builder-blocks-countup-auto-animate-bound="true"])')
		);

		if (!numbers.length) {
			return;
		}

		numbers.forEach(function (numberEl) {
			numberEl.dataset.upliftersSiteBuilderBlocksCountupAutoAnimateBound = 'true';
			numberEl.textContent = '0';
		});

		if ('IntersectionObserver' in window) {
			var observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						animateNumber(entry.target);
					} else {
						resetNumber(entry.target);
					}
				});
			}, { threshold: 0.5 });

			numbers.forEach(function (numberEl) {
				observer.observe(numberEl);
			});

			return;
		}

		numbers.forEach(animateNumber);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCountupAutoAnimate);
	} else {
		initCountupAutoAnimate();
	}
})();

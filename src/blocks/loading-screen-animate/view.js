/**
 * Frontend script for the Loading Screen Animated block.
 *
 * Hides the loading overlay rendered by render.php. The overlay is also
 * force-hidden by a pure-CSS animation (see the block's inline styles) as a
 * no-JS safety net, so this script only needs to handle the "hide earlier,
 * respecting the minimum visible time" behavior once the page has loaded.
 */
( function () {
	'use strict';

	/**
	 * Resolve which responsive device bucket the current viewport falls into.
	 * Matches the breakpoints used by the block's PHP-generated CSS
	 * (tablet: <=1024px, mobile: <=767px).
	 *
	 * @return {string} "desktop", "tablet", or "mobile".
	 */
	function getCurrentDevice() {
		var viewportWidth =
			window.innerWidth ||
			document.documentElement.clientWidth ||
			1200;

		if ( viewportWidth <= 767 ) {
			return 'mobile';
		}

		if ( viewportWidth <= 1024 ) {
			return 'tablet';
		}

		return 'desktop';
	}

	/**
	 * Read the max-wait (hard ceiling) in milliseconds for a loader element,
	 * falling back to the desktop value, then to 8000ms.
	 *
	 * @param {HTMLElement} loaderEl The loading screen wrapper element.
	 * @return {number} Milliseconds, never less than 1000.
	 */
	function getMaxWaitMs( loaderEl ) {
		var device = getCurrentDevice();
		var maxWait = Number(
			loaderEl.getAttribute( 'data-max-wait-' + device )
		);

		if ( ! maxWait || maxWait < 1000 ) {
			maxWait =
				Number( loaderEl.getAttribute( 'data-max-wait-desktop' ) ) ||
				8000;
		}

		return Math.max( 1000, maxWait );
	}

	/**
	 * Hide and then remove the loading screen overlay. Idempotent: calling
	 * this more than once for the same element is a no-op after the first
	 * call.
	 *
	 * @param {HTMLElement} loaderEl The loading screen wrapper element.
	 */
	function hideLoader( loaderEl ) {
		if (
			! loaderEl ||
			loaderEl.dataset.upliftersSiteBuilderBlocksLoadingScreenAnimateHidden ===
				'true'
		) {
			return;
		}

		loaderEl.dataset.upliftersSiteBuilderBlocksLoadingScreenAnimateHidden =
			'true';

		loaderEl.classList.add( 'is-hidden' );
		loaderEl.style.setProperty( 'opacity', '0', 'important' );
		loaderEl.style.setProperty( 'visibility', 'hidden', 'important' );
		loaderEl.style.setProperty( 'pointer-events', 'none', 'important' );
		loaderEl.style.setProperty( 'animation', 'none', 'important' );

		loaderEl
			.querySelectorAll(
				'.uplifters-site-builder-blocks-loading-screen-animate__shine'
			)
			.forEach( function ( shineEl ) {
				shineEl.style.setProperty( 'animation', 'none', 'important' );
			} );

		// Remove from the DOM only after the hide transition has had time to run.
		window.setTimeout( function () {
			if ( loaderEl && loaderEl.parentNode ) {
				loaderEl.parentNode.removeChild( loaderEl );
			}
		}, 450 );
	}

	/**
	 * Hide the loader once the page has finished loading, but never before
	 * the configured minimum visible time has elapsed (so the animation
	 * doesn't flash on fast-loading pages).
	 *
	 * @param {HTMLElement} loaderEl  The loading screen wrapper element.
	 * @param {number}      startedAt Date.now() timestamp taken when init() ran.
	 */
	function hideAfterMinimumVisibleTime( loaderEl, startedAt ) {
		var minVisibleMs =
			Number( loaderEl.getAttribute( 'data-min-visible' ) ) || 0;
		var elapsedMs = Date.now() - startedAt;

		window.setTimeout( function () {
			hideLoader( loaderEl );
		}, Math.max( 0, minVisibleMs - elapsedMs ) );
	}

	/**
	 * Initialize a single loading screen instance. Idempotent so re-running
	 * init() (from the DOMContentLoaded and load listeners below) never
	 * double-binds behavior for the same element.
	 *
	 * @param {HTMLElement} loaderEl The loading screen wrapper element.
	 */
	function initLoader( loaderEl ) {
		if (
			! loaderEl ||
			loaderEl.dataset
				.upliftersSiteBuilderBlocksLoadingScreenAnimateInitialized ===
				'true'
		) {
			return;
		}

		loaderEl.dataset.upliftersSiteBuilderBlocksLoadingScreenAnimateInitialized =
			'true';

		var startedAt = Date.now();

		// Hard ceiling: always hide after max-wait, even if window "load" never fires.
		window.setTimeout( function () {
			hideLoader( loaderEl );
		}, getMaxWaitMs( loaderEl ) );

		if ( document.readyState === 'complete' ) {
			hideAfterMinimumVisibleTime( loaderEl, startedAt );
			return;
		}

		window.addEventListener(
			'load',
			function () {
				hideAfterMinimumVisibleTime( loaderEl, startedAt );
			},
			{ once: true }
		);
	}

	/**
	 * Find and initialize every loading screen instance currently in the DOM.
	 */
	function init() {
		document
			.querySelectorAll(
				'[data-uplifters-site-builder-blocks-loading-screen-animate="true"]'
			)
			.forEach( initLoader );
	}

	init();

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init, { once: true } );
	}

	window.addEventListener( 'load', init, { once: true } );
} )();

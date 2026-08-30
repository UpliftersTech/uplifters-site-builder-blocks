/**
 * Frontend script for the ScrollToTop block.
 *
 * Toggles the button's visibility based on how far the visitor has scrolled
 * and sends the page back to the top when the button is clicked.
 */

( function () {
	'use strict';

	var SELECTOR = '.uplifters-scroll-to-top-wrapper';

	function getScrollTop() {
		var doc = document.documentElement;
		var body = document.body;

		return window.pageYOffset || doc.scrollTop || ( body ? body.scrollTop : 0 ) || 0;
	}

	function prefersReducedMotion() {
		return (
			!! window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	function init() {
		var wrappers = document.querySelectorAll( SELECTOR );

		if ( ! wrappers.length ) {
			return;
		}

		var instances = [];

		Array.prototype.forEach.call( wrappers, function ( wrapper ) {
			var button = wrapper.querySelector( '.uplifters-scroll-to-top' );

			if ( ! button ) {
				return;
			}

			button.addEventListener( 'click', function () {
				window.scrollTo( {
					top: 0,
					behavior: prefersReducedMotion() ? 'auto' : 'smooth',
				} );
			} );

			var showAfter = parseInt(
				wrapper.getAttribute( 'data-show-after' ),
				10
			);

			instances.push( {
				wrapper: wrapper,
				hideAtStart:
					'true' === wrapper.getAttribute( 'data-hide-at-start' ),
				showAfter: isNaN( showAfter ) ? 300 : showAfter,
				hidden: null,
			} );
		} );

		if ( ! instances.length ) {
			return;
		}

		var ticking = false;

		function update() {
			ticking = false;

			var scrollTop = getScrollTop();

			instances.forEach( function ( instance ) {
				var shouldHide =
					instance.hideAtStart && scrollTop < instance.showAfter;

				if ( instance.hidden === shouldHide ) {
					return;
				}

				instance.hidden = shouldHide;

				if ( shouldHide ) {
					instance.wrapper.classList.add( 'is-hidden' );
				} else {
					instance.wrapper.classList.remove( 'is-hidden' );
				}
			} );
		}

		function requestUpdate() {
			if ( ticking ) {
				return;
			}

			ticking = true;
			window.requestAnimationFrame( update );
		}

		window.addEventListener( 'scroll', requestUpdate, { passive: true } );
		window.addEventListener( 'resize', requestUpdate, { passive: true } );
		window.addEventListener( 'load', requestUpdate );

		update();
	}

	if ( 'loading' !== document.readyState ) {
		init();
	} else {
		document.addEventListener( 'DOMContentLoaded', init );
	}
} )();

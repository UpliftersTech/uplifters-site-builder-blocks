/**
 * Front end countdown ticking for the UpliftersSiteBuilderBlocks Countdown block.
 */
( function () {
	'use strict';

	var SELECTOR = '.uplifters-site-builder-blocks-countdown-with-msg';

	function padValue( value ) {
		return String( value ).padStart( 2, '0' );
	}

	function getRemaining( target ) {
		var difference = target - Date.now();

		if ( difference <= 0 ) {
			return {
				expired: true,
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
			};
		}

		var totalSeconds = Math.floor( difference / 1000 );

		return {
			expired: false,
			days: Math.floor( totalSeconds / 86400 ),
			hours: Math.floor( ( totalSeconds % 86400 ) / 3600 ),
			minutes: Math.floor( ( totalSeconds % 3600 ) / 60 ),
			seconds: totalSeconds % 60,
		};
	}

	function paint( element, remaining ) {
		var units = element.querySelectorAll(
			'[data-countdown-with-msg-unit]'
		);

		var index;
		var unit;
		var key;
		var number;

		for ( index = 0; index < units.length; index++ ) {
			unit = units[ index ];
			key = unit.getAttribute( 'data-countdown-with-msg-unit' );
			number = unit.querySelector(
				'.uplifters-site-builder-blocks-countdown-with-msg__number'
			);

			if ( number && remaining[ key ] !== undefined ) {
				number.textContent = padValue( remaining[ key ] );
			}
		}
	}

	function expire( element ) {
		var behaviour =
			element.getAttribute( 'data-expired-behaviour' ) ||
			'message';

		if ( 'zeros' === behaviour ) {
			return;
		}

		if ( 'hide' === behaviour ) {
			element.setAttribute( 'hidden', 'hidden' );
			return;
		}

		var units = element.querySelector(
			'.uplifters-site-builder-blocks-countdown-with-msg__units'
		);

		var message = element.querySelector(
			'.uplifters-site-builder-blocks-countdown-with-msg__expired'
		);

		if ( units ) {
			units.setAttribute( 'hidden', 'hidden' );
		}

		if ( message ) {
			message.removeAttribute( 'hidden' );
		}
	}

	function start( element ) {
		if ( element.dataset.countdownReady ) {
			return;
		}

		element.dataset.countdownReady = 'true';

		/**
		 * The stored value is a wall clock time with no zone,
		 * so parsing it here reads it on the local clock of
		 * whoever is looking at the page.
		 */
		var target = Date.parse(
			element.getAttribute( 'data-target' ) || ''
		);

		if ( isNaN( target ) ) {
			return;
		}

		var tick = function () {
			var remaining = getRemaining( target );

			paint( element, remaining );

			if ( remaining.expired ) {
				expire( element );

				if ( element.countdownTimer ) {
					window.clearInterval(
						element.countdownTimer
					);

					element.countdownTimer = null;
				}
			}
		};

		tick();

		element.countdownTimer = window.setInterval( tick, 1000 );
	}

	function init() {
		var elements = document.querySelectorAll( SELECTOR );
		var index;

		for ( index = 0; index < elements.length; index++ ) {
			start( elements[ index ] );
		}
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	if ( 'undefined' !== typeof window.MutationObserver ) {
		var scheduled = null;

		var observer = new window.MutationObserver( function () {
			if ( scheduled ) {
				return;
			}

			scheduled = window.setTimeout( function () {
				scheduled = null;
				init();
			}, 200 );
		} );

		observer.observe( document.documentElement, {
			childList: true,
			subtree: true,
		} );
	}
} )();
